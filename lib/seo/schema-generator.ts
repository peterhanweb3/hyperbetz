/**
 * Schema Generator
 * Generates JSON-LD structured data for SEO (Schema.org)
 * Supports: Organization, Website, WebPage, Game, FAQPage, HowTo, BreadcrumbList, etc.
 */

import { getSEOConfig } from "./seo-config-loader";

export interface SchemaOptions {
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
	region?: string;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): Record<string, unknown> {
	const config = getSEOConfig();
	return {
		"@context": "https://schema.org",
		...config.schemaDefaults.organization,
	};
}

/**
 * Generate Website schema
 */
export function generateWebsiteSchema(
	region: string = "global"
): Record<string, unknown> {
	const config = getSEOConfig();
	const regionConfig = config.regions[region];

	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: config.defaults.siteName,
		url: regionConfig?.canonicalBase || config.defaultDomain,
		description: config.defaults.description,
		potentialAction: {
			"@type": "SearchAction",
			target: `${
				regionConfig?.canonicalBase || config.defaultDomain
			}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		},
		publisher: {
			"@type": "Organization",
			name: config.defaults.organization,
			logo: {
				"@type": "ImageObject",
				url: `${config.defaultDomain}${config.defaults.logo}`,
			},
		},
	};
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(data: {
	title: string;
	description: string;
	url: string;
	datePublished?: string;
	dateModified?: string;
	region?: string;
}): Record<string, unknown> {
	const config = getSEOConfig();

	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: data.title,
		description: data.description,
		url: data.url,
		isPartOf: {
			"@type": "WebSite",
			url: config.defaultDomain,
		},
		...(data.datePublished && { datePublished: data.datePublished }),
		...(data.dateModified && { dateModified: data.dateModified }),
		publisher: {
			"@type": "Organization",
			name: config.defaults.organization,
		},
	};
}

/**
 * Generate Game schema (for game pages)
 */
export function generateGameSchema(data: {
	name: string;
	description: string;
	url: string;
	image?: string;
	provider?: string;
	category?: string;
	rating?: number;
}): Record<string, unknown> {
	getSEOConfig();

	const schema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Game",
		name: data.name,
		description: data.description,
		url: data.url,
		applicationCategory: "Game",
		...(data.image && {
			image: {
				"@type": "ImageObject",
				url: data.image,
			},
		}),
		...(data.provider && {
			creator: {
				"@type": "Organization",
				name: data.provider,
			},
		}),
		...(data.category && { genre: data.category }),
		...(data.rating && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: data.rating,
				ratingCount: 1,
			},
		}),
	};

	return schema;
}

/**
 * Generate FAQPage schema (AEO - Answer Engine Optimization)
 */
export function generateFAQSchema(
	faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
}

/**
 * Generate HowTo schema (AEO)
 */
export function generateHowToSchema(data: {
	name: string;
	description: string;
	steps: Array<{ name: string; text: string; image?: string }>;
	totalTime?: string;
}): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: data.name,
		description: data.description,
		...(data.totalTime && { totalTime: data.totalTime }),
		step: data.steps.map((step, index) => ({
			"@type": "HowToStep",
			position: index + 1,
			name: step.name,
			text: step.text,
			...(step.image && {
				image: {
					"@type": "ImageObject",
					url: step.image,
				},
			}),
		})),
	};
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
	breadcrumbs: Array<{ name: string; url: string }>
): Record<string, unknown> {
	const config = getSEOConfig();

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: `${config.defaultDomain}${crumb.url}`,
		})),
	};
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(data: {
	title: string;
	description: string;
	url: string;
	image?: string;
	author?: string;
	datePublished: string;
	dateModified?: string;
}): Record<string, unknown> {
	const config = getSEOConfig();

	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: data.title,
		description: data.description,
		url: data.url,
		...(data.image && {
			image: {
				"@type": "ImageObject",
				url: data.image,
			},
		}),
		author: {
			"@type": "Person",
			name: data.author || config.defaults.author,
		},
		publisher: {
			"@type": "Organization",
			name: config.defaults.organization,
			logo: {
				"@type": "ImageObject",
				url: `${config.defaultDomain}${config.defaults.logo}`,
			},
		},
		datePublished: data.datePublished,
		dateModified: data.dateModified || data.datePublished,
	};
}

/**
 * Generate MobileApplication schema (ASO - App Store Optimization)
 */
export function generateMobileAppSchema(): Record<string, unknown> | null {
	const config = getSEOConfig();

	if (
		!config.aso.enabled ||
		(!config.aso.androidAppId && !config.aso.iosAppId)
	) {
		return null;
	}

	const schema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "MobileApplication",
		name: config.aso.appName,
		applicationCategory: "Game",
		operatingSystem: [] as string[],
	};

	if (config.aso.androidAppId) {
		(schema.operatingSystem as string[]).push("Android");
		schema.installUrl = `https://play.google.com/store/apps/details?id=${config.aso.androidAppId}`;
	}

	if (config.aso.iosAppId) {
		(schema.operatingSystem as string[]).push("iOS");
		if (!schema.installUrl) {
			schema.installUrl = `https://apps.apple.com/app/id${config.aso.iosAppId}`;
		}
	}

	return schema;
}

