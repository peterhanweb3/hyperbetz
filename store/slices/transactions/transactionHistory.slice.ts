import { StateCreator } from "zustand";
import ApiService from "@/services/apiService";
import { safeLocalStorage } from "@/lib/utils/safe-storage";
import { TransactionRecord, DepoWdHistoryRequest, DepoWdHistoryResponse } from "@/types/transactions/transaction.types";

type LoadingStatus = "idle" | "loading" | "success" | "error";

interface TransactionHistoryInitialState {
  transactions: TransactionRecord[];
  status: LoadingStatus;
  error: string | null;
  totalData: number;
  page: string;
}

interface TransactionHistoryActions {
  setTransactions: (data: DepoWdHistoryResponse) => void;
  fetchTransactionHistory: (params: DepoWdHistoryRequest, jwtToken?: string) => Promise<void>;
  clearTransactions: () => void;
}

const initialState: TransactionHistoryInitialState = {
  transactions: [],
  status: "idle",
  error: null,
  totalData: 0,
  page: "1",
};

const TRANSACTION_HISTORY_LOCAL_STORAGE_KEY = "transaction-history-cache";

export type TransactionHistorySlice = TransactionHistoryInitialState & TransactionHistoryActions;

const createTransactionHistorySlice: StateCreator<TransactionHistorySlice, [["zustand/immer", never]]> = (set, get) => ({
  ...initialState,
  
  setTransactions: (data: DepoWdHistoryResponse) => {
    set(state => {
      // Guard against receiving invalid data
      if (!data || !Array.isArray(data.data)) {
        console.error("setTransactions received invalid data:", data);
        return;
      }
      
      state.transactions = data.data;
      state.status = "success";
      state.error = null;
      state.totalData = data.total_data;
      state.page = data.page;
    });

    const newCacheData = { 
      data: data, 
      timestamp: Date.now() 
    };
    safeLocalStorage.setItem(TRANSACTION_HISTORY_LOCAL_STORAGE_KEY, JSON.stringify(newCacheData));
  },

  fetchTransactionHistory: async (params: DepoWdHistoryRequest, jwtToken?: string) => {
    const currentState = get();
    if (currentState.status === "loading") return;

    set(state => {
      state.status = "loading";
      state.error = null;
    });

    try {
      const api = ApiService.getInstance();
      const response = await api.getDepoWdHistory(params, jwtToken);
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      // Call setTransactions directly with the response data
      const currentGet = get();
      currentGet.setTransactions(response.data as DepoWdHistoryResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      set(state => {
        state.status = "error";
        state.error = errorMessage;
      });
    }
  },

  clearTransactions: () => {
    set(state => {
      state.transactions = [];
      state.status = "idle";
      state.error = null;
      state.totalData = 0;
      state.page = "1";
    });
    safeLocalStorage.removeItem(TRANSACTION_HISTORY_LOCAL_STORAGE_KEY);
  },
});

export { createTransactionHistorySlice };
export type { TransactionHistoryActions, TransactionHistoryInitialState, TransactionRecord };
