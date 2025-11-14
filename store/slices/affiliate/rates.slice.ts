import { AppStateCreator } from "@/store/store";
import LocalStorageService from "@/services/localStorageService";
import { AffiliateRate } from "@/types/affiliate/affiliate.types";

export type RatesLoadingStatus = "idle" | "loading" | "success" | "error";

export interface RatesState {
	data: AffiliateRate[];
	status: RatesLoadingStatus;
	error: string | null;
	lastFetched: number | null;
}

export interface RatesActions {
	setRatesData: (rates: AffiliateRate[]) => void;
	clearRates: () => void;
	initializeFromCache: () => void;
}

export type RatesSlice = RatesState & RatesActions;

const RATES_KEY = "affiliate_rates_cache_v1";
const RATES_META_KEY = "affiliate_rates_meta_v1";

interface RatesMeta {
	lastFetched: number;
}

const initialState: RatesState = {
	data: [],
	status: "idle",
	error: null,
	lastFetched: null,
};

export const createRatesSlice: AppStateCreator<RatesSlice> = (set) => ({
	...initialState,

	setRatesData: (rates) => {
		set((state) => {
			state.affiliate.rates.data = rates;
			state.affiliate.rates.status = "success";
			state.affiliate.rates.error = null;
			state.affiliate.rates.lastFetched = Date.now();
		});

		const storage = LocalStorageService.getInstance();
		const meta: RatesMeta = { lastFetched: Date.now() };
		storage.setItem(RATES_KEY, rates);
		storage.setItem(RATES_META_KEY, meta);
	},

	initializeFromCache: () => {
		const storage = LocalStorageService.getInstance();
		try {
			const cachedData = storage.getItem<AffiliateRate[]>(RATES_KEY);
			const meta = storage.getItem<RatesMeta>(RATES_META_KEY);

			if (cachedData && meta) {
				set((state) => {
					state.affiliate.rates.data = cachedData;
					state.affiliate.rates.status = "success";
					state.affiliate.rates.lastFetched = meta.lastFetched;
				});
			}
		} catch {
			// Silent fail, will fetch fresh data
		}
	},

	clearRates: () => {
		set((state) => {
			state.affiliate.rates.data = initialState.data;
			state.affiliate.rates.status = initialState.status;
			state.affiliate.rates.error = initialState.error;
			state.affiliate.rates.lastFetched = initialState.lastFetched;
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(RATES_KEY, null);
		storage.setItem(RATES_META_KEY, null);
	},
});
