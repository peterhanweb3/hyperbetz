import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import {
	BetHistoryItem,
	BetStatus,
	GetBetHistoryRequestBody,
} from "@/types/games/betHistory.types";
import { toast } from "sonner";
import LocalStorageService from "@/services/localStorageService";

// --- CONSTANTS ---
const CACHE_TTL_MINUTES = 10;

// --- TYPES ---
type BetHistoryStatus = "idle" | "loading" | "success" | "error";

export interface BetHistoryFilters {
	fromDate: string; // YYYY-MM-DD
	toDate: string; // YYYY-MM-DD
	vendorName: string; // Empty string for all
	status: BetStatus | "ALL"; // "ALL" for no filter
}

export interface BetHistorySliceState {
	allBets: BetHistoryItem[];
	totalCount: number; // Total records from API
	filters: BetHistoryFilters;
	status: BetHistoryStatus;
	lastFetched: number | null; // Timestamp
	page: number; // Current page number (1-based)
	pageSize: number; // Records per page (limit param)
	grandTotalBet?: number; // grand_total_bet from API
	grandTotalWinLose?: number; // grand_total_winlose from API
}

export interface BetHistorySliceActions {
	setFilters: (newFilters: Partial<BetHistoryFilters>) => void;
	fetchHistory: (force?: boolean) => Promise<void>;
	clearBetHistoryCache: () => void;
	setPage: (page: number) => void;
	setPageSize: (size: number) => void;
}

// --- HELPER FUNCTIONS ---
const getDefaultFromDate = () => {
	const date = new Date();
	date.setMonth(date.getMonth() - 1); // 1 month ago
	return date.toISOString().split("T")[0];
};
const getDefaultToDate = () => new Date().toISOString().split("T")[0];

const createFilterCacheKey = (
	filters: BetHistoryFilters,
	page: number,
	pageSize: number
) => {
	return `${filters.fromDate}_${filters.toDate}_${filters.vendorName}_${filters.status}_p${page}_l${pageSize}`;
};

// --- INITIAL STATE ---
const initialState: BetHistorySliceState = {
	allBets: [],
	totalCount: 0,
	filters: {
		fromDate: getDefaultFromDate(),
		toDate: getDefaultToDate(),
		vendorName: "",
		status: "ALL",
	},
	status: "idle",
	lastFetched: null,
	page: 1,
	pageSize: 20,
	grandTotalBet: 0,
	grandTotalWinLose: 0,
};

export const createBetHistorySlice: AppStateCreator<
	BetHistorySliceState & BetHistorySliceActions
> = (set, get) => ({
	...initialState,

	setFilters: (newFilters) => {
		set((state) => {
			state.history.betHistory.filters = {
				...state.history.betHistory.filters,
				...newFilters,
			};
			// Reset to first page whenever filters change
			state.history.betHistory.page = 1;
		});
		// After setting a filter, automatically re-fetch the data with force=true to bypass cache
		get().history.betHistory.fetchHistory(true);
	},

	setPage: (page) => {
		set((state) => {
			state.history.betHistory.page = page < 1 ? 1 : page;
		});
		get().history.betHistory.fetchHistory();
	},

	setPageSize: (size) => {
		set((state) => {
			state.history.betHistory.pageSize = size < 1 ? 10 : size;
			// Reset to first page when page size changes
			state.history.betHistory.page = 1;
		});
		// Force refetch to avoid mixing cached pages with different sizes
		get().history.betHistory.fetchHistory(true);
	},

	clearBetHistoryCache: () => {
		const localStorageService = LocalStorageService.getInstance();
		localStorageService.clearBetHistoryCache();
		console.log("All bet history caches cleared manually");
	},

	fetchHistory: async (force = false) => {
		const currentState = get().history.betHistory;
		const localStorageService = LocalStorageService.getInstance();

		const user = localStorageService.getUserData();
		const authToken = localStorageService.getAuthToken();

		// --- Guard Clauses ---
		if (!user?.username || !authToken) return;
		if (currentState.status === "loading" && !force) return;

		// Create cache key based on filters + pagination to have separate cache entries
		const filterCacheKey = createFilterCacheKey(
			currentState.filters,
			currentState.page,
			currentState.pageSize
		);

		// --- Clear Previous Cache When Force Fetching ---
		if (force) {
			localStorageService.clearBetHistoryCache();
			console.log("FORCE FETCH: Cleared all previous bet history caches");
		}

		// --- Caching Logic ---
		if (!force) {
			const cachedData = localStorageService.getBetHistoryCache(
				filterCacheKey,
				CACHE_TTL_MINUTES
			);
			if (cachedData) {
				console.log(
					"CACHE HIT: Loading bet history from localStorage for filters:",
					currentState.filters
				);
				set((state) => {
					state.history.betHistory.allBets =
						cachedData.allBets as BetHistoryItem[];
					state.history.betHistory.totalCount =
						cachedData.totalCount || 0;
					state.history.betHistory.lastFetched =
						cachedData.lastFetched;
					state.history.betHistory.grandTotalBet =
						cachedData.grandTotalBet ?? 0;
					state.history.betHistory.grandTotalWinLose =
						cachedData.grandTotalWinLose ?? 0;
					state.history.betHistory.status = "success";
				});
				return; // We are done
			}
		}

		// --- API Fetching ---
		set((state) => {
			state.history.betHistory.status = "loading";
		});
		console.log(
			"CACHE MISS: Fetching fresh bet history from API with filters:",
			currentState.filters
		);

		try {
			const api = ApiService.getInstance();
			const requestBody: GetBetHistoryRequestBody = {
				username: user.username,
				from_date: currentState.filters.fromDate,
				to_date: `${currentState.filters.toDate} 23:59:59`,
				vendor_name: currentState.filters.vendorName || "", // Ensure empty string if not set
				limit: currentState.pageSize,
				page_number: currentState.page,
				order: "",
				status:
					currentState.filters.status === "ALL"
						? "" // Send empty string for all statuses instead of "OUTSTANDING"
						: currentState.filters.status,
			};

			console.log("Sending API request with body:", requestBody);
			const response = await api.getBetHistory(requestBody, authToken);

			if (response.error) throw new Error(response.message);

			const now = Date.now();
			const newBets = response.data;

			// --- Update State and Persist to Cache ---
			set((state) => {
				state.history.betHistory.allBets = newBets || [];
				state.history.betHistory.totalCount = response.total_data || 0;
				state.history.betHistory.lastFetched = now;
				state.history.betHistory.grandTotalBet =
					response.grand_total_bet ?? 0;
				state.history.betHistory.grandTotalWinLose =
					response.grand_total_winlose ?? 0;
				state.history.betHistory.status = "success";
			});

			// Save to cache using the localStorage service
			localStorageService.saveBetHistoryCache(filterCacheKey, {
				allBets: newBets || [],
				totalCount: response.total_data || 0,
				lastFetched: now,
				grandTotalBet: response.grand_total_bet ?? 0,
				grandTotalWinLose: response.grand_total_winlose ?? 0,
			});

			console.log(
				"Bet history updated with",
				response.data?.length || 0,
				"bets and cached with key:",
				filterCacheKey
			);
		} catch (error: unknown) {
			console.error("Failed to fetch bet history:", error);
			toast.error(
				`Failed to load bet history: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
			set((state) => {
				state.history.betHistory.status = "error";
			});
		}
	},
});
