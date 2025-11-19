// v1
// import { AppStateCreator } from "@/store/store";
import { safeLocalStorage } from "@/lib/utils/safe-storage";
// import {
// 	AppTransaction,
// 	TransactionStatus,
// 	TransactionNotificationData,
// } from "@/types/blockchain/transactions.types";

// // --- CONSTANTS AND TYPES ---
// const STORAGE_KEY = "app_transaction_notifications";
// const TRANSACTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
// const AUTO_REMOVE_DELAY_MS = 10 * 60 * 1000; // 10 minutes

// export interface TransactionSliceState {
// 	transactions: AppTransaction[];
// }
// export interface TransactionSliceActions {
// 	addTransaction: (
// 		txData: Omit<AppTransaction, "id" | "timestamp" | "status">
// 	) => void;
// 	processWebSocketUpdate: (wsData: TransactionNotificationData) => void;
// 	_monitorPendingTransactions: () => void; // Internal action for the synchronizer
// 	_updateAndPersist: (newTransactions: AppTransaction[]) => void; // Internal helper for state and persistence
// 	_monitorTransaction: (txId: number) => void; // Internal helper for failsafe monitoring
// 	_updateTransaction: (
// 		txId: number,
// 		updates: Partial<AppTransaction>
// 	) => void; // Internal helper to update a transaction
// }

// // --- PERSISTENCE LOGIC ---
// const getInitialState = (): TransactionSliceState => {
// 	if (typeof window === "undefined") return { transactions: [] };
// 	try {
// 		const stored = safeLocalStorage.getItem(STORAGE_KEY);
// 		if (!stored) return { transactions: [] };

// 		const parsed = JSON.parse(stored) as AppTransaction[];
// 		// Only hydrate transactions that are still pending or failed recently
// 		const validTransactions = parsed.filter((tx) => {
// 			const isRecent = Date.now() - tx.timestamp < 24 * 60 * 60 * 1000; // 24 hours
// 			return (
// 				tx.status === TransactionStatus.PENDING ||
// 				(tx.status === TransactionStatus.FAILED && isRecent)
// 			);
// 		});
// 		return { transactions: validTransactions };
// 	} catch (error) {
// 		console.error("Error hydrating transaction state:", error);
// 		return { transactions: [] };
// 	}
// };

// // --- SLICE CREATOR ---
// export const createTransactionSlice: AppStateCreator<
// 	TransactionSliceState & TransactionSliceActions
// > = (set, get) => ({
// 	...getInitialState(),

// 	// This is a private helper to manage state and persistence together
// 	_updateAndPersist: (newTransactions: AppTransaction[]) => {
// 		set((state) => {
// 			state.blockchain.transaction.transactions = newTransactions;
// 		});
// 		try {
// 			safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
// 		} catch (error) {
// 			console.error("Error saving transaction state:", error);
// 		}
// 	},

// 	// This internal action handles the failsafe timeout
// 	_monitorTransaction: (txId: number) => {
// 		const timeoutId = setTimeout(() => {
// 			const tx = get().blockchain.transaction.transactions.find(
// 				(t) => t.id === txId
// 			);
// 			// If the transaction is still pending after the timeout, mark it as failed.
// 			if (tx && tx.status === TransactionStatus.PENDING) {
// 				console.warn(
// 					`Transaction (ID: ${txId}) timed out. Marking as failed.`
// 				);
// 				get().blockchain.transaction._updateTransaction(txId, {
// 					status: TransactionStatus.FAILED,
// 					error: "Transaction timeout",
// 				});
// 			}
// 		}, TRANSACTION_TIMEOUT_MS);

// 		// Store the timeoutId so we can clear it later
// 		get().blockchain.transaction._updateTransaction(txId, { timeoutId });
// 	},

// 	// This internal helper updates a transaction by its client-side ID
// 	_updateTransaction: (txId: number, updates: Partial<AppTransaction>) => {
// 		const currentTransactions = get().blockchain.transaction.transactions;
// 		const newTransactions = currentTransactions.map((tx) =>
// 			tx.id === txId ? { ...tx, ...updates } : tx
// 		);
// 		get().blockchain.transaction._updateAndPersist(newTransactions);
// 	},

// 	addTransaction: (txData) => {
// 		const newTransaction: AppTransaction = {
// 			...txData,
// 			id: Date.now(),
// 			timestamp: Date.now(),
// 			status: TransactionStatus.PENDING,
// 		};

// 		const currentTransactions = get().blockchain.transaction.transactions;
// 		const newTransactions = [newTransaction, ...currentTransactions].slice(
// 			0,
// 			20
// 		);
// 		get().blockchain.transaction._updateAndPersist(newTransactions);

// 		// After adding, immediately start the failsafe monitor for this transaction
// 		get().blockchain.transaction._monitorTransaction(newTransaction.id);
// 	},

