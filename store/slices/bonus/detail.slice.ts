import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { MemberBonusData } from "@/types/bonus/bonus.types";

export type DetailLoadingStatus = "idle" | "loading" | "success" | "error";

export interface BonusDetailState {
	data: MemberBonusData | null;
	status: DetailLoadingStatus;
	error: string | null;
	lastFetched: number | null;
	isInitialized: boolean;
}

export interface BonusDetailActions {
	fetchDetail: (force?: boolean) => Promise<void>;
	setDetailData: (data: MemberBonusData) => void;
	clearDetail: () => void;
	initializeFromCache: () => void;
	initialize: (force?: boolean) => void;
}

export type BonusDetailSlice = BonusDetailState & BonusDetailActions;

const DETAIL_KEY = "bonus_detail_cache_v1";
const DETAIL_META_KEY = "bonus_detail_meta_v1";
const STALE_MS = 5 * 60 * 1000; // 5 minutes

// Global variable to prevent multiple simultaneous API calls
let detailFetchPromise: Promise<void> | null = null;

interface DetailMeta {
	lastFetched: number;
}

const initialState: BonusDetailState = {
	data: null,
	status: "idle",
	error: null,
	lastFetched: null,
	isInitialized: false,
};

export const createBonusDetailSlice: AppStateCreator<BonusDetailSlice> = (
	set,
	get
) => ({
	...initialState,

	setDetailData: (data) => {
		set((state) => {
			state.bonus.detail.data = data;
			state.bonus.detail.status = "success";
			state.bonus.detail.error = null;
			state.bonus.detail.lastFetched = Date.now();
		});

		const storage = LocalStorageService.getInstance();
		const meta: DetailMeta = { lastFetched: Date.now() };
		storage.setItem(DETAIL_KEY, data);
		storage.setItem(DETAIL_META_KEY, meta);
	},

	fetchDetail: async (force = false) => {
		// Return existing promise if already fetching (deduplication)
		if (detailFetchPromise && !force) {
			return detailFetchPromise;
		}

		const slice = get().bonus.detail;
		if (slice.status === "loading" && !force) return;

		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const user = storage.getUserData();
		const token = storage.getAuthToken();
		const username = user?.username;

		if (!username || !token) return;

		// Check if data is stale
		const meta = storage.getItem<DetailMeta>(DETAIL_META_KEY);
		const now = Date.now();
		const isStale =
			force || !meta?.lastFetched || now - meta.lastFetched > STALE_MS;

		if (!isStale && slice.data) return; // Use existing data

		// Create and store the fetch promise
		detailFetchPromise = (async () => {
			set((state) => {
				state.bonus.detail.status = "loading";
				state.bonus.detail.error = null;
			});

			try {
				const response = await api.getMemberBonusDetail(
					{ username },
					token
				);

				if (!response.error && response.error === false) {
					get().bonus.detail.setDetailData(response.data);
				} else {
					throw new Error("Failed to fetch bonus detail");
				}
			} catch (e) {
				const msg =
					e instanceof Error
						? e.message
						: "Failed to load bonus detail";
				set((state) => {
					state.bonus.detail.status = "error";
					state.bonus.detail.error = msg;
				});
			} finally {
				// Clear the promise when done
				detailFetchPromise = null;
			}
		})();

		return detailFetchPromise;
	},

	initialize: (force = false) => {
		const slice = get().bonus.detail;

		// Prevent multiple initializations
		if (slice.isInitialized && !force) return;

		set((state) => {
			state.bonus.detail.isInitialized = true;
		});

		// Load from cache first
		get().bonus.detail.initializeFromCache();

		// Only fetch if we don't have cached data or if it's stale
		const hasValidCache = slice.data !== null;
		if (!hasValidCache || force) {
			get().bonus.detail.fetchDetail(force);
		}
	},

	initializeFromCache: () => {
		const storage = LocalStorageService.getInstance();
		try {
			const cachedData = storage.getItem<MemberBonusData>(DETAIL_KEY);
			const meta = storage.getItem<DetailMeta>(DETAIL_META_KEY);

			if (cachedData && meta) {
				set((state) => {
					state.bonus.detail.data = cachedData;
					state.bonus.detail.status = "success";
					state.bonus.detail.lastFetched = meta.lastFetched;
				});
			}
		} catch {
			// Silent fail, will fetch fresh data
		}
	},

	clearDetail: () => {
		set((state) => {
			state.bonus.detail.data = initialState.data;
			state.bonus.detail.status = initialState.status;
			state.bonus.detail.error = initialState.error;
			state.bonus.detail.lastFetched = initialState.lastFetched;
			state.bonus.detail.isInitialized = initialState.isInitialized;
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(DETAIL_KEY, null);
		storage.setItem(DETAIL_META_KEY, null);

		// Also clear the fetch promise
		detailFetchPromise = null;
	},
});
