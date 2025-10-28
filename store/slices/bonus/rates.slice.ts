import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { BonusRate } from "@/types/bonus/bonus.types";

export type RatesLoadingStatus = "idle" | "loading" | "success" | "error";

export interface BonusRatesState {
	data: BonusRate[];
	status: RatesLoadingStatus;
	error: string | null;
	lastFetched: number | null;
	isInitialized: boolean;
}

export interface BonusRatesActions {
	fetchRates: (force?: boolean) => Promise<void>;
	setRatesData: (rates: BonusRate[]) => void;
	clearRates: () => void;
	initializeFromCache: () => void;
	initialize: (force?: boolean) => void;
}

export type BonusRatesSlice = BonusRatesState & BonusRatesActions;

const RATES_KEY = "bonus_rates_cache_v1";
const RATES_META_KEY = "bonus_rates_meta_v1";
const STALE_MS = 5 * 60 * 1000; // 5 minutes

// Global variable to prevent multiple simultaneous API calls
let ratesFetchPromise: Promise<void> | null = null;

interface RatesMeta {
	lastFetched: number;
}

const initialState: BonusRatesState = {
	data: [],
	status: "idle",
	error: null,
	lastFetched: null,
	isInitialized: false,
};

export const createBonusRatesSlice: AppStateCreator<BonusRatesSlice> = (
	set,
	get
) => ({
	...initialState,

	setRatesData: (rates) => {
		set((state) => {
			state.bonus.rates.data = rates;
			state.bonus.rates.status = "success";
			state.bonus.rates.error = null;
			state.bonus.rates.lastFetched = Date.now();
		});

		const storage = LocalStorageService.getInstance();
		const meta: RatesMeta = { lastFetched: Date.now() };
		storage.setItem(RATES_KEY, rates);
		storage.setItem(RATES_META_KEY, meta);
	},

	fetchRates: async (force = false) => {
		// Return existing promise if already fetching (deduplication)
		if (ratesFetchPromise && !force) {
			return ratesFetchPromise;
		}

		const slice = get().bonus.rates;
		if (slice.status === "loading" && !force) return;

		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const token = storage.getAuthToken();

		if (!token) return;

		// Check if data is stale
		const meta = storage.getItem<RatesMeta>(RATES_META_KEY);
		const now = Date.now();
		const isStale =
			force || !meta?.lastFetched || now - meta.lastFetched > STALE_MS;

		if (!isStale && slice.data.length > 0) return; // Use existing data

		// Create and store the fetch promise
		ratesFetchPromise = (async () => {
			set((state) => {
				state.bonus.rates.status = "loading";
				state.bonus.rates.error = null;
			});

			try {
				const response = await api.getBonusRate(token);

				if (!response.error && response.error === false) {
					get().bonus.rates.setRatesData(response.data);
				} else {
					throw new Error("Failed to fetch bonus rates");
				}
			} catch (e) {
				const msg =
					e instanceof Error
						? e.message
						: "Failed to load bonus rates";
				set((state) => {
					state.bonus.rates.status = "error";
					state.bonus.rates.error = msg;
				});
			} finally {
				// Clear the promise when done
				ratesFetchPromise = null;
			}
		})();

		return ratesFetchPromise;
	},

	initialize: (force = false) => {
		const slice = get().bonus.rates;

		// Prevent multiple initializations
		if (slice.isInitialized && !force) return;

		set((state) => {
			state.bonus.rates.isInitialized = true;
		});

		// Load from cache first
		get().bonus.rates.initializeFromCache();

		// Only fetch if we don't have cached data or if it's stale
		const hasValidCache = slice.data.length > 0;
		if (!hasValidCache || force) {
			get().bonus.rates.fetchRates(force);
		}
	},

	initializeFromCache: () => {
		const storage = LocalStorageService.getInstance();
		try {
			const cachedData = storage.getItem<BonusRate[]>(RATES_KEY);
			const meta = storage.getItem<RatesMeta>(RATES_META_KEY);

			if (cachedData && meta) {
				set((state) => {
					state.bonus.rates.data = cachedData;
					state.bonus.rates.status = "success";
					state.bonus.rates.lastFetched = meta.lastFetched;
				});
			}
		} catch {
			// Silent fail, will fetch fresh data
		}
	},

	clearRates: () => {
		set((state) => {
			state.bonus.rates.data = initialState.data;
			state.bonus.rates.status = initialState.status;
			state.bonus.rates.error = initialState.error;
			state.bonus.rates.lastFetched = initialState.lastFetched;
			state.bonus.rates.isInitialized = initialState.isInitialized;
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(RATES_KEY, null);
		storage.setItem(RATES_META_KEY, null);

		// Also clear the fetch promise
		ratesFetchPromise = null;
	},
});
