import { ProviderWithIcon } from "@/types/games/providerIcon.types";
import ApiService from "@/services/apiService";
import { AppStateCreator } from "@/store/store";
import { safeLocalStorage } from "@/lib/utils/safe-storage";

type loadingStatus = "idle" | "loading" | "success" | "error";

interface ProviderListInitialState {
	providers: ProviderWithIcon[];
	status: loadingStatus;
	error: string | null;
}

interface ProviderListActions {
	setProvidersList: (providers: ProviderWithIcon[]) => void;
	fetchProviderIcons: () => Promise<void>;
	initializeProviderList: () => void;
}

const initialState: ProviderListInitialState = {
	providers: [],
	status: "idle",
	error: null,
};

const PROVIDERS_LIST_LOCAL_STORAGE_KEY = "providers-list-cache";

const createProviderListSlice: AppStateCreator<
	ProviderListInitialState & ProviderListActions
> = (set, get) => ({
	...initialState,

	// --- ACTION 1: The Simple Setter ---
	setProvidersList: (providers) => {
		set((state) => {
			if (!Array.isArray(providers)) {
				console.error(
					"setProvidersList received non-array data:",
					providers
				);
				state.game.providers.status = "error";
				state.game.providers.error = "Invalid data format received.";
				return;
			}
			state.game.providers.providers = providers;
			state.game.providers.status = "success";
			state.game.providers.error = null;
		});

		const newCacheData = { providers: providers, timestamp: Date.now() };
		// console.log("Storing providers in localStorage:", newCacheData);
		safeLocalStorage.setItem(
			PROVIDERS_LIST_LOCAL_STORAGE_KEY,
			JSON.stringify(newCacheData)
		);
	},

	// --- ACTION 2: Fetch Provider Icons from API ---
	fetchProviderIcons: async () => {
		if (get().game.providers.status === "loading") return;

		set((state) => {
			state.game.providers.status = "loading";
			state.game.providers.error = null;
		});

		try {
			const api = ApiService.getInstance();
			const response = await api.fetchProviderIcons();

			if (response.error) {
				throw new Error(response.message);
			}

			// console.log("Provider icons API response:", response.data);

			// Convert the icon API response to our provider format
			const providersWithIcons: ProviderWithIcon[] = response.data.map(
				(iconData) => ({
					name: iconData.provider_name,
					count: 0, // Will be updated by selector when games are available
					icon_url: iconData.icon_url,
				})
			);

			// console.log("Converted providers with icons:", providersWithIcons);
			get().game.providers.setProvidersList(providersWithIcons);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unknown error occurred";
			set((state) => {
				state.game.providers.status = "error";
				state.game.providers.error = errorMessage;
			});
		}
	},

	// --- ACTION 3: Initialize Provider List ---
	initializeProviderList: () => {
		// console.log("Initializing provider list...");

		// Clear old cache format that might have count data
		const oldCacheItem = safeLocalStorage.getItem(
			PROVIDERS_LIST_LOCAL_STORAGE_KEY
		);
		if (oldCacheItem) {
			try {
				const cache = JSON.parse(oldCacheItem);
				if (
					cache.providers &&
					cache.providers.length > 0 &&
					cache.providers[0].hasOwnProperty("count")
				) {
					// console.log("Clearing old cache format with count data");
					safeLocalStorage.removeItem(PROVIDERS_LIST_LOCAL_STORAGE_KEY);
				}
			} catch (error) {
				console.error("Error checking old cache format:", error);
				safeLocalStorage.removeItem(PROVIDERS_LIST_LOCAL_STORAGE_KEY);
			}
		}

		// First, check the cache for providers
		try {
			const cachedItem = safeLocalStorage.getItem(
				PROVIDERS_LIST_LOCAL_STORAGE_KEY
			);
			if (cachedItem) {
				const cache = JSON.parse(cachedItem);
				const cacheAgeMinutes =
					(Date.now() - cache.timestamp) / 1000 / 60;

				// console.log("Found cached providers, age:", cacheAgeMinutes, "minutes");

				if (cacheAgeMinutes < 60) {
					// Cache providers for 1 hour
					// console.log("Using cached providers:", cache.providers);
					get().game.providers.setProvidersList(cache.providers);
					return;
				}
			}
		} catch (error) {
			console.error("Could not read providers from cache.", error);
		}

		// If cache is invalid, fetch fresh provider icons
		// console.log("Cache invalid, fetching fresh provider icons...");
		get().game.providers.fetchProviderIcons();
	},
});

export { createProviderListSlice };
export type { ProviderListActions, ProviderListInitialState };
