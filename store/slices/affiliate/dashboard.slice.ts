import { AppStateCreator } from "@/store/store";
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
	claim: () => Promise<void>;
	setDownline: (data: GetDownlineResponse) => void;
	setRates: (rates: AffiliateRate[]) => void;
	clear: () => void;
}

export type AffiliateDashboardSlice = AffiliateDashboardState &
	AffiliateDashboardActions;

const DOWNLINE_KEY = "affiliate_downline_cache_v1";
const RATES_KEY = "affiliate_rates_cache_v1";
const META_KEY = "affiliate_meta_cache_v1";

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

		// Note: Data fetching is now handled by the manager slice
		// This slice only handles cached data for backwards compatibility
	},

	claim: async () => {
		// Claim functionality has been moved to the claim slice
		// This is kept for backwards compatibility
		await get().affiliate.claim.claimBonus();
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
	},
});
