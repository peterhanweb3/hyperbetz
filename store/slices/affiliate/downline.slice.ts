import { AppStateCreator } from "@/store/store";
import LocalStorageService from "@/services/localStorageService";
import { GetDownlineResponse } from "@/types/affiliate/affiliate.types";

export type DownlineLoadingStatus = "idle" | "loading" | "success" | "error";

export interface DownlineState {
  data: GetDownlineResponse | null;
  status: DownlineLoadingStatus;
  error: string | null;
  lastFetched: number | null;
}

export interface DownlineActions {
  setDownlineData: (data: GetDownlineResponse) => void;
  clearDownline: () => void;
  initializeFromCache: () => void;
}

export type DownlineSlice = DownlineState & DownlineActions;

const DOWNLINE_KEY = "affiliate_downline_cache_v1";
const DOWNLINE_META_KEY = "affiliate_downline_meta_v1";

interface DownlineMeta {
  lastFetched: number;
}

const initialState: DownlineState = {
  data: null,
  status: "idle",
  error: null,
  lastFetched: null,
};

export const createDownlineSlice: AppStateCreator<DownlineSlice> = (
  set
) => ({
  ...initialState,

  setDownlineData: (data) => {
    set((state) => {
      state.affiliate.downline.data = data;
      state.affiliate.downline.status = "success";
      state.affiliate.downline.error = null;
      state.affiliate.downline.lastFetched = Date.now();
    });

    const storage = LocalStorageService.getInstance();
    const meta: DownlineMeta = { lastFetched: Date.now() };
    storage.setItem(DOWNLINE_KEY, data);
    storage.setItem(DOWNLINE_META_KEY, meta);
  },

  initializeFromCache: () => {
    const storage = LocalStorageService.getInstance();
    try {
      const cachedData = storage.getItem<GetDownlineResponse>(DOWNLINE_KEY);
      const meta = storage.getItem<DownlineMeta>(DOWNLINE_META_KEY);

      if (cachedData && meta) {
        set((state) => {
          state.affiliate.downline.data = cachedData;
          state.affiliate.downline.status = "success";
          state.affiliate.downline.lastFetched = meta.lastFetched;
        });
      }
    } catch {
      // Silent fail, will fetch fresh data
    }
  },

  clearDownline: () => {
    set((state) => {
      state.affiliate.downline.data = initialState.data;
      state.affiliate.downline.status = initialState.status;
      state.affiliate.downline.error = initialState.error;
      state.affiliate.downline.lastFetched = initialState.lastFetched;
    });

    const storage = LocalStorageService.getInstance();
    storage.setItem(DOWNLINE_KEY, null);
    storage.setItem(DOWNLINE_META_KEY, null);
  },
});
