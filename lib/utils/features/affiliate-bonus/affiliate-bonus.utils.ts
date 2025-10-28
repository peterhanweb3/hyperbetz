import { AffiliateRate } from "@/types/affiliate/affiliate.types";
import { BonusRate } from "@/types/bonus/bonus.types";

/**
 * Calculate commission amount for a specific game type
 * @param rate - The rate tier containing percentage rates for all game types
 * @param amount - The wager amount
 * @param tierLevel - The tier level (1-7)
 * @param gameType - The type of game: "slots", "liveCasino", or "sports"
 * @returns Formatted commission amount as currency string
 */
const comissionAmount = (
	rate: AffiliateRate | BonusRate,
	amount: number,
	tierLevel: number,
	gameType: "slots" | "liveCasino" | "sports"
) => {
	if (!rate) return "$0.00";

	// Get the appropriate percentage based on game type
	let percentage = 0;
	switch (gameType) {
		case "slots":
			percentage = parseFloat(rate.slot_percent) / 100;
			break;
		case "liveCasino":
			percentage = parseFloat(rate.lc_percent) / 100;
			break;
		case "sports":
			percentage = parseFloat(rate.sport_percent) / 100;
			break;
		default:
			percentage = 0;
	}

	// Calculate commission
	const commission = amount * percentage;

	return commission.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	});
};

/**
 * Formats a turnover range into a human-readable string with locale-formatted numbers.
 * If the maximum value exceeds $1 billion, returns a "greater than" format with only the minimum.
 *
 * @param {string} min - The minimum turnover value as a string
 * @param {string} max - The maximum turnover value as a string
 * @returns {string} Formatted turnover string (e.g., "$100,000 - $500,000" or "> $1,000,000")
 *
 * @example
 * formatTurnoverRange("100000", "500000")
 * // Returns: "$100,000 - $500,000"
 *
 * @example
 * formatTurnoverRange("1000000", "2000000000")
 * // Returns: "> $1,000,000"
 */
const formatTurnoverRange = (min: string, max: string) => {
	const minNum = parseInt(min);
	const maxNum = parseInt(max);
	if (maxNum > 1_000_000_000) return `> $${minNum.toLocaleString()}`;
	return `$${minNum.toLocaleString()} - $${maxNum.toLocaleString()}`;
};

/**
 * Formats a turnover range into a compact string using thousands (k) notation.
 * If the maximum value exceeds $1 billion, returns a "greater than" format with only the minimum.
 *
 * @param {string} min - The minimum turnover value as a string
 * @param {string} max - The maximum turnover value as a string
 * @returns {string} Formatted turnover string in thousands (e.g., "$100k - $500k" or "> $1500k")
 *
 * @example
 * formatTurnoverRangeCompact("100000", "500000")
 * // Returns: "$100k - $500k"
 *
 * @example
 * formatTurnoverRangeCompact("1000000", "2000000000")
 * // Returns: "> $1000k"
 */
const formatTurnoverRangeCompact = (min: string, max: string) => {
	const minNum = parseInt(min);
	const maxNum = parseInt(max);
	if (maxNum > 1_000_000_000) return `> $${(minNum / 1000).toFixed(0)}k`;
	return `$${(minNum / 1000).toFixed(0)}k - $${(maxNum / 1000).toFixed(0)}k`;
};

/**
 * Returns color scheme configuration for a given tier level with background and ring colors.
 * Uses a predefined set of 7 color themes. Defaults to slate (level 1) if the level is out of range.
 *
 * @param {number} level - The tier level (1-7, where 1 is the lowest tier)
 * @returns {{ bg: string, ring: string }} Object containing background and ring color names
 *
 * @example
 * getTierColorScheme(1)
 * // Returns: { bg: "slate", ring: "slate" }
 *
 * @example
 * getTierColorScheme(3)
 * // Returns: { bg: "emerald", ring: "emerald" }
 *
 * @example
 * getTierColorScheme(10)
 * // Returns: { bg: "slate", ring: "slate" } (defaults to level 1)
 */
const getTierColorScheme = (level: number) => {
	const colors = [
		{ bg: "slate", ring: "slate" },
		{ bg: "amber", ring: "amber" },
		{ bg: "emerald", ring: "emerald" },
		{ bg: "blue", ring: "blue" },
		{ bg: "purple", ring: "purple" },
		{ bg: "pink", ring: "pink" },
		{ bg: "orange", ring: "orange" },
	];
	return colors[level - 1] || colors[0];
};

/**
 * Returns a comprehensive color scheme for a given commission tier level.
 * Color schemes are themed to match tier names (Bronze, Silver, Gold, Platinum, Emerald, Ruby, Diamond).
 * Provides Tailwind CSS class names for gradients and colors. Defaults to bronze (level 1) if the level is out of range.
 *
 * @param {number} level - The tier level (1-7: Bronze, Silver, Gold, Platinum, Emerald, Ruby, Diamond)
 * @returns {{ gradient: string, bg: string, light: string }} Object containing Tailwind CSS class names for gradient, background, and light color variants
 *
 * @example
 * getTierColorSchemeWithGradient(1) // Bronze
 * // Returns: { gradient: "from-amber-700 to-amber-800", bg: "amber-700", light: "amber" }
 *
 * @example
 * getTierColorSchemeWithGradient(5) // Emerald
 * // Returns: { gradient: "from-emerald-500 to-emerald-600", bg: "emerald-500", light: "emerald" }
 *
 * @example
 * getTierColorSchemeWithGradient(7) // Diamond
 * // Returns: { gradient: "from-cyan-400 to-blue-500", bg: "cyan-400", light: "cyan" }
 */
const getTierColorSchemeWithGradient = (level: number) => {
	const colors = [
		{
			// Bronze - warm brown/amber
			gradient: "from-amber-700 to-amber-800",
			bg: "amber-700",
			light: "amber",
		},
		{
			// Silver - gray with metallic feel
			gradient: "from-slate-400 to-slate-500",
			bg: "slate-400",
			light: "slate",
		},
		{
			// Gold - rich yellow/gold
			gradient: "from-yellow-500 to-yellow-600",
			bg: "yellow-500",
			light: "yellow",
		},
		{
			// Platinum - light gray/silver with shine
			gradient: "from-gray-300 to-gray-400",
			bg: "gray-300",
			light: "gray",
		},
		{
			// Emerald - green gem
			gradient: "from-emerald-500 to-emerald-600",
			bg: "emerald-500",
			light: "emerald",
		},
		{
			// Ruby - deep red gem
			gradient: "from-red-600 to-red-700",
			bg: "red-600",
			light: "red",
		},
		{
			// Diamond - brilliant cyan/blue sparkle
			gradient: "from-cyan-400 to-blue-500",
			bg: "cyan-400",
			light: "cyan",
		},
	];
	return colors[level - 1] || colors[0];
};

// Helper function to parse amount string (e.g., "$250" -> 250)
const parseAmount = (amountStr: string): number => {
	return parseFloat(amountStr.replace(/[$,]/g, ""));
};

// Helper function to extract game type from gameKey
const getGameType = (gameKey: string): "slots" | "liveCasino" | "sports" => {
	if (gameKey.includes("slots")) return "slots";
	if (gameKey.includes("liveCasino")) return "liveCasino";
	return "sports";
};

export {
	comissionAmount,
	formatTurnoverRange,
	formatTurnoverRangeCompact,
	getTierColorScheme,
	getTierColorSchemeWithGradient,
	parseAmount,
	getGameType,
};
