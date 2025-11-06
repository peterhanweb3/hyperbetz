/**
 * SEO Implementation Examples
 * This file demonstrates how to use the global SEO system across different pages
 */

import { Metadata } from "next";
import { generateSEOMetadata, SEOTemplates } from "@/lib/seo/seo-provider";
import {
	generateGameSchema,
	generateBreadcrumbSchema,
} from "@/lib/seo/schema-generator";
import { generateAEOFAQs } from "@/lib/seo/aeo-manager";

// ============================================
// Example 1: Home Page
// ============================================
export const homePageMetadata: Metadata = SEOTemplates.home().metadata;

// ============================================
// Example 2: Lobby Page
// ============================================
export const lobbyPageMetadata: Metadata = SEOTemplates.lobby().metadata;

// ============================================
// Example 3: Game Page (Dynamic)
// ============================================
export function generateGamePageMetadata(
	gameName: string,
	gameData?: {
		description?: string;
		provider?: string;
		category?: string;
		image?: string;
	}
): Metadata {
	const seo = SEOTemplates.game(gameName, undefined, {
		description:
			gameData?.description ||
			`Play ${gameName} at Hyperbetz. Enjoy exciting gameplay and win big!`,
		ogImage: gameData?.image,
		schemas: gameData
			? [
					generateGameSchema({
						name: gameName,
						description: gameData.description || `Play ${gameName}`,
						url: `/play/${gameName
							.toLowerCase()
							.replace(/\s+/g, "-")}`,
						image: gameData.image,
						provider: gameData.provider,
						category: gameData.category,
					}),
			  ]
			: undefined,
	});

	return seo.metadata;
}

// ============================================
// Example 4: Regional Page (South Africa)
// ============================================
export const southAfricaHomeMetadata: Metadata = SEOTemplates.home("za", {
	title: "Hyperbetz South Africa - Premier Online Gaming",
	description:
		"Join South Africa's leading online gaming platform. Play slots, live casino, and sports betting with ZAR support.",
	keywords: ["online gaming south africa", "casino ZA", "sports betting SA"],
}).metadata;

// ============================================
// Example 5: Page with FAQs (AEO)
// ============================================
export function generatePageWithFAQs(
	pageTitle: string,
	faqs: Array<{ question: string; answer: string }>
) {
	const { schema: faqSchema } = generateAEOFAQs(pageTitle, faqs);

	return generateSEOMetadata({
		title: pageTitle,
		description: `Everything you need to know about ${pageTitle}. Find answers to common questions.`,
		path: `/${pageTitle.toLowerCase().replace(/\s+/g, "-")}`,
		schemas: [faqSchema],
	});
}

// ============================================
// Example 6: Provider Page
// ============================================
export function generateProviderPageMetadata(
	providerName: string,
	providerData?: {
		description?: string;
		gamesCount?: number;
		logo?: string;
	}
) {
	return generateSEOMetadata({
		title: `${providerName} Games - Play Now`,
		description:
			providerData?.description ||
			`Explore ${
				providerData?.gamesCount || "amazing"
			} games from ${providerName}. Top-rated provider with exciting slots and table games.`,
		keywords: [
			`${providerName} games`,
			`${providerName} slots`,
			`${providerName} casino`,
		],
		path: `/providers/${providerName.toLowerCase().replace(/\s+/g, "-")}`,
		ogImage: providerData?.logo,
		pageType: "providers",
	});
}

// ============================================
// Example 7: Blog/Article Page with Full SEO
// ============================================
export function generateArticleMetadata(article: {
	title: string;
	description: string;
	slug: string;
	author?: string;
	publishedDate: string;
	image?: string;
	category?: string;
}) {
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Blog", url: "/blog" },
		{ name: article.title, url: `/blog/${article.slug}` },
	];

	return generateSEOMetadata({
		title: article.title,
		description: article.description,
		path: `/blog/${article.slug}`,
		ogType: "article",
		ogImage: article.image,
		schemas: [
			generateBreadcrumbSchema(breadcrumbs),
			{
				"@context": "https://schema.org",
				"@type": "Article",
				headline: article.title,
				description: article.description,
				author: {
					"@type": "Person",
					name: article.author || "Hyperbetz Team",
				},
				datePublished: article.publishedDate,
				image: article.image,
			},
		],
	});
}

// ============================================
// Example 8: Private Page (No Index)
// ============================================
export const profilePageMetadata: Metadata = SEOTemplates.profile(undefined, {
	noindex: true,
	nofollow: true,
}).metadata;

// ============================================
// Example 9: Multi-region Affiliate Page
// ============================================
export function generateAffiliatePageByRegion(region: string = "global") {
	const regionTitles: Record<string, string> = {
		global: "Join Our Affiliate Program",
		us: "Hyperbetz USA Affiliate Program",
		uk: "Hyperbetz UK Affiliate Programme",
		za: "Hyperbetz South Africa Affiliate Program",
		in: "Hyperbetz India Affiliate Program",
	};

	return SEOTemplates.affiliate(region, {
		title: regionTitles[region] || regionTitles.global,
		keywords: [
			"affiliate program",
			"referral rewards",
			"earn commission",
			"partnership",
		],
	}).metadata;
}

// ============================================
// Example 10: Category Page with Structured Data
// ============================================
export function generateCategoryPageMetadata(
	category: string,
	gamesCount: number
) {
	return generateSEOMetadata({
		title: `${category} Games - Browse ${gamesCount} Games`,
		description: `Discover ${gamesCount} exciting ${category} games at Hyperbetz. From classic favorites to new releases.`,
		keywords: [
			`${category} games`,
			`online ${category}`,
			`${category} casino`,
		],
		path: `/games/${category.toLowerCase()}`,
		schemas: [
			{
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: `${category} Games`,
				description: `Collection of ${gamesCount} ${category} games`,
				numberOfItems: gamesCount,
			},
		],
	});
}

/**
 * HOW TO USE IN YOUR PAGES:
 *
 * // In app/(routes)/page.tsx (Home)
 * export const metadata = homePageMetadata;
 *
 * // In app/(routes)/lobby/page.tsx
 * export const metadata = lobbyPageMetadata;
 *
 * // In app/(routes)/play/[gameId]/page.tsx
 * export async function generateMetadata({ params }) {
 *   const game = await fetchGame(params.gameId);
 *   return generateGamePageMetadata(game.name, {
 *     description: game.description,
 *     provider: game.provider,
 *     image: game.image,
 *   });
 * }
 *
 * // For regional pages
 * // In app/[region]/page.tsx
 * export async function generateMetadata({ params }) {
 *   return SEOTemplates.home(params.region).metadata;
 * }
 */
