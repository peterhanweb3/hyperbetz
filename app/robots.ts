/**
 * Dynamic Robots.txt Generator
 * Environment-aware robots rules
 */

import { MetadataRoute } from "next";
import { getSEOConfig } from "@/lib/seo/seo-config-loader";

export default function robots(): MetadataRoute.Robots {
	const config = getSEOConfig();
	const isProduction =
		config.environment === "production" ||
		process.env.NODE_ENV === "production";

	const rules = isProduction
		? config.robotsRules.production
		: config.robotsRules.staging;

	return {
		rules: [
			{
				userAgent: "*",
				allow: rules.allow,
				disallow: rules.disallow,
			},
			// Special rules for AI crawlers
			{
				userAgent: "GPTBot", // ChatGPT
				allow: isProduction ? ["/"] : [],
				disallow: isProduction
					? ["/api/", "/admin/", "/private/"]
					: ["/"],
			},
			{
				userAgent: "Google-Extended", // Google AI/Bard
				allow: isProduction ? ["/"] : [],
				disallow: isProduction
					? ["/api/", "/admin/", "/private/"]
					: ["/"],
			},
			{
				userAgent: "PerplexityBot", // Perplexity
				allow: isProduction ? ["/"] : [],
				disallow: isProduction
					? ["/api/", "/admin/", "/private/"]
					: ["/"],
			},
			{
				userAgent: "Claude-Web", // Anthropic Claude
				allow: isProduction ? ["/"] : [],
				disallow: isProduction
					? ["/api/", "/admin/", "/private/"]
					: ["/"],
			},
		],
		sitemap: rules.sitemap || undefined,
		host: config.defaultDomain,
	};
}
