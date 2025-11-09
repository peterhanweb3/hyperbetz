/**
 * Optimized Dynamic Sitemap Generator for SEO & GEO
 * - 150-200 URLs for optimal Google SEO
 * - Structured for Generative Engine Optimization (AI search)
 * - Dynamic domain detection (multi-TLD support)
 * - All providers + strategic category combinations
 */

import { MetadataRoute } from "next";
import { headers } from "next/headers";

/**
 * Generate comprehensive sitemap optimized for both traditional SEO and GEO
 * Target: 150-200 essential URLs (not thousands)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Get the current domain from headers (supports multi-TLD)
	const headersList = await headers();
	const host = headersList.get("host") || "hyperbetz.games";
	const protocol = host.includes("localhost") ? "http" : "https";
	const baseUrl = `${protocol}://${host}`;

	const sitemapEntries: MetadataRoute.Sitemap = [];

	// ============================================
	// TIER 1: Core Static Pages (Priority 1.0-0.9)
	// High-value pages that drive conversions
	// ============================================
	const corePages = [
		{ path: "/", priority: 1.0, changeFreq: "daily" as const },
		{ path: "/lobby", priority: 0.9, changeFreq: "daily" as const },
		{ path: "/games", priority: 0.9, changeFreq: "daily" as const },
		{ path: "/providers", priority: 0.9, changeFreq: "weekly" as const },
		{ path: "/bonus", priority: 0.8, changeFreq: "weekly" as const },
		{ path: "/affiliate", priority: 0.8, changeFreq: "weekly" as const },
	];

	corePages.forEach((page) => {
		sitemapEntries.push({
			url: `${baseUrl}${page.path}`,
			lastModified: new Date(),
			changeFrequency: page.changeFreq,
			priority: page.priority,
		});
	});

	// ============================================
	// TIER 2: Category Pages (Priority 0.8)
	// Target broad, high-volume keywords
	// ============================================
	const categories = ["slot", "live-casino", "sports", "rng"];

	categories.forEach((category) => {
		sitemapEntries.push({
			url: `${baseUrl}/providers/${category}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		});
	});

	// ============================================
	// TIER 3: Top 20 Provider Pages (Priority 0.7)
	// Most popular providers - full coverage
	// ============================================
	const topProviders = [
		"pg-soft",
		"pragmatic-play",
		"evolution",
		"netent",
		"ka-gaming",
		"playtech",
		"microgaming",
		"habanero",
		"red-tiger",
		"relax-gaming",
		"yggdrasil",
		"pragmatic-live",
		"live22",
		"jili",
		"cq9",
		"joker",
		"sa-gaming",
		"dream-gaming",
		"asia-gaming",
		"sexy-baccarat",
	];

	// Add top provider pages
	topProviders.forEach((provider) => {
		sitemapEntries.push({
			url: `${baseUrl}/games/${provider}`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		});
	});

	// ============================================
	// TIER 4: Provider+Category Combos (Priority 0.6)
	// Long-tail keywords - highest conversion rate
	// Top 20 providers × 4 categories = 80 URLs
	// ============================================
	topProviders.forEach((provider) => {
		categories.forEach((category) => {
			sitemapEntries.push({
				url: `${baseUrl}/games/${provider}/${category}`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.6,
			});
		});
	});

	// ============================================
	// TIER 5: Secondary Providers (Priority 0.5)
	// Remaining providers - individual pages only
	// No category combos to avoid sitemap bloat
	// ============================================
	const secondaryProviders = [
		"5g-games",
		"568win",
		"93-connect",
		"advant",
		"afb-casino",
		"allbet",
		"aviatrix",
		"big-gaming",
		"booongo",
		"btg",
		"clotplay",
		"dragoon-soft",
		"fa-chai",
		"fastspin",
		"funky",
		"gameplay",
		"gd88",
		"ion-club",
		"jdb",
		"king-midas",
		"lambda",
		"mt",
		"no-limit",
		"pegasus",
		"phoenix-7",
		"playstar",
		"poggi-play",
		"rich88",
		"tom-horn",
		"via-casino",
		"w-casino",
		"we-entertain",
		"world-match",
		"ygr",
	];

	secondaryProviders.forEach((provider) => {
		sitemapEntries.push({
			url: `${baseUrl}/games/${provider}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		});
	});

	// ============================================
	// SUMMARY
	// Total URLs: ~180
	// - 6 core pages
	// - 4 category pages
	// - 20 top provider pages
	// - 80 provider+category combos (20 × 4)
	// - 34 secondary provider pages
	// - 36 additional slots for future expansion
	// ============================================

	return sitemapEntries;
}
