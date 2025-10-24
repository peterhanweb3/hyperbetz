import { AppStateCreator } from "@/store/store";

export type TransactionModalTab =
	| "deposit"
	| "tip"
	| "withdraw"
	| "swap"
	| "walletInfo";

export interface ModalSliceState {
	isTransactionModalOpen: boolean;
	activeTransactionModalTab: TransactionModalTab;
}

export interface ModalSliceActions {
	openTransactionModal: (tab?: TransactionModalTab) => void;
	closeTransactionModal: () => void;
	setActiveTransactionModalTab: (tab: TransactionModalTab) => void;
}

const initialState: ModalSliceState = {
	isTransactionModalOpen: false,
	activeTransactionModalTab: "deposit",
};

export const createModalSlice: AppStateCreator<
	ModalSliceState & ModalSliceActions
> = (set) => ({
	...initialState,
	openTransactionModal: (tab = "deposit") =>
		set((state) => {
			state.uiDefinition.modal.isTransactionModalOpen = true;
			state.uiDefinition.modal.activeTransactionModalTab = tab;
		}),
	closeTransactionModal: () =>
		set((state) => {
			state.uiDefinition.modal.isTransactionModalOpen = false;
		}),
	setActiveTransactionModalTab: (tab) =>
		set((state) => {
			state.uiDefinition.modal.activeTransactionModalTab = tab;
		}),
});
