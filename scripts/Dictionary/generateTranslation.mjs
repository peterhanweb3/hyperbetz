#!/usr/bin/env node

import { readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { Chalk } from "chalk";
import ora from "ora";
import Table from "cli-table3";
import OpenAI from "openai";
import prompts from "prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const dictionaryDir = path.join(projectRoot, "Dictionary");

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const isInteractive = process.stdout.isTTY && !process.env.CI;
const color = new Chalk({ level: isInteractive ? 2 : 0 });

const icons = {
	info: "ℹ️ ",
	success: "✅ ",
	warn: "⚠️ ",
	error: "❌ ",
};

function logWithStyle(type, message) {
	const prefix = icons[type] ?? "";
	switch (type) {
		case "success":
			console.log(color.green(`${prefix}${message}`));
			break;
		case "warn":
			console.warn(color.yellow(`${prefix}${message}`));
			break;
		case "error":
			console.error(color.red(`${prefix}${message}`));
			break;
		default:
			console.log(color.cyan(`${prefix}${message}`));
	}
}

const logInfo = (message) => logWithStyle("info", message);
const logSuccess = (message) => logWithStyle("success", message);
const logWarn = (message) => logWithStyle("warn", message);
const logError = (message) => logWithStyle("error", message);

function createSpinner(message) {
	if (!isInteractive) {
		logInfo(`${message}...`);
		return {
			succeed: (text) => logSuccess(text ?? message),
			fail: (text) => logError(text ?? message),
			stop: () => {},
			start: () => {},
		};
	}
	return ora({ text: color.cyan(message) }).start();
}

function parseArgs(argv) {
	const args = argv.slice(2);
	const config = {
		key: undefined,
		text: undefined,
		context: undefined,
		overwrite: false,
		dryRun: false,
		strictPlaceholders: false,
		languages: undefined,
		model: DEFAULT_MODEL,
		inputFile: undefined,
	};

	for (let i = 0; i < args.length; i++) {
		const token = args[i];
		if (token === "--overwrite") {
			config.overwrite = true;
			continue;
		}
		if (token === "--dry-run") {
			config.dryRun = true;
			continue;
		}
		if (token === "--strict-placeholders") {
			config.strictPlaceholders = true;
			continue;
		}

		if (!token.startsWith("--")) {
			throw new Error(`Unexpected argument: ${token}`);
		}

		const key = token.slice(2);
		const value = args[i + 1];
		if (typeof value === "undefined" || value.startsWith("--")) {
			throw new Error(`Option --${key} requires a value.`);
		}
		i++;

		switch (key) {
			case "key":
				config.key = value;
				break;
			case "text":
				config.text = value;
				break;
			case "context":
				config.context = value;
				break;
			case "languages":
				config.languages = value
					.split(",")
					.map((lang) => lang.trim())
					.filter(Boolean);
				break;
			case "input":
				config.inputFile = value;
				break;
			case "model":
				config.model = value;
				break;
			default:
				throw new Error(`Unknown option: --${key}`);
		}
	}

	if (config.inputFile && !config.inputFile.trim()) {
		throw new Error("Provided --input path is empty.");
	}

	return config;
}

function printBanner() {
	if (!isInteractive) {
		return;
	}

	const accent = (value) => color.hex("#a855f7")(value);
	const subtle = (value) => color.hex("#818cf8")(value);

	console.log("");
	console.log(accent("╭────────────────────────────────────╮"));
	console.log(
		`${accent("│")}  ${color
			.bold("AI Dictionary Translator")
			.padEnd(32, " ")} ${accent("│")}`
	);
	console.log(
		`${accent("│")}  ${subtle(
			"Fill in a few prompts and we’ll handle"
		).padEnd(32, " ")} ${accent("│")}`
	);
	console.log(
		`${accent("│")}  ${subtle("translations across every language.").padEnd(
			32,
			" "
		)} ${accent("│")}`
	);
	console.log(accent("╰────────────────────────────────────╯"));
	console.log("");
}

async function promptForConfiguration(config, availableLanguages) {
	if (config.inputFile) {
		config.inputFile = config.inputFile.trim();
		return config;
	}

	config.key = config.key?.trim() || undefined;
	config.text = config.text?.trim() || undefined;

	if (typeof config.context === "string") {
		const trimmedContext = config.context.trim();
		config.context = trimmedContext.length > 0 ? trimmedContext : undefined;
	}

	if (!isInteractive) {
		if (!config.key || !config.text) {
			throw new Error(
				"Missing required options --key and --text. Run in an interactive terminal or pass the flags explicitly."
			);
		}
		if (!config.languages || config.languages.length === 0) {
			config.languages = availableLanguages;
		}
		return config;
	}

	const needsInteractive =
		!config.key ||
		!config.text ||
		!config.languages ||
		config.languages.length === 0;

	if (!needsInteractive) {
		return config;
	}

	printBanner();

	const onCancel = () => {
		logWarn("Translation command cancelled.");
		process.exit(1);
	};

	if (!config.key && !config.text) {
		const { workflow } = await prompts(
			{
				type: "select",
				name: "workflow",
				message: "How would you like to provide entries?",
				initial: 0,
				choices: [
					{ title: "Translate a single key", value: "single" },
					{ title: "Process a JSON batch file", value: "batch" },
				],
			},
			{ onCancel }
		);

		if (workflow === "batch") {
			const { inputFile } = await prompts(
				{
					type: "text",
					name: "inputFile",
					message: "Path to the JSON batch file",
					validate: (value) =>
						value && value.trim().length > 0
							? true
							: "Please provide a file path.",
					format: (value) => value.trim(),
				},
				{ onCancel }
			);
			config.inputFile = inputFile;
			return config;
		}
	}

	if (!config.key) {
		const { key } = await prompts(
			{
				type: "text",
				name: "key",
				message: "Translation key (dot notation)",
				validate: (value) =>
					value && value.trim().length > 0
						? true
						: "Key is required.",
				format: (value) => value.trim(),
			},
			{ onCancel }
		);
		config.key = key;
	}

	if (!config.text) {
		const { text } = await prompts(
			{
				type: "text",
				name: "text",
				message: "English source text",
				validate: (value) =>
					value && value.trim().length > 0
						? true
						: "Source text is required.",
				format: (value) => value.trim(),
			},
			{ onCancel }
		);
		config.text = text;
	}

	if (config.context === undefined) {
		const { context } = await prompts(
			{
				type: "text",
				name: "context",
				message: "Add optional context (press enter to skip)",
				initial: "",
				format: (value) => {
					const trimmed = value?.trim?.() ?? "";
					return trimmed.length > 0 ? trimmed : undefined;
				},
			},
			{ onCancel }
		);
		config.context = context;
	}

	if (!config.languages || config.languages.length === 0) {
		const { languageMode } = await prompts(
			{
				type: "select",
				name: "languageMode",
				message: "Which languages should we update?",
				initial: 0,
				choices: [
					{
						title: `All languages (${availableLanguages.length})`,
						value: "all",
					},
					{
						title: "Choose specific languages",
						value: "custom",
					},
				],
			},
			{ onCancel }
		);

		if (languageMode === "custom") {
			const { selectedLanguages } = await prompts(
				{
					type: "multiselect",
					name: "selectedLanguages",
					message: "Select target languages",
					choices: availableLanguages.map((lang) => ({
						title: lang,
						value: lang,
					})),
					min: 1,
					instructions: false,
					hint: "Space to toggle, enter to confirm",
				},
				{ onCancel }
			);
			config.languages = selectedLanguages;
		} else {
			config.languages = [...availableLanguages];
		}
	}

	const { advanced } = await prompts(
		{
			type: "multiselect",
			name: "advanced",
			message: "Fine-tune the run (space to toggle)",
			instructions: false,
			hint: "Dry run, overwrite, placeholder safety",
			choices: [
				{
					title: "Dry run (preview only)",
					value: "dryRun",
					selected: config.dryRun,
				},
				{
					title: "Overwrite existing keys",
					value: "overwrite",
					selected: config.overwrite,
				},
				{
					title: "Enforce placeholder counts",
					value: "strictPlaceholders",
					selected: config.strictPlaceholders,
				},
			],
		},
		{ onCancel }
	);

	const advancedSelections = Array.isArray(advanced) ? advanced : [];
	config.dryRun = advancedSelections.includes("dryRun");
	config.overwrite = advancedSelections.includes("overwrite");
	config.strictPlaceholders =
		advancedSelections.includes("strictPlaceholders");

	const { model } = await prompts(
		{
			type: "text",
			name: "model",
			message: "OpenAI model (press enter to keep default)",
			initial: config.model,
			format: (value) => value?.trim?.() ?? "",
		},
		{ onCancel }
	);

	if (model && model.length > 0) {
		config.model = model;
	}

	if (!config.languages || config.languages.length === 0) {
		config.languages = [...availableLanguages];
	}

	logInfo(
		`Ready to translate '${config.key}' into ${
			config.languages.length
		} language${config.languages.length === 1 ? "" : "s"}.`
	);

	return config;
}

async function getAvailableLanguages(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
		.map((entry) => path.basename(entry.name, ".json"))
		.sort();
}

function ensureNestedAssignment(target, segments, value, { overwrite }) {
	let current = target;
	for (let i = 0; i < segments.length - 1; i++) {
		const segment = segments[i];
		if (!(segment in current)) {
			current[segment] = {};
		} else if (
			typeof current[segment] !== "object" ||
			current[segment] === null ||
			Array.isArray(current[segment])
		) {
			throw new Error(
				`Cannot set ${segments.join(".")} because ${segments
					.slice(0, i + 1)
					.join(".")} is not an object.`
			);
		}
		current = current[segment];
	}

	const finalKey = segments[segments.length - 1];
	if (finalKey in current && !overwrite) {
		return { changed: false, reason: "exists" };
	}

	current[finalKey] = value;
	return { changed: true };
}

function extractPlaceholderMap(text) {
	const matches =
		typeof text === "string" ? text.match(/{[^{}]+}/g) ?? [] : [];
	const map = new Map();
	for (const placeholder of matches) {
		map.set(placeholder, (map.get(placeholder) ?? 0) + 1);
	}
	return map;
}

function comparePlaceholders(sourceText, translatedText) {
	const sourceMap = extractPlaceholderMap(sourceText);
	const translatedMap = extractPlaceholderMap(translatedText);

	const missing = [];
	for (const [placeholder, expectedCount] of sourceMap.entries()) {
		const actualCount = translatedMap.get(placeholder) ?? 0;
		if (actualCount !== expectedCount) {
			missing.push({
				placeholder,
				expected: expectedCount,
				actual: actualCount,
			});
		}
		translatedMap.delete(placeholder);
	}

	const extras = Array.from(translatedMap.entries()).map(
		([placeholder, actual]) => ({
			placeholder,
			expected: 0,
			actual,
		})
	);

	return {
		valid: missing.length === 0 && extras.length === 0,
		missing,
		extras,
	};
}

function normalizeLanguageList(value) {
	if (!value) {
		return undefined;
	}
	if (Array.isArray(value)) {
		return value.map((lang) => String(lang).trim()).filter(Boolean);
	}
	if (typeof value === "string") {
		return value
			.split(",")
			.map((lang) => lang.trim())
			.filter(Boolean);
	}
	throw new Error("languages must be a string or array of strings.");
}

function createBatchEntry({ key, text, context, languages }, origin = "entry") {
	const trimmedKey = typeof key === "string" ? key.trim() : "";
	if (!trimmedKey) {
		throw new Error(`Missing key in ${origin}.`);
	}
	const trimmedText = typeof text === "string" ? text.trim() : "";
	if (!trimmedText) {
		throw new Error(`Missing text for key '${trimmedKey}' in ${origin}.`);
	}

	return {
		key: trimmedKey,
		text: trimmedText,
		context:
			typeof context === "string" && context.trim().length > 0
				? context.trim()
				: undefined,
		languages: normalizeLanguageList(languages),
	};
}

function normalizeJsonBatch(data) {
	if (Array.isArray(data)) {
		return data.map((entry, index) => {
			if (typeof entry === "string") {
				const [rawKey, rawText, rawContext, rawLanguages] =
					entry.split("|");
				return createBatchEntry(
					{
						key: rawKey,
						text: rawText,
						context: rawContext,
						languages: rawLanguages,
					},
					`entry[${index}]`
				);
			}
			if (!entry || typeof entry !== "object") {
				throw new Error(
					`Entry at index ${index} must be an object or a pipe-delimited string.`
				);
			}
			return createBatchEntry(
				{
					key: entry.key,
					text: entry.text,
					context: entry.context,
					languages: entry.languages,
				},
				`entry[${index}]`
			);
		});
	}

	if (data && typeof data === "object") {
		return Object.entries(data).map(([key, value]) => {
			if (typeof value === "string") {
				return createBatchEntry({ key, text: value }, `key '${key}'`);
			}
			if (!value || typeof value !== "object") {
				throw new Error(
					`Value for key '${key}' must be a string or object.`
				);
			}
			return createBatchEntry(
				{
					key,
					text: value.text,
					context: value.context,
					languages: value.languages,
				},
				`key '${key}'`
			);
		});
	}

	throw new Error("Batch input JSON must be an array or object.");
}

async function loadBatchEntries(inputPath) {
	const absolutePath = path.isAbsolute(inputPath)
		? inputPath
		: path.resolve(process.cwd(), inputPath);
	let raw;
	try {
		raw = await readFile(absolutePath, "utf8");
	} catch (error) {
		throw new Error(
			`Failed to read input file '${inputPath}': ${error.message}`
		);
	}

	if (absolutePath.toLowerCase().endsWith(".json")) {
		let data;
		try {
			data = JSON.parse(raw);
		} catch (error) {
			throw new Error(
				`Failed to parse JSON input '${inputPath}': ${error.message}`
			);
		}
		return normalizeJsonBatch(data);
	}

	throw new Error(
		"Unsupported input format. Provide a .json file containing the batch entries."
	);
}

function buildPrompt({ text, context, languages }) {
	const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
	const formattedLanguages = languages
		.filter((lang) => lang !== "en")
		.map((lang) => {
			try {
				const name = displayNames.of(lang) ?? lang;
				return `${lang} (${name})`;
			} catch {
				return lang;
			}
		})
		.join(", ");

	let instructions = `Translate the provided user interface text into the following target languages: ${
		formattedLanguages || "(none)"
	}.`;
	instructions +=
		" Always preserve placeholders such as {name}, {amount}, {currency}, {total}, etc., exactly as they appear in the source text.";

	if (context) {
		instructions += `\nContext: ${context}`;
	}

	instructions +=
		'\nReturn a strict JSON object using double quotes with the exact shape: {"translations": [{"language": "<code>", "translation": "<text>"}]}';
	instructions +=
		"\nInclude every requested language exactly once. Do not include any additional commentary or Markdown.";

	return [
		{
			role: "system",
			content:
				"You are a localization specialist for a global gaming platform. Respond only with valid JSON that can be parsed directly without extra text.",
		},
		{
			role: "user",
			content: `${instructions}\n\nEnglish source text:\n${text}`,
		},
	];
}

async function fetchTranslations({ client, model, text, context, languages }) {
	const targetLanguages = languages.filter((lang) => lang !== "en");
	if (targetLanguages.length === 0) {
		return [];
	}

	const messages = buildPrompt({ text, context, languages });
	const response = await client.chat.completions.create({
		model,
		messages,
		response_format: { type: "json_object" },
	});

	const content = response.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error("OpenAI response was empty.");
	}

	let parsed;
	try {
		parsed = JSON.parse(content);
	} catch (error) {
		throw new Error(
			`Failed to parse OpenAI response as JSON: ${error.message}\n${content}`
		);
	}

	if (!Array.isArray(parsed.translations)) {
		throw new Error("JSON response is missing a 'translations' array.");
	}

	return parsed.translations.map((entry) => ({
		language: entry.language,
		translation: entry.translation,
	}));
}