// 	processWebSocketUpdate: (wsData) => {
// 		const { txId, status } = wsData;
// 		const newStatus =
// 			status === "CONFIRMED"
// 				? TransactionStatus.CONFIRMED
// 				: TransactionStatus.FAILED;

// 		const txToUpdate = get().blockchain.transaction.transactions.find(
// 			(tx) =>
// 				(tx.hash === txId || tx.serverTxId === txId) &&
// 				tx.status === TransactionStatus.PENDING
// 		);

// 		if (txToUpdate) {
// 			// Clear the failsafe timeout because we received an update!
// 			if (txToUpdate.timeoutId) {
// 				clearTimeout(txToUpdate.timeoutId);
// 			}

// 			const updates: Partial<AppTransaction> = {
// 				status: newStatus,
// 				serverTxId: txId,
// 				timeoutId: null,
// 			};
// 			get().blockchain.transaction._updateTransaction(
// 				txToUpdate.id,
// 				updates
// 			);

// 			// Schedule the transaction to be removed from the UI to keep it clean
// 			setTimeout(() => {
// 				const currentTxs = get().blockchain.transaction.transactions;
// 				const finalTxs = currentTxs.filter(
// 					(t) => t.id !== txToUpdate.id
// 				);
// 				get().blockchain.transaction._updateAndPersist(finalTxs);
// 			}, AUTO_REMOVE_DELAY_MS);
// 		}
// 	},

// 	// This action is called by the synchronizer on mount to resume monitoring
// 	_monitorPendingTransactions: () => {
// 		const pendingTxs = get().blockchain.transaction.transactions.filter(
// 			(tx) => tx.status === TransactionStatus.PENDING
// 		);
// 		pendingTxs.forEach((tx) =>
// 			get().blockchain.transaction._monitorTransaction(tx.id)
// 		);
// 	},
// });

// v2
import { AppStateCreator } from "@/store/store";
import {
	AppTransaction,
	TransactionStatus,
	TransactionType, // Make sure TransactionType is imported
	TransactionNotificationData,
} from "@/types/blockchain/transactions.types";

// --- CONSTANTS ---
const STORAGE_KEY = "app_transaction_notifications";
const TRANSACTION_TIMEOUT_MS = 5 * 60 * 1000;
const SWAP_SUBMITTED_DELAY_MS = 1000;
const SWAP_AUTO_REMOVE_DELAY_MS = 8000;
const FINALIZED_AUTO_REMOVE_DELAY_MS = 10 * 60 * 1000;

// --- STATE AND ACTION TYPES ---
export interface TransactionSliceState {
	transactions: AppTransaction[];
	pendingCount: number;
}
export interface TransactionSliceActions {
	addTransaction: (
		txData: Omit<AppTransaction, "id" | "timestamp" | "status">
	) => void;
	processWebSocketUpdate: (wsData: TransactionNotificationData) => void;
	initializeTransactions: () => void;
	_removeTransaction: (txId: number) => void;
	_monitorTransaction: (txId: number) => void; // Internal helper for failsafe monitoring
	_updateTransaction: (
		txId: number,
		updates: Partial<AppTransaction>
	) => void; // Internal helper to update a transaction
	_updateAndPersist: (newTransactions: AppTransaction[]) => void; // Internal helper for state and persistence
}

// --- PERSISTENCE LOGIC ---
const getInitialState = (): TransactionSliceState => {
	if (typeof window === "undefined")
		return { transactions: [], pendingCount: 0 };
	try {
		const stored = safeLocalStorage.getItem(STORAGE_KEY);
		if (!stored) return { transactions: [], pendingCount: 0 };

		const parsed = JSON.parse(stored) as AppTransaction[];
		const validTransactions = parsed.filter((tx) => {
			const isRecent = Date.now() - tx.timestamp < 24 * 60 * 60 * 1000;
			return tx.status === TransactionStatus.PENDING || isRecent;
		});
		const pendingCount = validTransactions.filter(
			(tx) => tx.status === TransactionStatus.PENDING
		).length;
		return { transactions: validTransactions, pendingCount };
	} catch (error) {
		console.error("Error hydrating transaction state:", error);
		return { transactions: [], pendingCount: 0 };
	}
};

// --- SLICE CREATOR ---
export const createTransactionSlice: AppStateCreator<
	TransactionSliceState & TransactionSliceActions
