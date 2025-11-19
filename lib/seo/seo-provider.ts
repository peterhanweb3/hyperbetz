/**
 * SEO Provider Component
 * Central SEO management system for Next.js App Router
 * Handles metadata generation, schema, hreflang, and AI optimization
 */

import { Metadata } from "next";
import {
	getSEOConfig,
	getLanguageConfig,
	generateCanonicalURL,
	generateHrefLangTags,
	interpolateString,
	getPageDefaults,
} from "./seo-config-loader";
import { generateSchema, generateMultipleSchemas } from "./schema-generator";

export interface SEOProps {
	title?: string;
	description?: string;
	keywords?: string[];
	canonical?: string;
	ogImage?: string;
	ogType?: "website" | "article" | "profile" | "game";
	language?: string; // Language code (e.g., "en", "ja", "hi")
	region?: string; // @deprecated Use language instead
	noindex?: boolean;
	nofollow?: boolean;
	path?: string;
	pageType?: string;
	variables?: Record<string, string>;
	schemas?: Array<Record<string, unknown>>;
	customMetadata?: Partial<Metadata>;

	// Optional properties for overriding OG title and description
	ogTitle?: string;
	ogDescription?: string;
}

/**
 * Generate complete metadata for Next.js pages (DYNAMIC)
 */
export function generateSEOMetadata(props: SEOProps): Metadata {
	const config = getSEOConfig();

	// Support both language and region (for backward compatibility)
	const language = props.language || props.region || config.defaultLang;
	const languageConfig = getLanguageConfig(language);

	// Get page defaults if pageType is provided
	const pageDefaults = props.pageType
		? getPageDefaults(props.pageType)
		: null;

	// Interpolate variables in title and description
	let title =
		props.title || pageDefaults?.title || config.defaults.description;
	let description =
		props.description ||
		pageDefaults?.description ||
		config.defaults.description;

	if (props.variables) {
		title = interpolateString(title, props.variables);
		description = interpolateString(description, props.variables);
	}

	// Add suffix to title
	const fullTitle = `${title} | ${config.defaults.siteName}`;

	// Generate canonical URL (DYNAMIC - uses current domain)
	const canonical =
		props.canonical || generateCanonicalURL(props.path || "/", language);

	// Generate hreflang tags (DYNAMIC - uses current domain)
	const hrefLangTags = props.path ? generateHrefLangTags(props.path) : [];

	// Determine OG image (DYNAMIC)
	const ogImage =
		props.ogImage || `${canonical.split('/').slice(0, 3).join('/')}${config.defaults.logo}`;

	// Build keywords
	const keywords = props.keywords || pageDefaults?.keywords || [];

	// Determine locale for Open Graph
	const ogLocale = languageConfig.hreflang.includes('-')
		? languageConfig.hreflang.replace("-", "_")
		: `${languageConfig.hreflang}_${languageConfig.hreflang.toUpperCase()}`;

	// Base metadata
	const metadata: Metadata = {
		metadataBase: new URL(canonical.split('/').slice(0, 3).join('/')),
		title: fullTitle,
		description,
		keywords: keywords.join(", "),
		authors: [
			{
				name: config.defaults.author,
				url: canonical.split('/').slice(0, 3).join('/'),
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
			title: props.ogTitle || fullTitle,
			description: props.ogDescription || description,
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

		// Alternates for hreflang (DYNAMIC - based on current domain)
		alternates: {
			canonical,
			languages: hrefLangTags.reduce((acc, tag) => {
				if (tag.hreflang !== "x-default") {
					acc[tag.hreflang] = tag.href;
				}
				return acc;
			}, {} as Record<string, string>),
		},

		// Verification (can be added via env)
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
			yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
		},

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
export function generateJSONLD(props: SEOProps): string | null {
	const language = props.language || props.region || "en";
	const schemas: Array<Record<string, unknown>> = [];

	// Always include Organization and Website schemas
	const orgSchema = generateSchema({ type: "organization", region: language });
	const webSchema = generateSchema({ type: "website", region: language });

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
export function generateAISOTags(props: SEOProps): Record<string, string> {
	const config = getSEOConfig();

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
export function generatePerformanceHints(): {
	preconnect: string[];
	dnsPrefetch: string[];
	preload: Array<{ href: string; as: string; type?: string }>;
} {
	const config = getSEOConfig();

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
export function generatePageSEO(props: SEOProps) {
	return {
		metadata: generateSEOMetadata(props),
		jsonld: generateJSONLD(props),
		aisoTags: generateAISOTags(props),
		performanceHints: generatePerformanceHints(),
	};
}

/**
 * Helper function to generate SEO for common page types
 */
export const SEOTemplates = {
	home: (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "home",
			path: "/",
			language,
			...customProps,
		}),

	lobby: (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "lobby",
			path: "/lobby",
			language,
			...customProps,
		}),

	game: (
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

	profile: (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "profile",
			path: "/profile",
			language,
			ogType: "profile",
			noindex: true, // Private page
			...customProps,
		}),

	affiliate: (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "affiliate",
			path: "/affiliate",
			language,
			...customProps,
		}),

	providers: (language?: string, customProps?: Partial<SEOProps>) =>
		generatePageSEO({
			pageType: "providers",
			path: "/providers",
			language,
			...customProps,
		}),
};

export default generatePageSEO;
