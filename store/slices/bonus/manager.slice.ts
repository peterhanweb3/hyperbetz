import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export type BonusLoadingStatus = "idle" | "loading" | "success" | "error";

export interface BonusManagerState {
	isInitialized: boolean;
	isAuthenticated: boolean;
	lastFetchTimestamp: number | null;
	status: BonusLoadingStatus;
	error: string | null;
}

export interface BonusManagerActions {
	initialize: (isAuthenticated: boolean) => Promise<void>;
	refreshAll: (force?: boolean) => Promise<void>;
	setAuthenticated: (isAuthenticated: boolean) => void;
	clear: () => void;
}

export type BonusManagerSlice = BonusManagerState & BonusManagerActions;

const STALE_MS = 5 * 60 * 1000; // 5 minutes
const MANAGER_KEY = "bonus_manager_meta_v1";

// Global variable to prevent multiple simultaneous fetches
let fetchPromise: Promise<void> | null = null;

interface ManagerMeta {
	lastFetch: number;
	isAuthenticated: boolean;
}

const initialState: BonusManagerState = {
	isInitialized: false,
	isAuthenticated: false,
	lastFetchTimestamp: null,
	status: "idle",
	error: null,
};

export const createBonusManagerSlice: AppStateCreator<BonusManagerSlice> = (
	set,
	get
) => ({
	...initialState,

	setAuthenticated: (isAuthenticated: boolean) => {
		const currentAuth = get().bonus.manager.isAuthenticated;

		// If authentication status changed, reset all states and mark as not initialized
		if (currentAuth !== isAuthenticated) {
			// Clear all cached data from child slices
			get().bonus.rates.clearRates();
			get().bonus.detail.clearDetail();
			get().bonus.claim.clearClaimState();
			get().bonus.dashboard.clear();

			// Clear manager cache
			const storage = LocalStorageService.getInstance();
			storage.setItem(MANAGER_KEY, null);

			// Update auth status and mark as not initialized to trigger refresh
			set((state) => {
				state.bonus.manager.isAuthenticated = isAuthenticated;
				state.bonus.manager.isInitialized = false;
				state.bonus.manager.lastFetchTimestamp = null;
				state.bonus.manager.status = "idle";
				state.bonus.manager.error = null;
			});
		}
	},

	initialize: async (isAuthenticated: boolean) => {
		// Update auth status first (this may set isInitialized to false if auth changed)
		get().bonus.manager.setAuthenticated(isAuthenticated);

		// Get fresh slice state after setAuthenticated
		const slice = get().bonus.manager;

		// If already initialized for this auth state, skip
		if (slice.isInitialized) {
			return;
		}

		// Load from cache
		const storage = LocalStorageService.getInstance();
		try {
			const meta = storage.getItem<ManagerMeta>(MANAGER_KEY);
			if (meta?.lastFetch) {
				set((state) => {
					state.bonus.manager.lastFetchTimestamp = meta.lastFetch;
				});
			}
		} catch {
			// Ignore cache errors
		}

		// Mark as initialized
		set((state) => {
			state.bonus.manager.isInitialized = true;
		});

		// Fetch data based on auth status
		await get().bonus.manager.refreshAll(false);
	},

	refreshAll: async (force = false) => {
		// Return existing promise if already fetching (deduplication)
		if (fetchPromise && !force) {
			return fetchPromise;
		}

		const slice = get().bonus.manager;
		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();

		// Check if data is stale
		const now = Date.now();
		const isStale =
			force ||
			!slice.lastFetchTimestamp ||
			now - slice.lastFetchTimestamp > STALE_MS;

		if (!isStale && slice.status === "success") {
			return; // Use existing data
		}

		// Create and store the fetch promise
		fetchPromise = (async () => {
			set((state) => {
				state.bonus.manager.status = "loading";
				state.bonus.manager.error = null;
			});

			try {
				// Always fetch rates (public API, no auth required)
				const ratesResponse = await api.getBonusRate();
				if (!ratesResponse.error && ratesResponse.error === false) {
					get().bonus.rates.setRatesData(ratesResponse.data);
				}

				// Fetch authenticated data only if user is logged in
				if (slice.isAuthenticated) {
					const user = storage.getUserData();
					const token = getAuthToken();
					const username = user?.username;

					if (username && token) {
						// Fetch member bonus data
						const bonusResponse = await api.getMemberBonus(
							{ username },
							token
						);

						if (
							!bonusResponse.error &&
							bonusResponse.error === false
						) {
							get().bonus.dashboard.setBonusData(bonusResponse);
						}

						// Fetch bonus detail data
						const detailResponse = await api.getMemberBonusDetail(
							{ username },
							token
						);

						if (
							!detailResponse.error &&
							detailResponse.error === false
						) {
							get().bonus.detail.setDetailData(
								detailResponse.data
							);
						}
					}
				}

				// Update timestamps
				const timestamp = Date.now();
				set((state) => {
					state.bonus.manager.status = "success";
					state.bonus.manager.lastFetchTimestamp = timestamp;
				});

				// Cache metadata
				const meta: ManagerMeta = {
					lastFetch: timestamp,
					isAuthenticated: slice.isAuthenticated,
				};
				storage.setItem(MANAGER_KEY, meta);
			} catch (e) {
				const msg =
					e instanceof Error
						? e.message
						: "Failed to load bonus data";
				set((state) => {
					state.bonus.manager.status = "error";
					state.bonus.manager.error = msg;
				});
			} finally {
				// Clear the promise when done
				fetchPromise = null;
			}
		})();

		return fetchPromise;
	},

	clear: () => {
		set((state) => {
			state.bonus.manager.isInitialized = initialState.isInitialized;
			state.bonus.manager.isAuthenticated =
				initialState.isAuthenticated;
			state.bonus.manager.lastFetchTimestamp =
				initialState.lastFetchTimestamp;
			state.bonus.manager.status = initialState.status;
			state.bonus.manager.error = initialState.error;
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(MANAGER_KEY, null);

		// Clear the fetch promise
		fetchPromise = null;

		// Clear all child slices
		get().bonus.rates.clearRates();
		get().bonus.detail.clearDetail();
		get().bonus.claim.clearClaimState();
		get().bonus.dashboard.clear();
	},
});