function describeChange(result) {
	if (result.changed) {
		return { status: "updated", detail: "Value updated" };
	}
	const reason = result.reason ?? "skipped";
	const detail =
		reason === "exists" ? "Already existed" : `Skipped (${reason})`;
	return { status: reason, detail };
}

async function updateLanguageFile({
	language,
	keySegments,
	value,
	overwrite,
	dryRun,
}) {
	const filePath = path.join(dictionaryDir, `${language}.json`);
	let content;
	try {
		content = await readFile(filePath, "utf8");
	} catch (error) {
		throw new Error(
			`Failed to read dictionary file for ${language}: ${error.message}`
		);
	}

	let data;
	try {
		data = JSON.parse(content);
	} catch (error) {
		throw new Error(
			`Dictionary file ${language}.json contains invalid JSON: ${error.message}`
		);
	}

	const result = ensureNestedAssignment(data, keySegments, value, {
		overwrite,
	});

	if (result.changed && !dryRun) {
		const payload = `${JSON.stringify(data, null, "\t")}\n`;
		await writeFile(filePath, payload, "utf8");
	}

	return result;
}

function renderSummary(rows, stats, { dryRun, startTime }) {
	const table = new Table({
		head: [
			color.bold("Key"),
			color.bold("Lang"),
			color.bold("Status"),
			color.bold("Detail"),
			color.bold("Mode"),
		],
		style: { head: [], border: [] },
	});

	for (const row of rows) {
		const statusColor =
			row.status === "updated"
				? color.green
				: row.status === "error"
				? color.red
				: row.status === "placeholder-mismatch" ||
				  row.status === "missing-translation"
				? color.yellow
				: color.gray;

		table.push([
			row.key,
			row.language,
			statusColor(row.status),
			row.detail,
			row.dryRun ? "dry-run" : "write",
		]);
	}

	const durationMs = Date.now() - startTime;
	const lines = [
		color.bold("Summary"),
		table.toString(),
		color.bold("Stats"),
		`  ${icons.success} Updated: ${stats.updated}${
			dryRun ? " (would write)" : ""
		}`,
		`  ${icons.warn} Skipped: ${stats.skipped}`,
		`  ${icons.warn} Placeholder skips: ${stats.placeholderSkipped}`,
		`  ${icons.warn} Missing translations: ${stats.missing}`,
		`  ${icons.error} Errors: ${stats.errors}`,
		`  ${icons.info} Duration: ${(durationMs / 1000).toFixed(1)}s`,
	];

	if (dryRun) {
		lines.push(color.cyan("Dry run complete. No files were modified."));
	}

	console.log(lines.join("\n"));
}

