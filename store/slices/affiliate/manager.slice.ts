import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export type AffiliateLoadingStatus = "idle" | "loading" | "success" | "error";

export interface AffiliateManagerState {
	isInitialized: boolean;
	isAuthenticated: boolean;
	lastFetchTimestamp: number | null;
	status: AffiliateLoadingStatus;
	error: string | null;
}

export interface AffiliateManagerActions {
	initialize: (isAuthenticated: boolean) => Promise<void>;
	refreshAll: (force?: boolean) => Promise<void>;
	setAuthenticated: (isAuthenticated: boolean) => void;
	clear: () => void;
}

export type AffiliateManagerSlice = AffiliateManagerState &
	AffiliateManagerActions;

const STALE_MS = 5 * 60 * 1000; // 5 minutes
const MANAGER_KEY = "affiliate_manager_meta_v1";

// Global variable to prevent multiple simultaneous fetches
let fetchPromise: Promise<void> | null = null;

interface ManagerMeta {
	lastFetch: number;
	isAuthenticated: boolean;
}

const initialState: AffiliateManagerState = {
	isInitialized: false,
	isAuthenticated: false,
	lastFetchTimestamp: null,
	status: "idle",
	error: null,
};

export const createAffiliateManagerSlice: AppStateCreator<
	AffiliateManagerSlice
> = (set, get) => ({
	...initialState,

	setAuthenticated: (isAuthenticated: boolean) => {
		const currentAuth = get().affiliate.manager.isAuthenticated;

		// If authentication status changed, reset all states and mark as not initialized
		if (currentAuth !== isAuthenticated) {
			// Clear all cached data from child slices
			get().affiliate.downline.clearDownline();
			get().affiliate.rates.clearRates();
			get().affiliate.referrals.clearReferrals();
			get().affiliate.claim.clearClaimState();

			// Clear manager cache
			const storage = LocalStorageService.getInstance();
			storage.setItem(MANAGER_KEY, null);

			// Update auth status and mark as not initialized to trigger refresh
			set((state) => {
				state.affiliate.manager.isAuthenticated = isAuthenticated;
				state.affiliate.manager.isInitialized = false;
				state.affiliate.manager.lastFetchTimestamp = null;
				state.affiliate.manager.status = "idle";
				state.affiliate.manager.error = null;
			});
		}
	},

	initialize: async (isAuthenticated: boolean) => {
		// Update auth status first (this may set isInitialized to false if auth changed)
		get().affiliate.manager.setAuthenticated(isAuthenticated);

		// Get fresh slice state after setAuthenticated
		const slice = get().affiliate.manager;

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
					state.affiliate.manager.lastFetchTimestamp = meta.lastFetch;
				});
			}
		} catch {
			// Ignore cache errors
		}

		// Mark as initialized
		set((state) => {
			state.affiliate.manager.isInitialized = true;
		});

		// Fetch data based on auth status
		await get().affiliate.manager.refreshAll(false);
	},

	refreshAll: async (force = false) => {
		// Return existing promise if already fetching (deduplication)

		console.log("yha se gya");
		const slice = get().affiliate.manager;
		console.log("lele");
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

		console.log("yha agfya ");

		// Create and store the fetch promise
		fetchPromise = (async () => {
			set((state) => {
				state.affiliate.manager.status = "loading";
				state.affiliate.manager.error = null;
			});

			try {
				// Always fetch rates (public API, no auth required)
				const ratesResponse = await api.getAffiliateRate();
				if (!ratesResponse.error) {
					get().affiliate.rates.setRatesData(ratesResponse.data);
				}

				// Fetch authenticated data only if user is logged in
				if (slice.isAuthenticated) {
					const user = storage.getUserData();
					const token = getAuthToken();
					const username = user?.username;

					if (username && token) {
						// Fetch downline data
						const downlineResponse = await api.getDownline(
							{
								username,
								page_number: 1,
								limit: 10,
								order: "unclaimed_amount",
							},
							token
						);

						if (!downlineResponse.error) {
							get().affiliate.downline.setDownlineData(
								downlineResponse
							);
						}

						// Fetch referrals data
						const referralsSortOrder =
							get().affiliate.referrals.sortOrder;
						const apiSortOrder =
							referralsSortOrder === "nickname_asc" ||
							referralsSortOrder === "nickname_desc"
								? "last_login"
								: referralsSortOrder;

						const referralsResponse = await api.getDownline(
							{
								username,
								page_number:
									get().affiliate.referrals.currentPage,
								limit: get().affiliate.referrals.recordsPerPage,
								order: apiSortOrder,
							},
							token
						);

						if (!referralsResponse.error) {
							get().affiliate.referrals.setReferralsData(
								referralsResponse
							);
						}
					}
				}

				// Update timestamps
				const timestamp = Date.now();
				set((state) => {
					state.affiliate.manager.status = "success";
					state.affiliate.manager.lastFetchTimestamp = timestamp;
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
						: "Failed to load affiliate data";
				set((state) => {
					state.affiliate.manager.status = "error";
					state.affiliate.manager.error = msg;
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
			state.affiliate.manager.isInitialized = initialState.isInitialized;
			state.affiliate.manager.isAuthenticated =
				initialState.isAuthenticated;
			state.affiliate.manager.lastFetchTimestamp =
				initialState.lastFetchTimestamp;
			state.affiliate.manager.status = initialState.status;
			state.affiliate.manager.error = initialState.error;
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(MANAGER_KEY, null);

		// Clear the fetch promise
		fetchPromise = null;

		// Clear all child slices
		get().affiliate.downline.clearDownline();
		get().affiliate.rates.clearRates();
		get().affiliate.referrals.clearReferrals();
		get().affiliate.claim.clearClaimState();
	},
});
