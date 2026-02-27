import fs from "fs/promises";
import path from "path";

// In-memory cache to avoid repeated disk reads per locale (production only)
const dictionaryCache = new Map<string, unknown>();
const isDev = process.env.NODE_ENV === "development";

export async function loadDictionary(locale: string) {
	// Skip cache in dev mode so dictionary file changes are picked up immediately
	if (!isDev && dictionaryCache.has(locale))
		return dictionaryCache.get(locale);

	const filePath = path.join(process.cwd(), "Dictionary", `${locale}.json`);
	const file = await fs.readFile(filePath, "utf8");
	const parsed = JSON.parse(file);
	dictionaryCache.set(locale, parsed);
	return parsed;
}
