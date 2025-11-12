import { createSelector } from "reselect";
import { Game } from "@/types/games/gameList.types";
import { AppStore } from "@/store/store";
import { FilterSection } from "@/types/features/query-display.types";

// --- BASE SELECTORS ---
// These are simple functions that pull raw data or state from the main store.

const selectAllGames = (state: AppStore) => state.game.list.games;
const selectAllProvidersWithIcons = (state: AppStore) =>
	state.game.providers.providers;
const selectActiveFilters = (state: AppStore) => state.query.activeFilters;
const selectSearchQuery = (state: AppStore) =>
	state.query.searchQuery.toLowerCase();
const selectSortBy = (state: AppStore) => state.query.sortBy;
const selectItemsToShow = (state: AppStore) => state.query.itemsToShow;

/**
 * Helper function to expand search keywords based on special categories
 * For example, "lottery" expands to ["lottery", "bingo", "keno", "lotto"]
 */
const expandSearchKeywords = (searchQuery: string): string[] => {
	const normalizedQuery = searchQuery.toLowerCase().trim();

	// Lottery category mapping
	if (normalizedQuery === "lottery") {
		return ["lottery", "bingo", "keno", "lotto"];
	}

	// Add more keyword expansions here in the future if needed
	// Example:
	// if (normalizedQuery === "cards") {
	//   return ["poker", "blackjack", "baccarat", "cards"];
	// }

	return [normalizedQuery];
};

// --- MEMOIZED SELECTORS (The "Engine") ---

/**
 * [ENGINE PART 1]
 * Filters the list of all games based on the active filters and search query.
 * This is a multi-step process that is memoized for performance.
 */
export const selectFilteredGames = createSelector(
	[selectAllGames, selectActiveFilters, selectSearchQuery],
	(allGames, activeFilters, searchQuery) => {
		// 1. Apply category/provider filters first.
		const filteredByCriteria = allGames.filter((game) => {
			// The `every` method ensures the game passes ALL active filter types (e.g., category AND provider).
			return Object.entries(activeFilters).every(
				([filterType, selectedValues]) => {
					if (selectedValues.length === 0) return true; // If no values for a filter type are selected, skip it.

					// This relies on the filterType matching a key on the Game object (e.g., 'category').
					const gameValue = game[filterType as keyof Game];

					// --- FIX: Normalize both the game's value and the selected values to lowercase for comparison ---
					// This prevents "Live Casino" and "LIVE CASINO" from being treated as different.
					const lowerCaseGameValue = String(gameValue).toLowerCase();
					return selectedValues.some(
						(val) => val.toLowerCase() === lowerCaseGameValue
					);
				}
			);
		});

		// 2. Apply the search query on the already-filtered list.
		if (!searchQuery) {
			return filteredByCriteria; // If no search query, return the filtered list.
		}

		// Expand search keywords if needed (e.g., "lottery" -> ["lottery", "bingo", "keno", "lotto"])
		const expandedKeywords = expandSearchKeywords(searchQuery);

		return filteredByCriteria.filter((game) => {
			const gameName = game.game_name.toLowerCase();
			// Check if the game name includes ANY of the expanded keywords
			return expandedKeywords.some((keyword) =>
				gameName.includes(keyword)
			);
		});
	}
);

/**
 * [ENGINE PART 2]
 * Takes the filtered list of games and sorts it.
 * Separating this from filtering means we don't re-filter when the user only changes the sort order.
 */
export const selectFilteredAndSortedGames = createSelector(
	[selectFilteredGames, selectSortBy],
	(filteredGames, sortBy) => {
		const sortedGames = [...filteredGames]; // Create a new array to avoid mutating the memoized one.

		switch (sortBy) {
			case "a-z":
				return sortedGames.sort((a, b) =>
					a.game_name.localeCompare(b.game_name)
				);
			case "z-a":
				return sortedGames.sort((a, b) =>
					b.game_name.localeCompare(a.game_name)
				);
			// Add more sort cases here in the future (e.g., 'popularity', 'rtp')
			default:
				return sortedGames;
		}
	}
);

/**
 * [ENGINE PART 3]
 * Generates the list of available filters for the UI.
 * This has been improved to be case-insensitive, preventing duplicate filter options.
 */
export const selectAvailableFilters = createSelector(
	[selectAllGames],
	(allGames): FilterSection[] => {
		// --- FIX: Use a Map with lowercase keys to group case-insensitive filter options ---
		const categories = new Map<string, { label: string; count: number }>();
		const providers = new Map<string, { label: string; count: number }>();

		allGames.forEach((game) => {
			// Normalize keys to lowercase for grouping
			const categoryKey = game.category.toLowerCase();
			const providerKey = game.provider_name.toLowerCase();

			// If we haven't seen this lowercase key before, add it to the map with its original casing for the label.
			if (!categories.has(categoryKey)) {
				categories.set(categoryKey, { label: game.category, count: 0 });
			}
			if (!providers.has(providerKey)) {
				providers.set(providerKey, {
					label: game.provider_name,
					count: 0,
				});
			}

			// Increment the count for the corresponding group.
			categories.get(categoryKey)!.count++;
			providers.get(providerKey)!.count++;
		});

		return [
			{
				id: "category", // The ID MUST match the key on the Game object
				label: "Game Category",
				options: Array.from(categories.values()) // Get the unique values from the map
					.map(({ label, count }) => ({
						value: label, // The value to be sent to the filter logic must have the original casing
						label: label,
						count,
					}))
					.sort((a, b) => a.label.localeCompare(b.label)),
			},
			{
				id: "provider_name", // The ID MUST match the key on the Game object
				label: "Game Provider",
				options: Array.from(providers.values())
					.map(({ label, count }) => ({
						value: label,
						label: label,
						count,
					}))
					.sort((a, b) => a.label.localeCompare(b.label)),
			},
		];
	}
);

