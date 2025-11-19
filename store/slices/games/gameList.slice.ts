import { Game } from "@/types/games/gameList.types";
import ApiService from "@/services/apiService";
import { AppStateCreator } from "@/store/store";
import { safeLocalStorage } from "@/lib/utils/safe-storage";

type loadingStatus = "idle" | "loading" | "success" | "error";

interface GameListInitialState {
	games: Game[];
	status: loadingStatus;
	error: string | null;
}

interface GameListActions {
	setGamesList: (games: Game[]) => void;
	fetchGamesList: (jwtToken?: string) => Promise<void>;
	initializeGameList: (jwtToken?: string) => void;
}

const initialState: GameListInitialState = {
	games: [],
	status: "idle",
	error: null,
};

const GAMES_LIST_LOCAL_STORAGE_KEY = "game-list-cache";

const createGameListSlice: AppStateCreator<
	GameListInitialState & GameListActions
> = (set, get) => ({
	...initialState,
	// --- ACTION 1: The Simple Setter ---
	setGamesList: (games) => {
		// This function's only job is to update state and cache.

		set((state) => {
			// Guard against receiving non-array data
			if (!Array.isArray(games)) {
				console.error("setGamesList received non-array data:", games);
				state.game.list.status = "error";
				state.game.list.error = "Invalid data format received.";
				return;
			}
			state.game.list.games = games;
			state.game.list.status = "success";
			state.game.list.error = null;
		});

		const newCacheData = { games: games, timestamp: Date.now() };
		// console.log(`setGamesList's newCachedData ${JSON.stringify(newCacheData)}`);
		safeLocalStorage.setItem(
			GAMES_LIST_LOCAL_STORAGE_KEY,
			JSON.stringify(newCacheData)
		);
	},

	// --- ACTION 2: The API Worker ---
	fetchGamesList: async (jwtToken?: string) => {
		// Prevent duplicate fetches.
		if (get().game.list.status === "loading") return;

		set((state) => {
			state.game.list.status = "loading";
			state.game.list.error = null;
		});

		try {
			const api = ApiService.getInstance();
			const response = await api.fetchGameList(jwtToken);
			if (response.error) {
				// console.log(`error message in fetchGameslist reducer ${response.message}`);
				throw new Error(response.message);
			}

			// --- ADD THIS LOG ---
			// console.log("Full API Response received in fetchGamesList:", JSON.stringify(response, null, 2));
			// Let's also log the specific part we are about to pass
			// console.log("Data being passed to setGamesList:", response.data);
			// --- END OF NEW LOG ---

			// On success, it calls the setter action.
			get().game.list.setGamesList(response.data);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unknown error occurred";
			set((state) => {
				state.game.list.status = "error";
				state.game.list.error = errorMessage;
			});
		}
	},

	// --- ACTION 3: The UI's Entry Point ---
	initializeGameList: (jwtToken?: string) => {
		// First, check the cache.
		try {
			const cachedItem = safeLocalStorage.getItem(
				GAMES_LIST_LOCAL_STORAGE_KEY
			);
			if (cachedItem) {
				const cache = JSON.parse(cachedItem);
				const cacheAgeMinutes =
					(Date.now() - cache.timestamp) / 1000 / 60;

				if (cacheAgeMinutes < 10) {
					// console.log("Initializing from valid cache.");
					// If the cache is valid, use the setter directly.
					get().game.list.setGamesList(cache.games);
					return; // And we're done.
				}
			}
		} catch (error) {
			console.error("Could not read from cache.", error);
		}

		// If we're here, the cache was invalid or empty.
		// Call the worker to get fresh data.
		// console.log("Cache invalid, fetching fresh data.");
		get().game.list.fetchGamesList(jwtToken);
	},
});

export { createGameListSlice };
export type { GameListActions, GameListInitialState };
