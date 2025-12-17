import fs from "fs/promises";
import path from "path";

// Simple in-memory cache to avoid repeated disk reads per locale
const dictionaryCache = new Map<string, unknown>();

export async function loadDictionary(locale: string) {
	if (dictionaryCache.has(locale)) return dictionaryCache.get(locale);

	const filePath = path.join(process.cwd(), "Dictionary", `${locale}.json`);
	const file = await fs.readFile(filePath, "utf8");
	const parsed = JSON.parse(file);
	dictionaryCache.set(locale, parsed);
	return parsed;
}
