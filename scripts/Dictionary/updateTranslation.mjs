#!/usr/bin/env node

/**
 * updateTranslation.mjs
 *
 * Updates a specific translation key's value across all dictionary files in their respective languages.
 *
 * Usage:
 *   node scripts/Dictionary/updateTranslation.mjs <keyPath> <englishValue>
 *
 * Example:
 *   node scripts/Dictionary/updateTranslation.mjs "bonus.title" "Turnover Bonus Program"
 *
 * Features:
 * - Updates the value for a specific key path in all dictionary files
 * - Automatically translates the English value to each target language
 * - Preserves the structure and formatting of JSON files
 * - Shows which files were updated successfully with their translated values
 * - Uses Google Translate API for accurate translations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing all dictionary JSON files
const DICTIONARY_DIR = path.resolve(__dirname, "../../Dictionary");

// Language code mapping (filename to language code for translation)
const LANGUAGE_CODES = {
	"en.json": "en",
	"es.json": "es",
	"fr.json": "fr",
	"de.json": "de",
	"it.json": "it",
	"pt.json": "pt",
	"ru.json": "ru",
	"ja.json": "ja",
	"ko.json": "ko",
	"zh.json": "zh-CN",
	"ar.json": "ar",
	"hi.json": "hi",
	"tr.json": "tr",
	"nl.json": "nl",
	"pl.json": "pl",
	"sv.json": "sv",
	"th.json": "th",
	"vi.json": "vi",
	"fa.json": "fa",
	"ms.json": "ms",
};

/**
 * Translate text using Google Translate API (free endpoint)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLang) {
	// Skip translation for English
	if (targetLang === "en") {
		return text;
	}

	return new Promise((resolve, reject) => {
		const encodedText = encodeURIComponent(text);
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;

		https
			.get(url, (res) => {
				let data = "";

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					try {
						const parsed = JSON.parse(data);
						// The translation is in the first element of the first array
						const translated = parsed[0][0][0];
						resolve(translated);
					} catch (error) {
						console.error(
							`   ⚠️  Translation failed for ${targetLang}, using original text`
						);
						resolve(text); // Fallback to original text
					}
				});
			})
			.on("error", (error) => {
				console.error(
					`   ⚠️  Network error for ${targetLang}, using original text`
				);
				resolve(text); // Fallback to original text
			});
	});
}

/**
 * Get value from nested object using dot notation path
 */
function getNestedValue(obj, keyPath) {
	const keys = keyPath.split(".");
	let current = obj;

	for (const key of keys) {
		if (current && typeof current === "object" && key in current) {
			current = current[key];
		} else {
			return undefined;
		}
	}

	return current;
}

/**
 * Set value in nested object using dot notation path
 */
function setNestedValue(obj, keyPath, value) {
	const keys = keyPath.split(".");
	let current = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (current && typeof current === "object" && key in current) {
			current = current[key];
		} else {
			return false;
		}
	}

	const lastKey = keys[keys.length - 1];
	if (current && typeof current === "object" && lastKey in current) {
		current[lastKey] = value;
		return true;
	}

	return false;
}

/**
 * Update a specific key's value in a dictionary file with translation
 */
async function updateDictionaryFile(filePath, keyPath, englishValue, fileName) {
	try {
		// Read the file
		const content = fs.readFileSync(filePath, "utf8");
		const data = JSON.parse(content);

		// Check if the key exists
		const oldValue = getNestedValue(data, keyPath);
		if (oldValue === undefined) {
			return {
				success: false,
				message: `Key "${keyPath}" not found`,
			};
		}

		// Get target language code
		const targetLang = LANGUAGE_CODES[fileName];
		if (!targetLang) {
			return {
				success: false,
				message: `Unknown language file: ${fileName}`,
			};
		}

		// Translate the value
		const translatedValue = await translateText(englishValue, targetLang);

		// Update the value
		const updated = setNestedValue(data, keyPath, translatedValue);
		if (!updated) {
			return {
				success: false,
				message: `Failed to update key "${keyPath}"`,
			};
		}

		// Write back to file with proper formatting
		fs.writeFileSync(
			filePath,
			JSON.stringify(data, null, "\t") + "\n",
			"utf8"
		);

		return {
			success: true,
			message: `"${oldValue}" → "${translatedValue}"`,
			oldValue,
			newValue: translatedValue,
		};
	} catch (error) {
		return {
			success: false,
			message: `Error: ${error.message}`,
		};
	}
}

/**
 * Add delay between API calls to avoid rate limiting
 */
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.error("❌ Error: Missing required arguments\n");
		console.log(
			"Usage: node updateTranslation.mjs <keyPath> <englishValue>"
		);
		console.log("\nExamples:");
		console.log(
			'  node updateTranslation.mjs "bonus.title" "Turnover Bonus Program"'
		);
		console.log(
			'  node updateTranslation.mjs "auth.email.title" "Email Login"'
		);
		console.log(
			'  node updateTranslation.mjs "common.save" "Save Changes"'
		);
		console.log("\nNote:");
		console.log(
			"  The English value will be automatically translated to each language"
		);
		console.log(
			"  This uses Google Translate API for accurate translations"
		);
		process.exit(1);
	}

	const keyPath = args[0];
	const englishValue = args.slice(1).join(" ");

	console.log("🌍 Updating Translation Value (with auto-translation)\n");
	console.log(`Key Path: ${keyPath}`);
	console.log(`English Value: "${englishValue}"`);
	console.log(`\n🔄 Translating to all languages...\n`);
	console.log("─".repeat(80));

	// Get all JSON files
	let files;
	try {
		files = fs
			.readdirSync(DICTIONARY_DIR)
			.filter((file) => file.endsWith(".json"))
			.sort();
	} catch (error) {
		console.error(
			`❌ Error reading dictionary directory: ${error.message}`
		);
		process.exit(1);
	}

	if (files.length === 0) {
		console.error("❌ No dictionary files found");
		process.exit(1);
	}

	let successCount = 0;
	let failCount = 0;

	// Process each file with translation
	for (const file of files) {
		const filePath = path.join(DICTIONARY_DIR, file);
		const langCode = LANGUAGE_CODES[file] || "unknown";

		process.stdout.write(
			`⏳ ${file.padEnd(12)} [${langCode.padEnd(5)}] Translating... `
		);

		const result = await updateDictionaryFile(
			filePath,
			keyPath,
			englishValue,
			file
		);

		// Clear the line and write result
		process.stdout.write("\r");

		if (result.success) {
			successCount++;
			console.log(
				`✅ ${file.padEnd(12)} [${langCode.padEnd(5)}] ${
					result.message
				}`
			);
		} else {
			failCount++;
			console.log(
				`❌ ${file.padEnd(12)} [${langCode.padEnd(5)}] ${
					result.message
				}`
			);
		}

		// Add small delay to avoid rate limiting
		await delay(200);
	}

	console.log("─".repeat(80));
	console.log(`\n📊 Summary:`);
	console.log(`   Total files: ${files.length}`);
	console.log(`   ✅ Updated: ${successCount}`);
	console.log(`   ❌ Failed: ${failCount}`);

	if (successCount > 0) {
		console.log(
			`\n✨ Successfully updated and translated "${keyPath}" in ${successCount} file(s)`
		);
	}

	if (failCount > 0) {
		console.log(`\n⚠️  Warning: ${failCount} file(s) could not be updated`);
	}

	process.exit(failCount > 0 ? 1 : 0);
}

main();
