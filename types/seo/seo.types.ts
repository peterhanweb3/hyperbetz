import { Metadata } from "next";

interface SchemaOptions {
	type:
		| "organization"
		| "website"
		| "webpage"
		| "game"
		| "faq"
		| "howto"
		| "breadcrumb"
		| "article"
		| "product"
		| "mobileapp";
	data?: Record<string, unknown>;
	language?: string;
}

interface SEOConfig {
	defaultDomain: string;
	defaultLang: string;
	environment: string;
	metaTitleSuffix: string;
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

export interface SEOProps {
	title?: string;
	description?: string;
	keywords?: string[];
	canonical?: string;
	ogImage?: string;
	ogType?: "website" | "article" | "profile" | "game";
	language?: string;
	noindex?: boolean;
	nofollow?: boolean;
	nocanonical?: boolean;
	path?: string;
	pageType?: string;
	variables?: Record<string, string>;
	schemas?: Array<Record<string, unknown>>;
	customMetadata?: Partial<Metadata>;

	// Optional properties for overriding OG title and description
	ogTitle?: string;
	ogDescription?: string;
	ogUrl?: string;
}

type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONObject
	| SEOConfig
	| Array<JSONValue>;
interface JSONObject {
	[key: string]: JSONValue;
}

export type { SchemaOptions, SEOConfig, JSONObject, JSONValue };
