import { AppStateCreator } from "@/store/store";
import LocalStorageService from "@/services/localStorageService";
import { MemberBonusData } from "@/types/bonus/bonus.types";

export type DetailLoadingStatus = "idle" | "loading" | "success" | "error";

export interface BonusDetailState {
	data: MemberBonusData | null;
	status: DetailLoadingStatus;
	error: string | null;
	lastFetched: number | null;
}

export interface BonusDetailActions {
	setDetailData: (data: MemberBonusData) => void;
	clearDetail: () => void;
	initializeFromCache: () => void;
}

export type BonusDetailSlice = BonusDetailState & BonusDetailActions;

const DETAIL_KEY = "bonus_detail_cache_v1";
const DETAIL_META_KEY = "bonus_detail_meta_v1";

interface DetailMeta {
	lastFetched: number;
}

const initialState: BonusDetailState = {
	data: null,
	status: "idle",
	error: null,
	lastFetched: null,
};

export const createBonusDetailSlice: AppStateCreator<BonusDetailSlice> = (
	set
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
		});

		const storage = LocalStorageService.getInstance();
		storage.setItem(DETAIL_KEY, null);
		storage.setItem(DETAIL_META_KEY, null);
	},
});
