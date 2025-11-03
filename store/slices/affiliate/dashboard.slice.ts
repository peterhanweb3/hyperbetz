import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import {
	AffiliateRate,
	GetDownlineResponse,
} from "@/types/affiliate/affiliate.types";

export type AffiliateLoadingStatus = "idle" | "loading" | "success" | "error";

export interface AffiliateDashboardState {
	downline: GetDownlineResponse | null;
	rates: AffiliateRate[];
	status: AffiliateLoadingStatus;
	error: string | null;
	lastFetched: number | null;
	isClaiming: boolean;
	isInitialized: boolean;
}

export interface AffiliateDashboardActions {
	initialize: (force?: boolean) => void;
	fetchData: (force?: boolean) => Promise<void>;
	claim: () => Promise<void>;
	setDownline: (data: GetDownlineResponse) => void;
	setRates: (rates: AffiliateRate[]) => void;
	clear: () => void;
}

export type AffiliateDashboardSlice = AffiliateDashboardState &
	AffiliateDashboardActions;

const STALE_MS = 5 * 60 * 1000;
const DOWNLINE_KEY = "affiliate_downline_cache_v1";
const RATES_KEY = "affiliate_rates_cache_v1";
const META_KEY = "affiliate_meta_cache_v1";

// Global variable to prevent multiple simultaneous API calls
let fetchPromise: Promise<void> | null = null;

interface CachedMeta {
	downlineFetched?: number;
	ratesFetched?: number;
}

const initialState: AffiliateDashboardState = {
	downline: null,
	rates: [],
	status: "idle",
	error: null,
	lastFetched: null,
	isClaiming: false,
	isInitialized: false,
};

export const createAffiliateDashboardSlice: AppStateCreator<
	AffiliateDashboardSlice
> = (set, get) => ({
	...initialState,

	setDownline: (data: GetDownlineResponse) => {
		set((state) => {
			state.affiliate.dashboard.downline = data;
			state.affiliate.dashboard.status = "success";
			state.affiliate.dashboard.error = null;
		});
		const storage = LocalStorageService.getInstance();
		const meta: CachedMeta = storage.getItem<CachedMeta>(META_KEY) || {};
		meta.downlineFetched = Date.now();
		storage.setItem(DOWNLINE_KEY, data);
		storage.setItem(META_KEY, meta);
	},

	setRates: (rates: AffiliateRate[]) => {
		set((state) => {
			state.affiliate.dashboard.rates = rates;
		});
		const storage = LocalStorageService.getInstance();
		const meta: CachedMeta = storage.getItem<CachedMeta>(META_KEY) || {};
		meta.ratesFetched = Date.now();
		storage.setItem(RATES_KEY, rates);
		storage.setItem(META_KEY, meta);
	},

	fetchData: async (force = false) => {
		// Return existing promise if already fetching (deduplication)
		if (fetchPromise && !force) {
			return fetchPromise;
		}

		const currentSlice = get().affiliate.dashboard;
		if (currentSlice.status === "loading" && !force) return;

		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const user = storage.getUserData();
		const token = storage.getAuthToken();
		const username = user?.username;

		if (!username || !token) return;

		const meta = storage.getItem<CachedMeta>(META_KEY) || {};
		const now = Date.now();
		const stale =
			force ||
			!meta.downlineFetched ||
			!meta.ratesFetched ||
			now - (meta.downlineFetched || 0) > STALE_MS ||
			now - (meta.ratesFetched || 0) > STALE_MS;

		if (!stale) return;

		// Create and store the fetch promise
		fetchPromise = (async () => {
			set((state) => {
				state.affiliate.dashboard.status = "loading";
				state.affiliate.dashboard.error = null;
			});

			try {
				// Fetch downline first
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
					get().affiliate.dashboard.setDownline(downlineResponse);
				}

				// Then fetch rates
				const ratesResponse = await api.getAffiliateRate(
					{ username, jwt_type: "dyn", api_key: token },
					token
				);

				if (!ratesResponse.error) {
					get().affiliate.dashboard.setRates(ratesResponse.data);
				}

				set((state) => {
					state.affiliate.dashboard.lastFetched = Date.now();
				});
			} catch (e) {
				const msg =
					e instanceof Error
						? e.message
						: "Failed to load affiliate data";
				set((state) => {
					state.affiliate.dashboard.status = "error";
					state.affiliate.dashboard.error = msg;
				});
			} finally {
				// Clear the promise when done
				fetchPromise = null;
			}
		})();

		return fetchPromise;
	},

	initialize: (force = false) => {
		const currentSlice = get().affiliate.dashboard;

		// Prevent multiple initializations
		if (currentSlice.isInitialized && !force) return;

		set((state) => {
			state.affiliate.dashboard.isInitialized = true;
		});

		const storage = LocalStorageService.getInstance();
		try {
			const cachedDownline =
				storage.getItem<GetDownlineResponse>(DOWNLINE_KEY);
			const cachedRates =
				storage.getItem<AffiliateRate[]>(RATES_KEY) || [];
			const meta = storage.getItem<CachedMeta>(META_KEY);

			if (cachedDownline) {
				get().affiliate.dashboard.setDownline(cachedDownline);
			}
			if (cachedRates.length) {
				get().affiliate.dashboard.setRates(cachedRates);
			}

			if (meta?.downlineFetched || meta?.ratesFetched) {
				set((state) => {
					state.affiliate.dashboard.lastFetched = Math.min(
						meta.downlineFetched || Date.now(),
						meta.ratesFetched || Date.now()
					);
				});
			}
		} catch {
			/* ignore */
		}

		// Only fetch if we don't have cached data or if it's stale
		const hasValidCache =
			currentSlice.downline && currentSlice.rates?.length > 0;
		if (!hasValidCache || force) {
			get().affiliate.dashboard.fetchData(force);
		}
	},

	claim: async () => {
		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const user = storage.getUserData();
		const token = storage.getAuthToken();
		const username = user?.username;
		const currentSlice = get().affiliate.dashboard;
		const { downline, isClaiming } = currentSlice;

		if (
			!username ||
			!token ||
			isClaiming ||
			!downline ||
			downline.total_unclaim <= 0
		)
			return;

		set((state) => {
			state.affiliate.dashboard.isClaiming = true;
		});

		try {
			const res = await api.claimAffiliateBonus({ username }, token);
			if (!res.error) {
				await get().affiliate.dashboard.fetchData(true);
			}
		} catch {
			/* swallow */
		} finally {
			set((state) => {
				state.affiliate.dashboard.isClaiming = false;
			});
		}
	},

	clear: () => {
		set((state) => {
			state.affiliate.dashboard.downline = initialState.downline;
			state.affiliate.dashboard.rates = initialState.rates;
			state.affiliate.dashboard.status = initialState.status;
			state.affiliate.dashboard.error = initialState.error;
			state.affiliate.dashboard.lastFetched = initialState.lastFetched;
			state.affiliate.dashboard.isClaiming = initialState.isClaiming;
			state.affiliate.dashboard.isInitialized =
				initialState.isInitialized;
		});
		// Also clear the fetch promise
		fetchPromise = null;
	},
});