/**
 * Generate Product schema (for promotional pages)
 */
export function generateProductSchema(data: {
	name: string;
	description: string;
	image?: string;
	url: string;
	brand?: string;
	offers?: {
		price?: string;
		priceCurrency?: string;
		availability?: string;
	};
}): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: data.name,
		description: data.description,
		...(data.image && { image: data.image }),
		url: data.url,
		...(data.brand && {
			brand: {
				"@type": "Brand",
				name: data.brand,
			},
		}),
		...(data.offers && {
			offers: {
				"@type": "Offer",
				...(data.offers.price && { price: data.offers.price }),
				...(data.offers.priceCurrency && {
					priceCurrency: data.offers.priceCurrency,
				}),
				...(data.offers.availability && {
					availability: `https://schema.org/${data.offers.availability}`,
				}),
			},
		}),
	};
}

/**
 * Generate multiple schemas at once
 */
export function generateMultipleSchemas(
	schemas: Array<Record<string, unknown>>
): string {
	return JSON.stringify(schemas);
}

/**
 * Main schema generator with auto-detection
 */
export function generateSchema(
	options: SchemaOptions
): Record<string, unknown> | null {
	const { type, data = {} } = options;

	switch (type) {
		case "organization":
			return generateOrganizationSchema();
		case "website":
			return generateWebsiteSchema(options.region);
		case "webpage":
			return generateWebPageSchema(
				data as {
					title: string;
					description: string;
					url: string;
					datePublished?: string;
					dateModified?: string;
					region?: string;
				}
			);
		case "game":
			return generateGameSchema(
				data as {
					name: string;
					description: string;
					url: string;
					image?: string;
					provider?: string;
					category?: string;
					rating?: number;
				}
			);
		case "faq":
			return generateFAQSchema(
				(data.faqs as Array<{ question: string; answer: string }>) || []
			);
		case "howto":
			return generateHowToSchema(
				data as {
					name: string;
					description: string;
					steps: Array<{
						name: string;
						text: string;
						image?: string;
					}>;
					totalTime?: string;
				}
			);
		case "breadcrumb":
			return generateBreadcrumbSchema(
				(data.breadcrumbs as Array<{ name: string; url: string }>) || []
			);
		case "article":
			return generateArticleSchema(
				data as {
					title: string;
					description: string;
					url: string;
					image?: string;
					author?: string;
					datePublished: string;
					dateModified?: string;
				}
			);
		case "product":
			return generateProductSchema(
				data as {
					name: string;
					description: string;
					image?: string;
					url: string;
					brand?: string;
					offers?: {
						price?: string;
						priceCurrency?: string;
						availability?: string;
					};
				}
			);
		case "mobileapp":
			return generateMobileAppSchema();
		default:
			return null;
	}
}

export default generateSchema;
