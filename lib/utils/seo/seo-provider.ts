/**
 * SEO Provider Component
 * Central SEO management system for Next.js App Router
 * Handles metadata generation, schema, hreflang, and AI optimization
 * Language-based SEO using Dictionary files
 */

import { Metadata } from "next";
import {
	getSEOConfig,
	getDynamicSEOConfig,
	generateCanonicalURL,
	generateHrefLangTags,
	interpolateString,
	getPageDefaults,
} from "./seo-config-loader";
import { generateSchema, generateMultipleSchemas } from "./schema-generator";
import { SEOConfig, SEOProps } from "@/types/seo/seo.types";

/**
 * Generate complete metadata for Next.js pages
 * Language-based SEO system
 */
export async function generateSEOMetadata(props: SEOProps): Promise<Metadata> {
	const config = await getDynamicSEOConfig();
	const language = props.language || config.defaultLang;

	// Get page defaults if pageType is provided
	const pageDefaults = props.pageType
		? getPageDefaults(props.pageType, config)
		: null;

	// Interpolate variables in title and description
	let title = props.title || pageDefaults?.title || "";
	let description =
		props.description ||
		pageDefaults?.description ||
		config.defaults.description;

	if (props.variables) {
		title = interpolateString(title, props.variables);
		description = interpolateString(description, props.variables);
	}

	// Add title suffix
	const fullTitle = `${title}${config.metaTitleSuffix}`;

	// Generate canonical URL
	const canonical = !(props.nocanonical??true)
		? props.canonical ||
		  generateCanonicalURL(props.path || "/", language, config)
		: undefined;

	// Generate hreflang tags (based on Dictionary languages)
	const hrefLangTags = props.path
		? generateHrefLangTags(props.path, config)
		: [];

	// Determine OG image
	const ogImage =
		props.ogImage || `${config.defaultDomain}${config.defaults.logo}`;

	// Build keywords
	const keywords = props.keywords || pageDefaults?.keywords || [];

	// Determine locale for Open Graph
	const ogLocale = getLanguageLocale(language); // Base metadata
	const metadata: Metadata = {
		metadataBase: new URL(config.defaultDomain),
		title: fullTitle,
		description,
		keywords: keywords.join(", "),
		authors: [
			{
				name: config.defaults.author,
				url: config.defaultDomain,
			},
		],
		creator: config.defaults.organization,
		publisher: config.defaults.organization,

		// Robots
		robots: {
			index: !props.noindex,
			follow: !props.nofollow,
			googleBot: {
				index: !props.noindex,
				follow: !props.nofollow,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},

		// Open Graph
		openGraph: {
			type: (props.ogType === "game"
				? "website"
				: props.ogType || pageDefaults?.ogType || "website") as
				| "website"
				| "article"
				| "profile",
			title: props.ogTitle || fullTitle, // Allow manual override of OG title
			description: props.ogDescription || description, // Allow manual override of OG description
			url: canonical,
			siteName: config.defaults.siteName,
			locale: ogLocale,
			images: [
				{
					url: ogImage,
					width: config.defaults.logoWidth,
					height: config.defaults.logoHeight,
					alt: title,
				},
			],
		},

		// Twitter
		twitter: {
			card: config.socialMedia.twitter.cardType as
				| "summary"
				| "summary_large_image"
				| "app"
				| "player",
			title: fullTitle,
			description,
			images: [ogImage],
			creator: config.socialMedia.twitter.handle,
			site: config.socialMedia.twitter.handle,
		},

		// Icons
		icons: {
			icon: config.defaults.favicon,
			shortcut: config.defaults.favicon,
			apple: config.defaults.favicon,
		},

		// Alternates for hreflang
		alternates: {
			...(canonical && { canonical }),
			languages: hrefLangTags.reduce((acc, tag) => {
				if (tag.hreflang !== "x-default") {
					acc[tag.hreflang] = tag.href;
				}
				return acc;
			}, {} as Record<string, string>),
		},

		// Verification (can be added via env)
		// verification: {
		// 	google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		// 	yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
		// },

		// Additional metadata
		category: "Gaming",

		// Merge custom metadata
		...props.customMetadata,
	};

	return metadata;
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJSONLD(
	props: SEOProps,
	config: SEOConfig
): string | null {
	const language = props.language || config.defaultLang;
	const schemas: Array<Record<string, unknown>> = [];

	// Always include Organization and Website schemas
	const orgSchema = generateSchema(
		{ type: "organization", language },
		config
	);
	const webSchema = generateSchema({ type: "website", language }, config);

	if (orgSchema) schemas.push(orgSchema);
	if (webSchema) schemas.push(webSchema);

	// Add custom schemas if provided
	if (props.schemas && props.schemas.length > 0) {
		schemas.push(...props.schemas);
	}

	return generateMultipleSchemas(schemas);
}

/**
 * Generate meta tags for AI Search Optimization (AISO)
 */
export function generateAISOTags(
	props: SEOProps,
	passedConfig: SEOConfig
): Record<string, string> {
	const config = passedConfig || getSEOConfig();

	if (!config.aiso.enabled) {
		return {};
	}

	const tags: Record<string, string> = {
		"data-aiso": "true",
		"data-ai-optimized": "true",
	};

	// Add semantic context
	if (config.aiso.semanticContext) {
		tags["data-semantic-type"] = props.pageType || "webpage";
	}

	// Add entity markup
	if (config.aiso.entityMarkup) {
		tags["data-entity-type"] = props.ogType || "website";
	}

	return tags;
}

/**
 * Generate performance hints (preconnect, dns-prefetch, preload)
 */
export function generatePerformanceHints(passedConfig?: SEOConfig): {
	preconnect: string[];
	dnsPrefetch: string[];
	preload: Array<{ href: string; as: string; type?: string }>;
} {
	const config = passedConfig || getSEOConfig();

	return {
		preconnect: config.performance.enablePreconnect
			? config.performance.externalDomains
			: [],
		dnsPrefetch: config.performance.enableDNSPrefetch
			? config.performance.externalDomains
			: [],
		preload: config.performance.enablePreload
			? config.performance.criticalResources.map((href) => ({
					href,
					as:
						href.endsWith(".png") ||
						href.endsWith(".jpg") ||
						href.endsWith(".webp")
							? "image"
							: "fetch",
					type: href.endsWith(".png") ? "image/png" : undefined,
			  }))
			: [],
	};
}

/**
 * Complete SEO configuration for a page
 */
export async function generatePageSEO(props: SEOProps) {
	// 1. Fetch config asynchronously
	const config = await getDynamicSEOConfig();

	return {
		// 2. Metadata is generated via the async function we defined above
		metadata: await generateSEOMetadata(props),

		// 3. Others are generated synchronously but injected with the dynamic config
		jsonld: generateJSONLD(props, config),
		aisoTags: generateAISOTags(props, config),
		performanceHints: generatePerformanceHints(config),
	};
}

/**
 * Helper function to generate SEO for common page types
 */
export const SEOTemplates = {
	home: async (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "home",
			path: "/",
			language,
			...customProps,
		}),

	lobby: async (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "lobby",
			path: "/lobby",
			language,
			...customProps,
		}),

	game: async (
		gameName: string,
		language?: string,
		customProps?: Partial<SEOProps>
	) =>
		generatePageSEO({
			pageType: "game",
			path: `/play/${gameName.toLowerCase().replace(/\s+/g, "-")}`,
			language,
			variables: { gameName },
			...customProps,
		}),

	profile: async (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "profile",
			path: "/profile",
			language,
			ogType: "profile",
			noindex: true, // Private page
			...customProps,
		}),

	affiliate: async (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "affiliate",
			path: "/affiliate",
			language,
			...customProps,
		}),

	providers: async (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "providers",
			path: "/providers",
			language,
			...customProps,
		}),
};

/**
 * Helper: Detect if a string is a language code from Dictionary
 */
export { isLanguageCode } from "./seo-config-loader";

/**
 * Helper: Get language-specific locale string for Open Graph
 * Maps language codes to proper locale strings
 */
export function getLanguageLocale(langCode: string): string {
	const localeMap: Record<string, string> = {
		en: "en_US",
		es: "es_ES",
		ar: "ar_SA",
		zh: "zh_CN",
		nl: "nl_NL",
		fr: "fr_FR",
		de: "de_DE",
		hi: "hi_IN",
		it: "it_IT",
		ja: "ja_JP",
		ko: "ko_KR",
		ms: "ms_MY",
		fa: "fa_IR",
		pl: "pl_PL",
		pt: "pt_PT",
		ru: "ru_RU",
		sv: "sv_SE",
		th: "th_TH",
		tr: "tr_TR",
		vi: "vi_VN",
	};

	return localeMap[langCode] || "en_US";
}

export default generatePageSEO;
