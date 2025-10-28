import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import {
	GetMemberBonusSuccessResponse,
	BonusRate,
} from "@/types/bonus/bonus.types";

export type BonusLoadingStatus = "idle" | "loading" | "success" | "error";

export interface BonusDashboardState {
	bonusData: GetMemberBonusSuccessResponse | null;
	rates: BonusRate[];
	status: BonusLoadingStatus;
	error: string | null;
	lastFetched: number | null;
	isClaiming: boolean;
	isInitialized: boolean;
}

export interface BonusDashboardActions {
	initialize: (force?: boolean) => void;
	fetchData: (force?: boolean) => Promise<void>;
	setBonusData: (data: GetMemberBonusSuccessResponse) => void;
	setRates: (rates: BonusRate[]) => void;
	clear: () => void;
}

export type BonusDashboardSlice = BonusDashboardState & BonusDashboardActions;

const STALE_MS = 5 * 60 * 1000;
const BONUS_DATA_KEY = "bonus_data_cache_v1";
const RATES_KEY = "bonus_rates_cache_v1";
const META_KEY = "bonus_meta_cache_v1";

// Global variable to prevent multiple simultaneous API calls
let fetchPromise: Promise<void> | null = null;

interface CachedMeta {
	bonusDataFetched?: number;
	ratesFetched?: number;
}

const initialState: BonusDashboardState = {
	bonusData: null,
	rates: [],
	status: "idle",
	error: null,
	lastFetched: null,
	isClaiming: false,
	isInitialized: false,
};

export const createBonusDashboardSlice: AppStateCreator<BonusDashboardSlice> = (
	set,
	get
) => {
	const slice = {
		...initialState,

		setBonusData: (data: GetMemberBonusSuccessResponse) => {
			set((state) => {
				state.bonus.dashboard.bonusData = data;
				state.bonus.dashboard.status = "success";
				state.bonus.dashboard.error = null;
			});
			const storage = LocalStorageService.getInstance();
			const meta: CachedMeta =
				storage.getItem<CachedMeta>(META_KEY) || {};
			meta.bonusDataFetched = Date.now();
			storage.setItem(BONUS_DATA_KEY, data);
			storage.setItem(META_KEY, meta);
		},

		setRates: (rates: BonusRate[]) => {
			set((state) => {
				state.bonus.dashboard.rates = rates;
			});
			const storage = LocalStorageService.getInstance();
			const meta: CachedMeta =
				storage.getItem<CachedMeta>(META_KEY) || {};
			meta.ratesFetched = Date.now();
			storage.setItem(RATES_KEY, rates);
			storage.setItem(META_KEY, meta);
		},

		fetchData: async (force = false) => {
			// Return existing promise if already fetching (deduplication)
			if (fetchPromise && !force) {
				return fetchPromise;
			}

			const currentSlice = get().bonus.dashboard;
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
				!meta.bonusDataFetched ||
				!meta.ratesFetched ||
				now - (meta.bonusDataFetched || 0) > STALE_MS ||
				now - (meta.ratesFetched || 0) > STALE_MS;

			if (!stale) return;

			// Create and store the fetch promise
			fetchPromise = (async () => {
				set((state) => {
					state.bonus.dashboard.status = "loading";
					state.bonus.dashboard.error = null;
				});

				try {
					const [bonusResponse, ratesResponse] = await Promise.all([
						api.getMemberBonus({ username }, token),
						api.getBonusRate(token),
					]);

					if (!bonusResponse.error && bonusResponse.error === false) {
						slice.setBonusData(bonusResponse);
					}
					if (!ratesResponse.error && ratesResponse.error === false) {
						slice.setRates(ratesResponse.data);
					}

					set((state) => {
						state.bonus.dashboard.lastFetched = Date.now();
					});
				} catch (e) {
					const msg =
						e instanceof Error
							? e.message
							: "Failed to load bonus data";
					set((state) => {
						state.bonus.dashboard.status = "error";
						state.bonus.dashboard.error = msg;
					});
				} finally {
					// Clear the promise when done
					fetchPromise = null;
				}
			})();

			return fetchPromise;
		},

		initialize: (force = false) => {
			const currentSlice = get().bonus.dashboard;

			// Prevent multiple initializations
			if (currentSlice.isInitialized && !force) return;

			set((state) => {
				state.bonus.dashboard.isInitialized = true;
			});

			const storage = LocalStorageService.getInstance();
			try {
				const cachedBonusData =
					storage.getItem<GetMemberBonusSuccessResponse>(
						BONUS_DATA_KEY
					);
				const cachedRates =
					storage.getItem<BonusRate[]>(RATES_KEY) || [];
				const meta = storage.getItem<CachedMeta>(META_KEY);

				if (cachedBonusData) slice.setBonusData(cachedBonusData);
				if (cachedRates.length) slice.setRates(cachedRates);

				if (meta?.bonusDataFetched || meta?.ratesFetched) {
					set((state) => {
						state.bonus.dashboard.lastFetched = Math.min(
							meta.bonusDataFetched || Date.now(),
							meta.ratesFetched || Date.now()
						);
					});
				}
			} catch {
				/* ignore */
			}

			// Only fetch if we don't have cached data or if it's stale
			const hasValidCache =
				currentSlice.bonusData && currentSlice.rates?.length > 0;
			if (!hasValidCache || force) {
				slice.fetchData(force);
			}
		},

		clear: () => {
			set((state) => {
				state.bonus.dashboard.bonusData = initialState.bonusData;
				state.bonus.dashboard.rates = initialState.rates;
				state.bonus.dashboard.status = initialState.status;
				state.bonus.dashboard.error = initialState.error;
				state.bonus.dashboard.lastFetched = initialState.lastFetched;
				state.bonus.dashboard.isClaiming = initialState.isClaiming;
				state.bonus.dashboard.isInitialized =
					initialState.isInitialized;
			});
			// Also clear the fetch promise
			fetchPromise = null;
		},
	};

	return slice;
};
