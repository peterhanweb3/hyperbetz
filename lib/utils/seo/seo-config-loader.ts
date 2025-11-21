/**
 * SEO Config Loader
 * Central configuration loader for global SEO system
 * Language-based SEO using Dictionary files
 */

import seoConfig from "@/config/seo/global-seo.config.json";
import { SEOConfig, JSONObject, JSONValue } from "@/types/seo/seo.types";
import { headers } from "next/headers";
import { locales } from "@/lib/i18n";

/**
 * Helper: Recursively replace domain in config
 */
function replaceDomainInConfig(
	obj: JSONValue,
	oldDomain: string,
	newDomain: string
): JSONValue {
	if (typeof obj === "string") {
		return obj.replace(new RegExp(oldDomain, "g"), newDomain);
	}
	if (Array.isArray(obj)) {
		return obj.map((item) =>
			replaceDomainInConfig(item, oldDomain, newDomain)
		);
	}
	if (obj && typeof obj === "object") {
		const newObj: JSONObject = {};
		for (const key in obj) {
			newObj[key] = replaceDomainInConfig(
				(obj as JSONObject)[key],
				oldDomain,
				newDomain
			);
		}
		return newObj;
	}
	return obj;
}

/**
 * NEW: Async function to get SEO Config with Realtime Domain
 */
export async function getDynamicSEOConfig(): Promise<SEOConfig> {
	"use server";
	try {
		const headersList = await headers();
		const host = headersList.get("host") || "hyperholaholah.xyz";
		const proto = headersList.get("x-forwarded-proto") || "https";

		// If no host found (e.g. build time), return default
		if (!host) return seoConfig as SEOConfig;

		const currentDomain = `${proto}://${host}`;
		const defaultDomain = seoConfig.defaultDomain;

		// If domains match, no need to process
		if (currentDomain === defaultDomain) return seoConfig as SEOConfig;

		// Deep replace the domain in the config
		return replaceDomainInConfig(
			seoConfig,
			defaultDomain,
			currentDomain
		) as SEOConfig;
	} catch {
		// Fallback for environments where headers() might fail
		return seoConfig as SEOConfig;
	}
}

/**
 * Get the complete SEO configuration
 */
export function getSEOConfig(): SEOConfig {
	return seoConfig as SEOConfig;
}

/**
 * Get all available languages from Dictionary folder
 */
export function getAllLanguages(): string[] {
	return locales as unknown as string[];
}

/**
 * Detect language from URL path or return default
 */
export function detectLanguageFromPath(pathname: string): string {
	const pathSegments = pathname.split("/").filter(Boolean);

	if (pathSegments.length > 0) {
		const firstSegment = pathSegments[0].toLowerCase();
		const availableLanguages = getAllLanguages();
		if (availableLanguages.includes(firstSegment)) {
			return firstSegment;
		}
	}

	return seoConfig.defaultLang;
}

/**
 * Get page-specific default configuration
 */
export function getPageDefaults(
	pageType: string,
	passedConfig?: SEOConfig
): {
	title: string;
	description: string;
	keywords: string[];
	ogType: string;
	schemaType: string;
} {
	const config = passedConfig || getSEOConfig();
	return config.pageDefaults[pageType] || config.pageDefaults.home;
}

/**
 * Generate canonical URL for a path
 */
export function generateCanonicalURL(
	path: string,
	language: string = "en",
	passedConfig?: SEOConfig
): string {
	const config = passedConfig || getSEOConfig();
	const cleanPath = path.startsWith("/") ? path : `/${path}`;

	// Remove language prefix from path if it exists
	const pathWithoutLanguage = cleanPath.replace(
		new RegExp(`^/${language}`),
		""
	);

	// English is the default, no language prefix
	if (language === "en") {
		return `${config.defaultDomain}${pathWithoutLanguage}`;
	}

	// Other languages get a prefix
	return `${config.defaultDomain}/${language}${pathWithoutLanguage}`;
}

/**
 * Language to hreflang mapping
 * Maps Dictionary language codes to proper hreflang tags
 */
const languageToHreflang: Record<string, string> = {
	en: "en",
	es: "es",
	ar: "ar",
	zh: "zh",
	nl: "nl",
	fr: "fr",
	de: "de",
	hi: "hi",
	it: "it",
	ja: "ja",
	ko: "ko",
	ms: "ms",
	fa: "fa",
	pl: "pl",
	pt: "pt",
	ru: "ru",
	sv: "sv",
	th: "th",
	tr: "tr",
	vi: "vi",
};

/**
 * Generate hreflang tags for all available languages
 * Based on Dictionary files
 */
export function generateHrefLangTags(
	path: string,
	passedConfig?: SEOConfig
): Array<{ hreflang: string; href: string }> {
	const config = passedConfig || getSEOConfig();
	const tags: Array<{ hreflang: string; href: string }> = [];

	// Clean path - remove any language prefix
	const cleanPath = path.replace(/^\/[a-z]{2}(\/|$)/, "/");

	// Get all available languages
	const availableLanguages = getAllLanguages();

	// Generate hreflang tag for each language
	availableLanguages.forEach((langCode) => {
		const hreflang = languageToHreflang[langCode] || langCode;

		// Build URL with language prefix
		const href =
			langCode === "en"
				? `${config.defaultDomain}${cleanPath}` // English is default, no prefix
				: `${config.defaultDomain}/${langCode}${cleanPath}`;

		tags.push({
			hreflang,
			href,
		});
	});

	// Add x-default (points to English)
	tags.push({
		hreflang: "x-default",
		href: `${config.defaultDomain}${cleanPath}`,
	});

	return tags;
}

/**
 * Interpolate variables in strings (e.g., {gameName})
 */
export function interpolateString(
	str: string,
	variables: Record<string, string>
): string {
	let result = str;
	Object.entries(variables).forEach(([key, value]) => {
		result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
	});
	return result;
}

/**
 * Check if a string is a valid language code
 */
export function isLanguageCode(code: string): boolean {
	return (locales as readonly string[]).includes(code);
}

export default getSEOConfig;
