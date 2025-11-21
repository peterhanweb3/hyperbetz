import { HeroSlideData } from "@/types/features/hero-banner-section.types";
import { Game, GameType, ProviderName } from "@/types/games/gameList.types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// --- META-DATA EXTRACTION UTILITIES ---

/**
 * [Specialist Tool] Extracts all unique values from a single specified key within an array of games.
 * This is the most direct tool for creating a simple list for one category (e.g., a list of all GameTypes).
 *
 * @param games - The full array of game objects.
 * @param key - The single key of the Game object to extract unique values from (e.g., 'provider_name', 'category').
 * @returns A new, flat array containing only the unique values for the specified key.
 *
 * @example
 * const allGames = [...];
 * const uniqueGameTypes = getUniqueValuesByKey(allGames, 'category');
 * // Returns: ["SLOT", "LIVE CASINO", "SPORT BOOK", "RNG"]
 */
export const getUniqueValuesByKey = <K extends keyof Game>(
	games: Game[],
	key: K
): Array<Game[K]> => {
	// Use a Set to automatically handle uniqueness, which is highly efficient.
	const uniqueValues = new Set(games.map((game) => game[key]));
	// Convert the Set back to an array for standard use.
	return Array.from(uniqueValues);
};

/**
 * [Multi-Tool] Extracts all unique values for a given set of keys from a list of games in one pass.
 * This is the perfect utility for building a complex filter UI or creating categorized data
 * structures that require information from multiple properties at once.
 *
 * @param games - The full array of game objects.
 * @param keys - An array of 'Game' object keys to extract unique values from.
 * @returns An object where each key corresponds to a key from the input array,
 *          and its value is an array of the unique values found in the games list.
 *
 * @example
 * const games = [...];
 * const categories = getUniqueValuesForKeys(games, ['category', 'vendor_name']);
 * // Returns:
 * // {
 * //   category: ["SLOT", "LIVE CASINO", ...],
 * //   vendor_name: ["EVOLUTION", "SBO"]
 * // }
 */
export const getUniqueValuesForKeys = <K extends keyof Game>(
	games: Game[],
	keys: readonly K[] // `readonly` helps with type inference
): Record<K, Array<Game[K]>> => {
	// Initialize a result object that will hold Sets for efficient uniqueness checks.
	const result = {} as Record<K, Set<Game[K]>>;
	for (const key of keys) {
		result[key] = new Set();
	}

	// Iterate through the games ONCE to populate all the sets. This is highly efficient.
	for (const game of games) {
		for (const key of keys) {
			result[key].add(game[key]);
		}
	}

	// Convert all sets to arrays for the final, usable output object.
	const finalResult = {} as Record<K, Array<Game[K]>>;
	for (const key of keys) {
		finalResult[key] = Array.from(result[key]);
	}

	return finalResult;
};

// --- GAME FILTERING UTILITIES ---

/**
 * Filters a list of games by a specific GameType category.
 * Comparison is case-insensitive to handle potential data inconsistencies (e.g., 'LIVE CASINO' vs 'Live Casino').
 *
 * @param games - The full array of game objects to filter.
 * @param category - The GameType category to filter by (e.g., "SLOT").
 * @param size - (Optional) The maximum number of games to return. Returns all matches if not provided.
 * @returns A new array of game objects matching the specified category.
 */
export const getGamesByCategory = (
	games: Game[],
	category: GameType,
	size?: number
): Game[] => {
	const filteredGames = games.filter(
		(game) => game.category.toUpperCase() === category.toUpperCase()
	);
	// If a size is specified, return a slice of the array. Otherwise, return the whole filtered list.
	return size ? filteredGames.slice(0, size) : filteredGames;
};

// --- BANNER DATA SELECTION UTILITIES (will shift to Back-end APi + zustand store later) ---

/**
 * Filters a list of games by a specific ProviderName.
 * This is ideal for creating dedicated provider pages (e.g., /games/evolution).
 * The comparison is case-insensitive to ensure robustness against different capitalization from URL params or data.
 *
 * @param games - The full array of game objects to filter.
 * @param providerName - The name of the provider to filter by. Can be a string from a URL param.
 * @param size - (Optional) The maximum number of games to return. Returns all matches if not provided.
 * @returns A new array of game objects from the specified provider.
 */
