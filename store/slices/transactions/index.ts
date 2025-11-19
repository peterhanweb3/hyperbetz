import { AppStateCreator } from "@/store/store";
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

export type TransactionSlice = {
  history: TransactionHistoryInitialState & TransactionHistoryActions;
};

export const createTransactionSlice: AppStateCreator<TransactionSlice> = (set, get) => ({
  history: {
    ...initialState,
    
    setTransactions: (data: DepoWdHistoryResponse) => {
      set(state => {
        // Guard against receiving invalid data
        if (!data || !Array.isArray(data.data)) {
          console.error("setTransactions received invalid data:", data);
          return;
        }
        
        state.transactions.history.transactions = data.data;
        state.transactions.history.status = "success";
        state.transactions.history.error = null;
        state.transactions.history.totalData = data.total_data;
        state.transactions.history.page = data.page;
      });

      const newCacheData = { 
        data: data, 
        timestamp: Date.now() 
      };
      safeLocalStorage.setItem(TRANSACTION_HISTORY_LOCAL_STORAGE_KEY, JSON.stringify(newCacheData));
    },

    fetchTransactionHistory: async (params: DepoWdHistoryRequest, jwtToken?: string) => {
      const currentState = get();
      if (currentState.transactions.history.status === "loading") return;

      set(state => {
        state.transactions.history.status = "loading";
        state.transactions.history.error = null;
      });

      try {
        const api = ApiService.getInstance();
        const response = await api.getDepoWdHistory(params, jwtToken);
        
        if (response.error) {
          throw new Error(response.message);
        }
        
        // Call setTransactions directly with the response data
        const currentGet = get();
        currentGet.transactions.history.setTransactions(response.data as DepoWdHistoryResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        set(state => {
          state.transactions.history.status = "error";
          state.transactions.history.error = errorMessage;
        });
      }
    },

    clearTransactions: () => {
      set(state => {
        state.transactions.history.transactions = [];
        state.transactions.history.status = "idle";
        state.transactions.history.error = null;
        state.transactions.history.totalData = 0;
        state.transactions.history.page = "1";
      });
      safeLocalStorage.removeItem(TRANSACTION_HISTORY_LOCAL_STORAGE_KEY);
    },
  },
});

export type { TransactionHistoryActions, TransactionHistoryInitialState, TransactionRecord };
