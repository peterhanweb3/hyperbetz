import { AppStateCreator } from "@/store/store";
import LocalStorageService from "@/services/localStorageService";
import { BonusRate } from "@/types/bonus/bonus.types";

export type RatesLoadingStatus = "idle" | "loading" | "success" | "error";

export interface BonusRatesState {
	data: BonusRate[];
	status: RatesLoadingStatus;
	error: string | null;
	lastFetched: number | null;
}

export interface BonusRatesActions {
	setRatesData: (rates: BonusRate[]) => void;
	clearRates: () => void;
	initializeFromCache: () => void;
}

export type BonusRatesSlice = BonusRatesState & BonusRatesActions;

const RATES_KEY = "bonus_rates_cache_v1";
const RATES_META_KEY = "bonus_rates_meta_v1";

interface RatesMeta {
	lastFetched: number;
}

const initialState: BonusRatesState = {
	data: [],
	status: "idle",
	error: null,
	lastFetched: null,
};

export const createBonusRatesSlice: AppStateCreator<BonusRatesSlice> = (
	set
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
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(RATES_KEY, null);
		storage.setItem(RATES_META_KEY, null);
	},
});