export const getGamesByProviderName = (
	games: Game[],
	providerName: ProviderName | string, // Allow string for flexibility with URL params
	size?: number
): Game[] => {
	const filteredGames = games.filter(
		(game) =>
			game.provider_name.toLowerCase() === providerName.toLowerCase()
	);
	return size ? filteredGames.slice(0, size) : filteredGames;
};

/**
 * Returns a list of all providers along with the count of games for each provider.
 *
 * @param games - The full array of game objects.
 * @returns An array of objects, each containing a provider name and the count of games for that provider.
 *
 * @example
 * const result = getProviderGameCounts(games);
 * // Returns: [{ provider_name: "EVOLUTION", count: 12 }, { provider_name: "SBO", count: 5 }]
 */
export const getProviderGameCounts = (
	games: Game[]
): Array<{ provider_name: ProviderName | string; count: number }> => {
	const providerCounts: Record<string, number> = {};

	for (const game of games) {
		const provider = game.provider_name;
		providerCounts[provider] = (providerCounts[provider] || 0) + 1;
	}

	return Object.entries(providerCounts).map(([provider_name, count]) => ({
		provider_name,
		count,
	}));
};

/**
 * Returns a list of all providers for a specific game category along with the count of games for each provider in that category.
 *
 * @param games - The full array of game objects.
 * @param category - The GameType category to filter by (e.g., "SLOT", "LIVE CASINO").
 * @returns An array of objects, each containing a provider name and the count of games for that provider in the specified category.
 *
 * @example
 * const result = getProvidersForCategory(games, "SLOT");
 * // Returns: [{ provider_name: "Pragmatic Play", count: 8 }, { provider_name: "NetEnt", count: 5 }]
 */
export const getProvidersForCategory = (
	games: Game[],
	category: GameType
): Array<{ provider_name: ProviderName | string; count: number }> => {
	// First filter games by category
	const categoryGames = getGamesByCategory(games, category);

	// Then count games by provider within that category
	const providerCounts: Record<string, number> = {};

	for (const game of categoryGames) {
		const provider = game.provider_name;
		providerCounts[provider] = (providerCounts[provider] || 0) + 1;
	}

	return Object.entries(providerCounts)
		.map(([provider_name, count]) => ({
			provider_name,
			count,
		}))
		.sort((a, b) => b.count - a.count); // Sort by count descending
};

/**
 * Selects a specified number of games from the start of the list.
 * NOTE: This is a placeholder for a real "newest games" logic. In a real application,
 * this would filter based on a `releaseDate` property.
 *
 * @param games - The full array of all games.
 * @param count - The number of games to return.
 * @returns An array containing the first `count` games.
 */
export const getNewestGames = (games: Game[], count: number): Game[] => {
	return games.slice(0, count);
};

/**
 * Selects a specified number of games to represent "popular" titles.
 * NOTE: This is a placeholder for a real popularity logic (e.g., sorting by `playCount`).
 * Here, we simply take a slice from a different part of the array to get a unique set.
 *
 * @param games - The full array of all games.
 * @param count - The number of games to return.
 * @returns An array of games to be featured as "popular".
 */
export const getPopularGames = (games: Game[], count: number): Game[] => {
	// Taking a slice from a different index to ensure it's not the same as "newest".
	return games.slice(10, 10 + count);
};

/**
 * Converts an array of Game objects into an array of HeroSlideData objects.
 * This is used to dynamically populate hero sliders with playable game content.
 *
 * @param games - An array of `Game` objects to be converted.
 * @param router - The Next.js App Router instance, used to programmatically navigate.
 * @returns An array of `HeroSlideData` objects, ready to be passed to a hero banner.
 */
export const convertGamesToHeroSlides = (
	games: Game[],
	router: AppRouterInstance
): HeroSlideData[] => {
	return games.map((game) => {
		// Construct the unique play URL for each game.
		const queryParams = new URLSearchParams({
			vendor: game.vendor_name,
			gameType: game.own_game_type,
			gpId: String(game.gp_id),
		}).toString();
		const gameUrl = `/play/${game.game_id}?${queryParams}`;

		return {
			game: game, // Attach the original game object
			backgroundImageUrl:
				game.full_url_game_image || "/placeholder-bg.jpg",
			title: game.game_name,
			subtitle: `By ${game.provider_name}`,
			buttonText: "Play Now",
			// The button's action is to navigate to the game's middleware page.
			onButtonClick: () => router.push(gameUrl),
		};
	});
};
