/**
 * SEO Config Loader
 * Central configuration loader for global SEO system
 */

import seoConfig from "@/config/seo/global-seo.config.json";
import {
	buildCanonicalURL,
	buildAlternateURL,
	getAvailableLanguages,
	detectLanguageFromPath as detectLangFromPath,
} from "./domain-utils";

export type LanguageCode = string;

export interface LanguageConfig {
	name: string;
	nativeName: string;
	hreflang: string;
	direction: string;
	localizedTerms: Record<string, string>;
}

// Legacy type for backward compatibility
export interface RegionConfig {
	language: string;
	currency: string;
	hreflang: string;
	countryCode: string;
	timezone: string;
	metaTitleSuffix: string;
	canonicalBase: string;
	gtmId?: string;
	ga4Id?: string;
	localizedTerms: Record<string, string>;
}

export interface SEOConfig {
	defaultDomain: string;
	defaultLang: string;
	environment: string;
	supportedTLDs: string[];
	languages: Record<string, LanguageConfig>;
	defaults: {
		siteName: string;
		organization: string;
		description: string;
		author: string;
		favicon: string;
		logo: string;
		logoWidth: number;
		logoHeight: number;
		twitterHandle: string;
		facebookAppId: string;
		enableAISEO: boolean;
		enableAEO: boolean;
		enableGEO: boolean;
		enableAISO: boolean;
		enableASO: boolean;
	};
	schemaDefaults: {
		organization: Record<string, unknown>;
		website: Record<string, unknown>;
	};
	pageDefaults: Record<
		string,
		{
			title: string;
			description: string;
			keywords: string[];
			ogType: string;
			schemaType: string;
		}
	>;
	robotsRules: {
		production: {
			allow: string[];
			disallow: string[];
			sitemap: string;
		};
		staging: {
			allow: string[];
			disallow: string[];
			sitemap: string | null;
		};
	};
	aeo: {
		enabled: boolean;
		generateFAQs: boolean;
		generateHowTo: boolean;
		enableSpeakable: boolean;
		targetFeaturedSnippets: boolean;
	};
	aiso: {
		enabled: boolean;
		aiPlatforms: string[];
		structuredAnswers: boolean;
		entityMarkup: boolean;
		semanticContext: boolean;
	};
	aso: {
		enabled: boolean;
		androidAppId: string;
		iosAppId: string;
		appName: string;
		appDeepLinkScheme: string;
		pwaEnabled: boolean;
	};
	performance: {
		enablePreconnect: boolean;
		enableDNSPrefetch: boolean;
		enablePreload: boolean;
		criticalResources: string[];
		externalDomains: string[];
	};
	socialMedia: {
		twitter: {
			handle: string;
			cardType: string;
		};
		facebook: {
			appId: string;
			pages: string[];
		};
		instagram: {
			handle: string;
		};
	};
	analytics: {
		ga4: {
			enabled: boolean;
			measurementId: string;
		};
		gtm: {
			enabled: boolean;
			containerId: string;
		};
		customEvents: Record<string, boolean>;
	};
}

/**
 * Get the complete SEO configuration
 */
export function getSEOConfig(): SEOConfig {
	return seoConfig as SEOConfig;
}

/**
 * Get language-specific configuration
 */
export function getLanguageConfig(language: string = "en"): LanguageConfig {
	const config = getSEOConfig();
	const langConfig = config.languages[language];

	if (!langConfig) {
		// Fallback to default language
		return config.languages[config.defaultLang] as LanguageConfig;
	}

	return langConfig as LanguageConfig;
}

/**
 * Get all available languages
 */
export function getAvailableLanguagesList(): string[] {
	return getAvailableLanguages();
}

/**
 * Detect language from URL path or return default
 */
export function detectLanguageFromPath(pathname: string): string {
	return detectLangFromPath(pathname);
}

/**
 * Legacy function for backward compatibility - maps to language config
 * @deprecated Use getLanguageConfig instead
 */
export function getRegionConfig(region: string = "global"): RegionConfig {
	const language = region === "global" ? "en" : region;
	const langConfig = getLanguageConfig(language);

	// Create a legacy RegionConfig from LanguageConfig
	return {
		language: language,
		currency: "USD", // Default currency
		hreflang: langConfig.hreflang,
		countryCode: "INT",
		timezone: "UTC",
		metaTitleSuffix: " | Hyperbetz",
		canonicalBase: buildCanonicalURL("", language),
		gtmId: "",
		ga4Id: "",
		localizedTerms: langConfig.localizedTerms,
	};
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getAvailableLanguagesList instead
 */
export function getAvailableRegions(): string[] {
	return getAvailableLanguages();
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use detectLanguageFromPath instead
 */
export function detectRegionFromPath(pathname: string): string {
	return detectLanguageFromPath(pathname);
}

/**
 * Get page-specific default configuration
 */
export function getPageDefaults(pageType: string): {
	title: string;
	description: string;
	keywords: string[];
	ogType: string;
	schemaType: string;
} {
	const config = getSEOConfig();
	return config.pageDefaults[pageType] || config.pageDefaults.home;
}

/**
 * Generate canonical URL for a path (DYNAMIC - uses current domain)
 */
export function generateCanonicalURL(
	path: string,
	language?: string
): string {
	return buildCanonicalURL(path, language);
}

/**
 * Generate hreflang tags for all available languages (DYNAMIC)
 */
export function generateHrefLangTags(
	path: string
): Array<{ hreflang: string; href: string }> {
	const config = getSEOConfig();
	const tags: Array<{ hreflang: string; href: string }> = [];
	const languages = getAvailableLanguages();

	// Generate alternate URLs for each language
	languages.forEach((lang) => {
		const langConfig = getLanguageConfig(lang);
		const href = buildAlternateURL(path, lang);

		tags.push({
			hreflang: langConfig.hreflang,
			href,
		});
	});

	// Add x-default (points to default language)
	const defaultHref = buildAlternateURL(path, config.defaultLang);
	tags.push({
		hreflang: "x-default",
		href: defaultHref,
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

export default getSEOConfig;