/**
 * [ENGINE PART 4 - The Final Output]
 * Takes the fully filtered and sorted list and returns only the portion
 * that should be visible to the user based on the "Load More" pagination.
 */
export const selectVisibleGames = createSelector(
	[selectFilteredAndSortedGames, selectItemsToShow],
	(sortedGames, itemsToShow) => {
		return sortedGames.slice(0, itemsToShow);
	}
);

/**
 * [ENGINE PART 5]
 * Processes the entire list of games to generate structured data
 * specifically for building a dynamic sidebar navigation menu.
 * It calculates unique categories and providers and counts the games in each.
 * This is memoized, so it only re-calculates if the main game list changes.
 */
export const selectNavDataForGames = createSelector(
	[selectAllGames],
	(allGames) => {
		const categories = new Map<string, number>();
		const providers = new Map<string, number>();

		// Single loop to process all games efficiently
		allGames.forEach((game) => {
			// Aggregate categories
			if (game.category) {
				categories.set(
					game.category,
					(categories.get(game.category) || 0) + 1
				);
			}
			// Aggregate providers
			if (game.provider_name) {
				providers.set(
					game.provider_name,
					(providers.get(game.provider_name) || 0) + 1
				);
			}
		});

		// Convert Maps to sorted arrays of objects
		const sortedCategories = Array.from(categories.entries())
			.map(([name, count]) => ({ name, count }))
			.filter((category) => category.name !== "-")
			.sort((a, b) => a.name.localeCompare(b.name));

		const sortedProviders = Array.from(providers.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => a.name.localeCompare(b.name));

		return {
			categories: sortedCategories,
			providers: sortedProviders,
		};
	}
);

// --- DEDICATED VENDOR/NAV SELECTORS ---

/**
 * [NEW] A dedicated selector that combines providers with icons and game counts.
 * This merges the icon data from the providers store with game count data from the games store.
 */
export const selectAllProviders = createSelector(
	[selectAllGames, selectAllProvidersWithIcons],
	(allGames, providersWithIcons) => {
		// Extract provider counts from games
		const providersMap = new Map<string, number>();
		allGames.forEach((game) => {
			if (game.provider_name) {
				providersMap.set(
					game.provider_name,
					(providersMap.get(game.provider_name) || 0) + 1
				);
			}
		});

		// Create icon map for quick lookup (case-insensitive)
		const iconMap = new Map<string, string>();
		providersWithIcons.forEach((provider) => {
			if (provider.icon_url) {
				iconMap.set(provider.name.toLowerCase(), provider.icon_url);
			}
		});

		// Combine game providers with icons
		const combinedProviders = Array.from(providersMap.entries())
			.map(([name, count]) => ({
				name,
				count,
				icon_url: iconMap.get(name.toLowerCase()),
			}))
			.filter((provider) => provider.count > 0) // Only show providers that have games
			.sort((a, b) => a.name.localeCompare(b.name));

		return combinedProviders;
	}
);

/**
 * [NEW & IMPROVED] A dedicated selector for the sidebar navigation data.
 * It is now more resilient and uses the same case-insensitive logic.
 */
export const selectNavData = createSelector([selectAllGames], (allGames) => {
	const categories = new Map<string, number>();
	allGames.forEach((game) => {
		const categoryKey = game.category.trim();
		if (categoryKey) {
			categories.set(categoryKey, (categories.get(categoryKey) || 0) + 1);
		}
	});

	// Extract providers from games for nav data
	const providers = new Map<string, number>();
	allGames.forEach((game) => {
		if (game.provider_name) {
			providers.set(
				game.provider_name,
				(providers.get(game.provider_name) || 0) + 1
			);
		}
	});

	return {
		categories: Array.from(categories.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => a.name.localeCompare(b.name)),
		providers: Array.from(providers.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => a.name.localeCompare(b.name)),
	};
});

/**
 * [NEW] Selector to get providers filtered by category
 * Returns providers that have games in the specified category
 */
export const selectProvidersByCategory = (category: string) =>
	createSelector(
		[selectAllGames, selectAllProvidersWithIcons],
		(allGames, providersWithIcons) => {
			if (!category || category === "all") {
				return selectAllProviders({
					game: {
						list: { games: allGames },
						providers: { providers: providersWithIcons },
					},
				} as AppStore);
			}

			// Get provider counts for this specific category
			const providersMap = new Map<string, number>();
			allGames.forEach((game) => {
				if (
					game.category.toLowerCase() === category.toLowerCase() &&
					game.provider_name
				) {
					providersMap.set(
						game.provider_name,
						(providersMap.get(game.provider_name) || 0) + 1
					);
				}
			});

			// Create icon map for quick lookup (case-insensitive)
			const iconMap = new Map<string, string>();
			providersWithIcons.forEach((provider) => {
				if (provider.icon_url) {
					iconMap.set(provider.name.toLowerCase(), provider.icon_url);
				}
			});

			// Combine filtered providers with icons and counts
			const filteredProviders = Array.from(providersMap.entries())
				.map(([name, count]) => ({
					name,
					count,
					icon_url: iconMap.get(name.toLowerCase()),
				}))
				.filter((provider) => provider.count > 0)
				.sort((a, b) => b.count - a.count); // Sort by count descending

			return filteredProviders;
		}
	);
