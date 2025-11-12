/**
 * ==========================================================
 * Digidice Gaming Network — Robots.txt Generator
 * Version: SEO + AI + Compliance Optimized
 * ==========================================================
 * Purpose:
 * - Maximize search visibility for games, providers, and offers
 * - Allow AI indexing (not training)
 * - Protect user-sensitive and backend routes
 * - Ensure full discoverability of legal & trust pages
 * ==========================================================
 */

import { MetadataRoute } from "next";
import { interpolateSiteDomain } from '../lib/utils/site-config';

const siteDoamin = interpolateSiteDomain("{siteDomain}");

// Site configuration
const SITE_URL = `https://${siteDoamin}`;
const DEFAULT_CRAWL_DELAY = 2;

// Public content paths that should be indexed
const PUBLIC_PATHS = [
	"/",
	"/lobby",
	"/games",
	"/games/",
	"/providers",
	"/providers/",
	"/bonus",
	"/affiliate",
	"/promotions",
	"/news/",
	"/blog/",
	"/faqs",
	"/about-us",
	"/privacy-policy",
	"/terms-and-conditions",
	"/responsible-gambling",
];

// Blog SEO patterns to allow
const BLOG_SEO_PATTERNS = [
	"*/blog/*transactions*",
	"*/blog/*updates*",
	"*/blog/*news*",
];

// Sensitive paths to disallow
const SENSITIVE_PATHS = [
	"/admin/",
	"/api/",
	"/private/",
	"/_next/",
	"/server/",
	"/tmp/",
	"/checkout/",
	"/wallet/",
	"/transactions/",
	"/settings/",
	"/my-bets/",
	"/favourites/",
];

// Game-specific paths to disallow
const GAME_RESTRICTED_PATTERNS = [
	"*/casino/games/*/play*",
	"*/casino/games/*/demo*",
	"*/sports/home/live*",
	"*/sports/home/upcoming*",
	"*/sports/home/promotion*",
];

// Query parameters to disallow
const DISALLOWED_QUERY_PARAMS = [
	"*?ref=*",
	"*?utm_*",
	"*?page=*",
	"*modal=*",
	"*transaction=*",
	"*betId=*",
	"*vmcid=*",
	"*nonce=*",
	"*tab=*",
	"*serverSeed=*",
	"*clientSeed=*",
	"*currency=*",
	"*drop=*",
	"*auth*",
];

// Blog patterns to disallow
const BLOG_RESTRICTED_PATTERNS = ["*/blog/category/uncategorized*"];

// AI bots that should have access (with restrictions)
const AI_BOTS = [
	"GPTBot",
	"ClaudeBot",
	"Claude-Web",
	"PerplexityBot",
	"ChatGPT-User",
];

// AI bot with different restrictions
const AI_BOTS_LIMITED = ["Google-Extended"];

// Search engine bots
const SEARCH_ENGINE_BOTS = ["Googlebot", "Bingbot"];

// Competitor/scraper bots to block
const BLOCKED_BOTS = [
	"AhrefsBot",
	"SemrushBot",
	"botify",
	"ContentKing",
	"Amazonbot",
	"Omgilibot",
	"Diffbot",
	"ImagesiftBot",
	"Omgili",
	"YouBot",
];

export default function robots(): MetadataRoute.Robots {
	// Combine all disallowed paths
	const allDisallowedPaths = [
		...SENSITIVE_PATHS,
		...GAME_RESTRICTED_PATTERNS,
		...DISALLOWED_QUERY_PARAMS,
		...BLOG_RESTRICTED_PATTERNS,
	];

	// Combine all allowed paths
	const allAllowedPaths = [...PUBLIC_PATHS, ...BLOG_SEO_PATTERNS];

	return {
		rules: [
			// Main rule for all crawlers
			{
				userAgent: "*",
				allow: allAllowedPaths,
				disallow: allDisallowedPaths,
				crawlDelay: DEFAULT_CRAWL_DELAY,
			},
			// Search engine bots with crawl delay
			...SEARCH_ENGINE_BOTS.map((bot) => ({
				userAgent: bot,
				allow: ["/"],
				crawlDelay: DEFAULT_CRAWL_DELAY,
			})),
			// AI bots with standard restrictions
			...AI_BOTS.map((bot) => ({
				userAgent: bot,
				allow: ["/"],
				disallow: ["/api/", "/admin/", "/private/"],
			})),
			// AI bots with limited restrictions
			...AI_BOTS_LIMITED.map((bot) => ({
				userAgent: bot,
				allow: ["/"],
				disallow: ["/private/"],
			})),
			// Blocked bots
			{
				userAgent: BLOCKED_BOTS,
				disallow: ["/"],
			},
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
