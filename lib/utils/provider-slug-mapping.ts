/**
 * Provider Slug Mapping Utility
 * Maps SEO-friendly URL slugs to actual provider names from the database
 */

import { ProviderName } from "@/types/games/gameList.types";

// Map of lowercase slug to actual provider name
export const PROVIDER_SLUG_MAP: Record<string, ProviderName> = {
	"5g-games": "5G Games",
	"568win": "568Win",
	"93-connect": "93 Connect",
	"advant": "Advant",
	"afb-casino": "AFB Casino",
	"allbet": "Allbet",
	"asia-gaming": "Asia Gaming",
	"aviatrix": "Aviatrix",
	"big-gaming": "Big Gaming",
	"booongo": "Booongo",
	"btg": "BTG",
	"clotplay": "ClotPlay",
	"cq9": "CQ9",
	"dragoon-soft": "Dragoon Soft",
	"dream-gaming": "Dream Gaming",
	"evolution": "Evolution",
	"fa-chai": "Fa Chai",
	"fastspin": "Fastspin",
	"funky": "Funky",
	"gameplay": "GamePlay",
	"gd88": "GD88",
	"habanero": "Habanero",
	"ion-club": "ION Club",
	"jdb": "JDB",
	"jili": "Jili",
	"joker": "Joker",
	"ka-gaming": "KA GAMING",
	"king-midas": "King Midas",
	"lambda": "Lambda",
	"live22": "Live22",
	"microgaming": "Microgaming",
	"mt": "MT",
	"netent": "NetEnt",
	"no-limit": "No Limit",
	"pegasus": "Pegasus",
	"pg-soft": "PG Soft",
	"phoenix-7": "Phoenix 7",
	"playstar": "PlayStar",
	"playtech": "Playtech",
	"poggi-play": "Poggi Play",
	"pragmatic-live": "Pragmatic Live",
	"pragmatic-slot": "Pragmatic Slot",
	"pragmatic-play": "Pragmatic Slot", // Alias
	"red-tiger": "Red Tiger",
	"relax": "Relax",
	"relax-gaming": "Relax", // Alias
	"rich88": "Rich88",
	"sa-gaming": "SA Gaming",
	"sexy-baccarat": "Sexy Baccarat",
	"tom-horn": "Tom Horn",
	"via-casino": "Via Casino",
	"w-casino": "W Casino",
	"we-entertain": "WE Entertain.",
	"world-match": "World Match",
	"yggdrasil": "Yggdrasil",
	"ygr": "YGR",
	"hacksaw-gaming": "Habanero", // Common alias
	"nolimit-city": "No Limit", // Common alias
};

// Reverse map for provider name to slug
export const PROVIDER_NAME_TO_SLUG: Record<string, string> = Object.entries(
	PROVIDER_SLUG_MAP
).reduce((acc, [slug, name]) => {
	acc[name] = slug;
	return acc;
}, {} as Record<string, string>);

/**
 * Convert a URL slug to the actual provider name(s)
 * Returns array for providers that have multiple variants (e.g., Pragmatic Play)
 */
export function slugToProviderName(slug: string): ProviderName | ProviderName[] | null {
	const normalized = slug.toLowerCase().trim();

	// Special case: "pragmatic-play" should return both Pragmatic providers
	if (normalized === "pragmatic-play") {
		return ["Pragmatic Live", "Pragmatic Slot"];
	}

	return PROVIDER_SLUG_MAP[normalized] || null;
}

/**
 * Get display name for breadcrumbs/UI (returns a single string)
 */
export function slugToProviderDisplayName(slug: string): string {
	const normalized = slug.toLowerCase().trim();

	// Special case: show "Pragmatic Play" as the brand name
	if (normalized === "pragmatic-play") {
		return "Pragmatic Play";
	}

	const providerName = PROVIDER_SLUG_MAP[normalized];
	return providerName || slug.split('-').map(word =>
		word.charAt(0).toUpperCase() + word.slice(1)
	).join(' ');
}

/**
 * Convert a provider name to a URL slug
 */
export function providerNameToSlug(providerName: string): string {
	// Special handling for Pragmatic Play (brand name)
	if (providerName === "Pragmatic Play") {
		return "pragmatic-play";
	}

	return (
		PROVIDER_NAME_TO_SLUG[providerName] ||
		providerName.toLowerCase().replace(/\s+/g, "-").replace(/\./g, '')
	);
}

/**
 * Category slug mapping
 */
const CATEGORY_SLUG_MAP: Record<string, string> = {
	"slot": "SLOT",
	"slots": "SLOT",
	"live-casino": "LIVE CASINO",
	"livecasino": "LIVE CASINO",
	"sports": "SPORT BOOK",
	"sportsbook": "SPORT BOOK",
	"sport-book": "SPORT BOOK",
	"rng": "RNG",
};

const CATEGORY_TO_SLUG: Record<string, string> = {
	"SLOT": "slot",
	"LIVE CASINO": "live-casino",
	"SPORT BOOK": "sports",
	"SPORTSBOOK": "sports",
	"RNG": "rng",
};

/**
 * Convert a URL slug to the actual category name
 */
export function slugToCategory(slug: string): string {
	const normalized = slug.toLowerCase().trim();
	return CATEGORY_SLUG_MAP[normalized] || slug.toUpperCase();
}

/**
 * Convert a category name to a URL slug
 */
export function categoryToSlug(category: string): string {
	return (
		CATEGORY_TO_SLUG[category.toUpperCase()] ||
		category.toLowerCase().replace(/\s+/g, "-")
	);
}
