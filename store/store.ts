import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { createGameSlice, GameSlice } from "./slices/games";
import { immer } from "zustand/middleware/immer";
import { UiDefinitionSlice, createUiDefinitionSlice } from "./slices/ui";
import { QuerySlice, createQueryControlSlice } from "./slices/query";
import { createBlockchainSlice, BlockchainSlice } from "./slices/blockchain";
import { createAffiliateSlice, AffiliateSliceBranch } from "./slices/affiliate";
import { createBonusSlice, BonusSliceBranch } from "./slices/bonus";
import {
	TransactionSlice,
	createTransactionSlice,
} from "./slices/transactions";
import { createHistoryBranch, HistorySlice } from "./slices/history";

type AppStore = {
	game: GameSlice;
	uiDefinition: UiDefinitionSlice;
	query: QuerySlice;
	blockchain: BlockchainSlice;
	transactions: TransactionSlice;
	affiliate: AffiliateSliceBranch;
	bonus: BonusSliceBranch;
	dynamicLoaded: boolean;
	history: HistorySlice;
	setDynamicLoaded: (loaded: boolean) => void;
};

// --- THIS IS THE NEW HELPER TYPE ---
// It creates a reusable blueprint for all our slices.
// It tells TypeScript that our `set` function will always come from Immer.
// The [['zustand/immer', never]] part is the key to adding the middleware's type signature.
export type AppStateCreator<T> = StateCreator<
	AppStore,
	[["zustand/immer", never]],
	[],
	T
>;

const useAppStore = create<AppStore>()(
	devtools(
		immer((...args) => ({
			game: createGameSlice(...args),
			uiDefinition: createUiDefinitionSlice(...args),
			query: createQueryControlSlice(...args),
			blockchain: createBlockchainSlice(...args),
			transactions: createTransactionSlice(...args),
			affiliate: createAffiliateSlice(...args),
			bonus: createBonusSlice(...args),
			history: createHistoryBranch(...args),
			dynamicLoaded: false, // Initial state for dynamic loading
			setDynamicLoaded: (loaded: boolean) => {
				useAppStore.setState({ dynamicLoaded: loaded });
			},
		}))
	)
);

// --- ADD THIS TEMPORARY CODE FOR TESTING ---
// if (process.env.NODE_ENV === "development") {
// 	(window as any).useAppStore = useAppStore;
// }

export type { AppStore };
export { useAppStore };
