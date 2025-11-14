import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import {
	GetDownlineResponse,
	DownlineOrder,
	DownlineEntry,
} from "@/types/affiliate/affiliate.types";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export type ReferralsLoadingStatus = "idle" | "loading" | "success" | "error";

// Extended sort order including client-side nickname sorting
export type ReferralsSortOrder =
	| DownlineOrder
	| "nickname_asc"
	| "nickname_desc";

export interface ReferralsState {
	data: GetDownlineResponse | null;
	status: ReferralsLoadingStatus;
	error: string | null;
	lastFetched: number | null;
	// Pagination and sorting state
	currentPage: number;
	sortOrder: ReferralsSortOrder;
	recordsPerPage: number;
}

export interface ReferralsActions {
	fetchReferrals: (force?: boolean) => Promise<void>;
	setReferralsData: (data: GetDownlineResponse) => void;
	clearReferrals: () => void;
	initializeFromCache: () => void;
	// Pagination and sorting actions
	setPage: (page: number) => void;
	setSortOrder: (order: ReferralsSortOrder) => void;
	// Computed getters
	getSortedData: () => DownlineEntry[];
}

export type ReferralsSlice = ReferralsState & ReferralsActions;

const REFERRALS_KEY = "affiliate_referrals_cache_v1";
const REFERRALS_META_KEY = "affiliate_referrals_meta_v1";
const STALE_MS = 5 * 60 * 1000; // 5 minutes

// Global variable to prevent multiple simultaneous API calls
let referralsFetchPromise: Promise<void> | null = null;

interface ReferralsMeta {
	lastFetched: number;
	currentPage: number;
	sortOrder: ReferralsSortOrder;
}

const initialState: ReferralsState = {
	data: null,
	status: "idle",
	error: null,
	lastFetched: null,
	currentPage: 1,
	sortOrder: "last_login",
	recordsPerPage: 10,
};

export const createReferralsSlice: AppStateCreator<ReferralsSlice> = (
	set,
	get
) => ({
	...initialState,

	setReferralsData: (data) => {
		set((state) => {
			state.affiliate.referrals.data = data;
			state.affiliate.referrals.status = "success";
			state.affiliate.referrals.error = null;
			state.affiliate.referrals.lastFetched = Date.now();
		});

		const slice = get().affiliate.referrals;
		const storage = LocalStorageService.getInstance();
		const meta: ReferralsMeta = {
			lastFetched: Date.now(),
			currentPage: slice.currentPage,
			sortOrder: slice.sortOrder,
		};
		storage.setItem(REFERRALS_KEY, data);
		storage.setItem(REFERRALS_META_KEY, meta);
	},

	fetchReferrals: async (force = false) => {
		// Return existing promise if already fetching (deduplication)
		if (referralsFetchPromise && !force) {
			return referralsFetchPromise;
		}

		const slice = get().affiliate.referrals;
		if (slice.status === "loading" && !force) return;

		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const user = storage.getUserData();
		const token = getAuthToken();
		const username = user?.username;

		if (!username || !token) return;

		// Map sort order to API-compatible sort (nickname sorts are client-side only)
		const apiSortOrder: DownlineOrder =
			slice.sortOrder === "nickname_asc" ||
			slice.sortOrder === "nickname_desc"
				? "last_login" // Use last_login as default for client-side nickname sorting
				: (slice.sortOrder as DownlineOrder);

		// Check if data is stale or pagination/sort changed
		// For nickname sorts, only check pagination and staleness, not sort order
		const meta = storage.getItem<ReferralsMeta>(REFERRALS_META_KEY);
		const now = Date.now();

		const isClientSideSort =
			slice.sortOrder === "nickname_asc" ||
			slice.sortOrder === "nickname_desc";
		const apiSortChanged =
			!isClientSideSort && meta?.sortOrder !== slice.sortOrder;

		const isStale =
			force ||
			!meta?.lastFetched ||
			now - meta.lastFetched > STALE_MS ||
			meta.currentPage !== slice.currentPage ||
			apiSortChanged;

		if (!isStale && slice.data) return; // Use existing data

		// Create and store the fetch promise
		referralsFetchPromise = (async () => {
			set((state) => {
				state.affiliate.referrals.status = "loading";
				state.affiliate.referrals.error = null;
			});

			try {
				const response = await api.getDownline(
					{
						username,
						page_number: slice.currentPage,
						limit: slice.recordsPerPage,
						order: apiSortOrder,
					},
					token
				);

				if (!response.error) {
					get().affiliate.referrals.setReferralsData(response);
				} else {
					throw new Error(response.message);
				}
			} catch (e) {
				const msg =
					e instanceof Error
						? e.message
						: "Failed to load referrals data";
				set((state) => {
					state.affiliate.referrals.status = "error";
					state.affiliate.referrals.error = msg;
				});
			} finally {
				// Clear the promise when done
				referralsFetchPromise = null;
			}
		})();

		return referralsFetchPromise;
	},

	setPage: (page) => {
		set((state) => {
			state.affiliate.referrals.currentPage = page;
		});
		// Let the hook trigger the fetch to avoid multiple calls
	},

	setSortOrder: (order) => {
		set((state) => {
			state.affiliate.referrals.sortOrder = order;
			// Reset to page 1 when sorting changes
			state.affiliate.referrals.currentPage = 1;
		});
		// Let the hook trigger the fetch to avoid multiple calls
	},

	getSortedData: () => {
		const slice = get().affiliate.referrals;
		if (!slice.data?.data) return [] as DownlineEntry[];

		// Client-side sorting for nickname options
		if (slice.sortOrder === "nickname_asc") {
			return [...slice.data.data].sort((a, b) =>
				a.nickname.localeCompare(b.nickname)
			);
		}
		if (slice.sortOrder === "nickname_desc") {
			return [...slice.data.data].sort((a, b) =>
				b.nickname.localeCompare(a.nickname)
			);
		}

		// For API-based sorting, return the data as is
		return slice.data.data as DownlineEntry[];
	},

	initializeFromCache: () => {
		const storage = LocalStorageService.getInstance();
		try {
			const cachedData =
				storage.getItem<GetDownlineResponse>(REFERRALS_KEY);
			const meta = storage.getItem<ReferralsMeta>(REFERRALS_META_KEY);

			if (cachedData && meta) {
				set((state) => {
					state.affiliate.referrals.data = cachedData;
					state.affiliate.referrals.status = "success";
					state.affiliate.referrals.lastFetched = meta.lastFetched;
					state.affiliate.referrals.currentPage = meta.currentPage;
					state.affiliate.referrals.sortOrder = meta.sortOrder;
				});
			}
		} catch {
			// Silent fail, will fetch fresh data
		}
	},

	clearReferrals: () => {
		set((state) => {
			state.affiliate.referrals.data = initialState.data;
			state.affiliate.referrals.status = initialState.status;
			state.affiliate.referrals.error = initialState.error;
			state.affiliate.referrals.lastFetched = initialState.lastFetched;
			state.affiliate.referrals.currentPage = initialState.currentPage;
			state.affiliate.referrals.sortOrder = initialState.sortOrder;
			state.affiliate.referrals.recordsPerPage =
				initialState.recordsPerPage;
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(REFERRALS_KEY, null);
		storage.setItem(REFERRALS_META_KEY, null);

		// Also clear the fetch promise
		referralsFetchPromise = null;
	},
});
