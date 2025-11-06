/**
 * SEO Config Loader
 * Central configuration loader for global SEO system
 */

import seoConfig from "@/config/seo/global-seo.config.json";

export type RegionCode = keyof typeof seoConfig.regions;

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
	defaultCountry: string;
	environment: string;
	regions: Record<string, RegionConfig>;
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
 * Get region-specific configuration
 */
export function getRegionConfig(region: string = "global"): RegionConfig {
	const config = getSEOConfig();
	return config.regions[region] || config.regions[config.defaultCountry];
}

/**
 * Get all available regions
 */
export function getAvailableRegions(): string[] {
	const config = getSEOConfig();
	return Object.keys(config.regions);
}

/**
 * Detect region from URL path or return default
 */
export function detectRegionFromPath(pathname: string): string {
	const config = getSEOConfig();
	const pathSegments = pathname.split("/").filter(Boolean);

	if (pathSegments.length > 0) {
		const firstSegment = pathSegments[0].toLowerCase();
		if (config.regions[firstSegment]) {
			return firstSegment;
		}
	}

	return config.defaultCountry;
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
 * Generate canonical URL for a path
 */
export function generateCanonicalURL(
	path: string,
	region: string = "global"
): string {
	const regionConfig = getRegionConfig(region);
	const cleanPath = path.startsWith("/") ? path : `/${path}`;

	// Remove region prefix from path if it exists
	const pathWithoutRegion = cleanPath.replace(new RegExp(`^/${region}`), "");

	if (region === "global") {
		return `${regionConfig.canonicalBase}${pathWithoutRegion}`;
	}

	return `${regionConfig.canonicalBase}${pathWithoutRegion}`;
}

/**
 * Generate hreflang tags for all regions
 */
export function generateHrefLangTags(
	path: string
): Array<{ hreflang: string; href: string }> {
	const config = getSEOConfig();
	const tags: Array<{ hreflang: string; href: string }> = [];

	// Clean path
	const cleanPath = path.replace(/^\/[a-z]{2}(\/|$)/, "/");

	Object.entries(config.regions).forEach(([regionKey, regionConfig]) => {
		const href =
			regionKey === "global"
				? `${regionConfig.canonicalBase}${cleanPath}`
				: `${regionConfig.canonicalBase}${cleanPath}`;

		tags.push({
			hreflang: regionConfig.hreflang,
			href,
		});
	});

	// Add x-default
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

export default getSEOConfig;
