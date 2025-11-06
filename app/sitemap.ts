/**
 * Dynamic Sitemap Generator
 * Generates XML sitemap with multi-region support
 */

import { MetadataRoute } from "next";
import { getSEOConfig, getAvailableRegions } from "@/lib/seo/seo-config-loader";

/**
 * Generate sitemap entries for all regions
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const config = getSEOConfig();
	const regions = getAvailableRegions();

	const staticPages = [
		{ path: "/", priority: 1.0, changeFreq: "daily" as const },
		{ path: "/lobby", priority: 0.9, changeFreq: "hourly" as const },
		{ path: "/providers", priority: 0.8, changeFreq: "weekly" as const },
		{ path: "/affiliate", priority: 0.7, changeFreq: "weekly" as const },
		{ path: "/bonus", priority: 0.7, changeFreq: "weekly" as const },
		{ path: "/profile", priority: 0.5, changeFreq: "monthly" as const },
	];

	const sitemapEntries: MetadataRoute.Sitemap = [];

	// Generate entries for each region
	regions.forEach((region) => {
		const regionConfig = config.regions[region];

		staticPages.forEach((page) => {
			const url = `${regionConfig.canonicalBase}${page.path}`;

			sitemapEntries.push({
				url,
				lastModified: new Date(),
				changeFrequency: page.changeFreq,
				priority: page.priority,
				alternates: {
					languages: regions.reduce((acc, r) => {
						const rc = config.regions[r];
						acc[rc.hreflang] = `${rc.canonicalBase}${page.path}`;
						return acc;
					}, {} as Record<string, string>),
				},
			});
		});
	});

	// TODO: Add dynamic game pages
	// You can fetch game data from your API or database here
	// Example:
	// const games = await fetchGames();
	// games.forEach(game => {
	//   sitemapEntries.push({
	//     url: `${baseUrl}/play/${game.slug}`,
	//     lastModified: new Date(game.updatedAt),
	//     changeFrequency: 'weekly',
	//     priority: 0.6,
	//   });
	// });

	return sitemapEntries;
}