> = (set, get) => ({
	...getInitialState(),

	_updateAndPersist: (newTransactions: AppTransaction[]) => {
		const pendingCount = newTransactions.filter(
			(tx) => tx.status === TransactionStatus.PENDING
		).length;
		set((state) => {
			state.blockchain.transaction.transactions = newTransactions;
			state.blockchain.transaction.pendingCount = pendingCount;
		});
		try {
			safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
		} catch (error) {
			console.error("Error saving transaction state:", error);
		}
	},

	_updateTransaction: (txId: number, updates: Partial<AppTransaction>) => {
		const currentTxs = get().blockchain.transaction.transactions;
		const newTxs = currentTxs.map((tx) =>
			tx.id === txId ? { ...tx, ...updates } : tx
		);
		get().blockchain.transaction._updateAndPersist(newTxs);
	},

	_removeTransaction: (txId: number) => {
		const currentTxs = get().blockchain.transaction.transactions;
		const newTxs = currentTxs.filter((t) => t.id !== txId);
		get().blockchain.transaction._updateAndPersist(newTxs);
	},

	_monitorTransaction: (txId: number) => {
		const timeoutId = setTimeout(() => {
			const tx = get().blockchain.transaction.transactions.find(
				(t) => t.id === txId
			);
			if (tx?.status === TransactionStatus.PENDING) {
				get().blockchain.transaction._updateTransaction(txId, {
					status: TransactionStatus.FAILED,
					error: "Transaction timeout",
				});
			}
		}, TRANSACTION_TIMEOUT_MS);
		get().blockchain.transaction._updateTransaction(txId, { timeoutId });
	},

	addTransaction: (txData) => {
		const newTransaction: AppTransaction = {
			...txData,
			id: Date.now(),
			timestamp: Date.now(),
			status: TransactionStatus.PENDING,
		};
		const newTransactions = [
			newTransaction,
			...get().blockchain.transaction.transactions,
		].slice(0, 50);
		get().blockchain.transaction._updateAndPersist(newTransactions);

		// --- SPECIAL SWAP HANDLING (RESTORED) ---
		if (newTransaction.type === TransactionType.SWAP) {
			setTimeout(() => {
				get().blockchain.transaction._updateTransaction(
					newTransaction.id,
					{ status: TransactionStatus.SUBMITTED }
				);
				setTimeout(
					() =>
						get().blockchain.transaction._removeTransaction(
							newTransaction.id
						),
					SWAP_AUTO_REMOVE_DELAY_MS
				);
			}, SWAP_SUBMITTED_DELAY_MS);
		} else {
			// Start failsafe monitor for non-swap transactions
			get().blockchain.transaction._monitorTransaction(newTransaction.id);
		}
	},

	processWebSocketUpdate: (wsData) => {
		const { txId, amount, currency, status } = wsData;
		const newStatus =
			status === "CONFIRMED"
				? TransactionStatus.CONFIRMED
				: TransactionStatus.FAILED;
		let txToUpdate: AppTransaction | undefined;

		const currentTxs = get().blockchain.transaction.transactions;

		// --- RESILIENT MATCHING LOGIC (RESTORED) ---
		txToUpdate = currentTxs.find(
			(tx) =>
				tx.status === TransactionStatus.PENDING &&
				(tx.hash === txId ||
					tx.serverTxId === txId ||
					(Number(tx.amount) === amount &&
						tx.tokenSymbol.toUpperCase() ===
							currency.toUpperCase() &&
						Date.now() - tx.timestamp < 10 * 60 * 1000)) // 10 minute window
		);

		if (txToUpdate) {
			if (txToUpdate.timeoutId) clearTimeout(txToUpdate.timeoutId);

			const updates: Partial<AppTransaction> = {
				status: newStatus,
				serverTxId: txId,
				timeoutId: null,
			};
			if (status === "REJECTED")
				updates.error = "Transaction rejected by network";

			get().blockchain.transaction._updateTransaction(
				txToUpdate.id,
				updates
			);

			setTimeout(
				() =>
					get().blockchain.transaction._removeTransaction(
						txToUpdate!.id
					),
				FINALIZED_AUTO_REMOVE_DELAY_MS
			);
		}
	},

	initializeTransactions: () => {
		const state = get().blockchain.transaction;
		// --- RESUME MONITORING ON HYDRATION (RESTORED) ---
		state.transactions
			.filter(
				(tx) =>
					tx.status === TransactionStatus.PENDING &&
					tx.type !== TransactionType.SWAP
			)
			.forEach((tx) =>
				get().blockchain.transaction._monitorTransaction(tx.id)
			);

		// --- PERIODIC CLEANUP LOGIC (RESTORED) ---
		setInterval(() => {
			const currentTxs = get().blockchain.transaction.transactions;
			const validTxs = currentTxs.filter((tx) => {
				const isRecent =
					Date.now() - tx.timestamp < 24 * 60 * 60 * 1000;
				return tx.status === TransactionStatus.PENDING || isRecent;
			});
			if (validTxs.length !== currentTxs.length) {
				get().blockchain.transaction._updateAndPersist(validTxs);
			}
		}, 60 * 60 * 1000); // Every hour
	},
});