async function main() {
	let config;
	try {
		config = parseArgs(process.argv);
	} catch (error) {
		logError(error.message);
		logInfo(
			'Usage: npm run i18n:add -- --key profile.newLabel --text "Example text" [--context "Where it appears"] [--languages en,fr,de] [--overwrite] [--dry-run] [--model gpt-4o]'
		);
		process.exit(1);
	}

	const startTime = Date.now();
	const client = new OpenAI({
		apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
	});
	const availableLanguages = await getAvailableLanguages(dictionaryDir);

	try {
		config = await promptForConfiguration(config, availableLanguages);
	} catch (error) {
		logError(error.message);
		process.exit(1);
	}

	if (!config.inputFile && (!config.key || !config.text)) {
		logError("No translation key or text provided.");
		process.exit(1);
	}

	if (!config.languages || config.languages.length === 0) {
		config.languages = availableLanguages;
	}

	let entries;
	if (config.inputFile) {
		try {
			entries = await loadBatchEntries(config.inputFile);
		} catch (error) {
			logError(error.message);
			process.exit(1);
		}
	} else {
		try {
			entries = [
				createBatchEntry(
					{
						key: config.key,
						text: config.text,
						context: config.context,
						languages: config.languages,
					},
					"CLI arguments"
				),
			];
		} catch (error) {
			logError(error.message);
			process.exit(1);
		}
	}

	if (entries.length === 0) {
		logError("No translation entries provided.");
		process.exit(1);
	}

	const defaultRequestedLanguages = config.languages
		? config.languages.filter((lang) => availableLanguages.includes(lang))
		: availableLanguages;

	if (config.languages) {
		const missingDefaults = config.languages.filter(
			(lang) => !availableLanguages.includes(lang)
		);
		if (missingDefaults.length > 0) {
			logWarn(
				`Ignoring unknown languages from CLI defaults: ${missingDefaults.join(
					", "
				)}. Available: ${availableLanguages.join(", ")}`
			);
		}
	}

	logInfo(
		`Processing ${entries.length} entr${
			entries.length === 1 ? "y" : "ies"
		} with model '${config.model}'.`
	);

	const summaryRows = [];
	const stats = {
		updated: 0,
		skipped: 0,
		placeholderSkipped: 0,
		missing: 0,
		errors: 0,
	};

	for (const entry of entries) {
		const keySegments = entry.key
			.split(".")
			.map((segment) => segment.trim())
			.filter(Boolean);

		if (keySegments.length === 0) {
			logWarn(
				`Skipping '${entry.key}' because it is not a valid dotted path.`
			);
			summaryRows.push({
				key: entry.key,
				language: "-",
				status: "invalid-key",
				detail: "Invalid translation key path",
				changed: false,
				dryRun: config.dryRun,
			});
			stats.skipped += 1;
			continue;
		}

		const entryLanguagesRaw = entry.languages ?? defaultRequestedLanguages;
		const entryLanguages = entryLanguagesRaw.filter((lang) =>
			availableLanguages.includes(lang)
		);
		const missingEntryLanguages = entryLanguagesRaw.filter(
			(lang) => !availableLanguages.includes(lang)
		);
		if (missingEntryLanguages.length > 0) {
			logWarn(
				`Entry '${
					entry.key
				}' has unknown languages: ${missingEntryLanguages.join(
					", "
				)}. They will be ignored.`
			);
		}

		const languagesToProcess = Array.from(
			new Set([...entryLanguages, "en"])
		).filter((lang) => availableLanguages.includes(lang));

		let translations = [];
		if (languagesToProcess.some((lang) => lang !== "en")) {
			const spinner = createSpinner(
				`Translating '${entry.key}' for ${languagesToProcess
					.filter((lang) => lang !== "en")
					.join(", ")}`
			);
			try {
				translations = await fetchTranslations({
					client,
					model: config.model,
					text: entry.text,
					context: entry.context ?? config.context,
					languages: languagesToProcess,
				});
				spinner.succeed(`Translated '${entry.key}'.`);
			} catch (error) {
				spinner.fail(`Failed to translate '${entry.key}'.`);
				logError(
					`Failed to fetch translations for '${entry.key}': ${error.message}`
				);
				summaryRows.push({
					key: entry.key,
					language:
						languagesToProcess
							.filter((lang) => lang !== "en")
							.join(", ") || "-",
					status: "error",
					detail: error.message,
					changed: false,
					dryRun: config.dryRun,
				});
				stats.errors += 1;
				continue;
			}
		}

		const translationMap = new Map(
			translations.map((item) => [item.language, item.translation])
		);

		for (const language of languagesToProcess) {
			const value =
				language === "en" ? entry.text : translationMap.get(language);
			if (!value) {
				logWarn(
					`Missing translation for '${entry.key}' in ${language}; skipping.`
				);
				summaryRows.push({
					key: entry.key,
					language,
					status: "missing-translation",
					detail: "No translation returned by model",
					changed: false,
					dryRun: config.dryRun,
				});
				stats.missing += 1;
				continue;
			}

			if (language !== "en") {
				const placeholderCheck = comparePlaceholders(entry.text, value);
				if (!placeholderCheck.valid) {
					const missing = placeholderCheck.missing
						.map(
							(item) =>
								`${item.placeholder} (expected ${item.expected}, got ${item.actual})`
						)
						.join(", ");
					const extras = placeholderCheck.extras
						.map(
							(item) =>
								`${item.placeholder} (unexpected ${item.actual})`
						)
						.join(", ");
					const details = [
						missing && `missing: ${missing}`,
						extras && `extras: ${extras}`,
					]
						.filter(Boolean)
						.join("; ");
					const message = `Placeholder mismatch for '${
						entry.key
					}' in ${language}${details ? ` (${details})` : ""}.`;
					if (config.strictPlaceholders) {
						logWarn(
							`${message} Skipping due to --strict-placeholders.`
						);
						summaryRows.push({
							key: entry.key,
							language,
							status: "placeholder-mismatch",
							detail: "Skipped due to placeholder mismatch",
							changed: false,
							dryRun: config.dryRun,
						});
						stats.placeholderSkipped += 1;
						continue;
					}
					logWarn(`${message} Writing translation anyway.`);
				}
			}

			try {
				const result = await updateLanguageFile({
					language,
					keySegments,
					value,
					overwrite: config.overwrite,
					dryRun: config.dryRun,
				});
				const change = describeChange(result);
				summaryRows.push({
					key: entry.key,
					language,
					status: change.status,
					detail: change.detail,
					changed: result.changed,
					dryRun: config.dryRun,
				});
				if (result.changed) {
					stats.updated += 1;
					const verb = config.dryRun ? "Would update" : "Updated";
					logSuccess(`${verb} '${entry.key}' for ${language}.`);
				} else {
					stats.skipped += 1;
					logInfo(
						`Skipped '${entry.key}' for ${language}: ${change.detail}.`
					);
				}
			} catch (error) {
				logError(
					`Failed to update ${language}.json for key '${entry.key}': ${error.message}`
				);
				summaryRows.push({
					key: entry.key,
					language,
					status: "error",
					detail: error.message,
					changed: false,
					dryRun: config.dryRun,
				});
				stats.errors += 1;
			}
		}
	}

	renderSummary(summaryRows, stats, { dryRun: config.dryRun, startTime });
}

main().catch((error) => {
	logError(error.message);
	process.exit(1);
});
