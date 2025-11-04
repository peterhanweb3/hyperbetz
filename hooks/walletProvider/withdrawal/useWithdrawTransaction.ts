"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import {
	WithdrawToken,
	PreWithdrawData,
	PrimaryWalletWithClient,
} from "@/types/walletProvider/transaction-service.types";
import {
	TransactionType,
	TransactionStatus,
} from "@/types/blockchain/transactions.types";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import pandaABI from "@/abi/pandaByteCore.json";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import TransactionService from "@/services/walletProvider/TransactionService";
import { ethers } from "ethers";

// --- HOOK'S "CONTRACT" (What it needs to receive) ---
interface UseWithdrawTransactionProps {
	selectedToken: WithdrawToken | null;
	withdrawAmount: string;
	onTransactionComplete?: () => void; // Callback when transaction completes (success or failure)
}

/**
 * The definitive, feature-complete hook for the withdrawal transaction lifecycle.
 * This is a FAITHFUL implementation of the logic from the original reference code.
 */
export const useWithdrawTransaction = ({
	selectedToken,
	withdrawAmount,
	onTransactionComplete,
}: UseWithdrawTransactionProps) => {
	// --- Withdrawal Transaction State ---

	// These state variables track the lifecycle and status of a withdrawal transaction.
	const [isLoading, setIsLoading] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [transactionHash, setTransactionHash] = useState<string | null>(null);
	const [timeLeft, setTimeLeft] = useState(0);
	const [isWithdrawalSuccessful, setIsWithdrawalSuccessful] = useState(false);
	// eslint-disable-next-line
	const [preWithdrawData, setPreWithdrawData] =
		useState<PreWithdrawData | null>(null);

	// Reserved modal state
	const [showReservedModal, setShowReservedModal] = useState(false);
	const { primaryWallet } = useDynamicContext();

	// --- Authentication & Service Instances ---
	// Used for user context and API calls.
	const { user, authToken, refreshUserData } = useDynamicAuth();

	// --- Zustand Store Selectors ---
	// Used for transaction management and network info.
	const { addTransaction, _updateTransaction } = useAppStore(
		(state) => state.blockchain.transaction
	);
	const { chainId, network } = useAppStore(
		(state) => state.blockchain.network
	);
	const fetchTokens = useAppStore(
		(state) => state.blockchain.token.fetchTokens
	);
	const transactionService = TransactionService.getInstance();

	// --- Internal Refs ---
	// Used for polling intervals.
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// --- Wagmi Contract Simulation & Execution ---
	// Used for gas estimation and contract write.

	/**
	 * Polls the backend for the status of a withdrawal transaction and updates state accordingly.
	 * Handles transaction status transitions and updates local state/store.
	 */
	const pollTransactionStatus = useCallback(
		async (hash: string) => {
			try {
				if (!user?.username || !authToken) return;
				const response =
					await transactionService.checkTransactionStatus(
						{
							transaction_type: "WD",
							hash,
							username: user.username,
						},
						authToken
					);

				const tx = useAppStore
					.getState()
					.blockchain.transaction.transactions.find(
						(t) => t.hash === hash
					);
				if (!tx) return;

				const txStatus = response.transaction_status;
				if (
					txStatus === "CONFIRMED" ||
					txStatus === "FAILED" ||
					txStatus === "REJECTED"
				) {
					if (pollingIntervalRef.current)
						clearInterval(pollingIntervalRef.current);

					const newStatus =
						txStatus === "CONFIRMED"
							? TransactionStatus.CONFIRMED
							: TransactionStatus.FAILED;
					_updateTransaction(tx.id, {
						status: newStatus,
						error:
							txStatus === "REJECTED"
								? "Transaction Rejected"
								: null,
					});

					setIsPending(false);
					setIsWithdrawalSuccessful(
						newStatus === TransactionStatus.CONFIRMED
					);

					if (newStatus === TransactionStatus.CONFIRMED) {
						toast.success("Withdrawal Confirmed!");
						confetti();

						// Refresh token list after successful withdrawal
						try {
							await fetchTokens(true, { user, authToken });
						} catch (error) {
							console.warn(
								"Failed to refresh tokens after withdrawal:",
								error
							);
						}
					} else {
						toast.error("Withdrawal failed or was rejected.");
					}

					refreshUserData();
					// Call completion callback for both successful and failed transactions
					if (onTransactionComplete) {
						onTransactionComplete();
					}
				}
			} catch (error) {
				console.error("Polling for withdrawal status failed:", error);
			}
		},
		[
			user,
			authToken,
			_updateTransaction,
			refreshUserData,
			transactionService,
			onTransactionComplete,
			fetchTokens,
		]
	);

	// --- Effects: Transaction Status Polling & Countdown ---

	// Handles polling for transaction status and countdown timer for pending transactions.
	useEffect(() => {
		if (
			isPending &&
			transactionHash &&
			transactionHash !== "manual_approval_pending"
		) {
			pollingIntervalRef.current = setInterval(
				() => pollTransactionStatus(transactionHash),
				3000
			);
		}
		return () => {
			if (pollingIntervalRef.current)
				clearInterval(pollingIntervalRef.current);
		};
	}, [isPending, transactionHash, pollTransactionStatus]);

	useEffect(() => {
		if (!isPending || timeLeft <= 0) return;
		const timer = setInterval(
			() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
			1000
		);
		return () => clearInterval(timer);
	}, [isPending, timeLeft]);

	/**
	 * Start countdown timer for pending transactions
	 */
	const startTimer = useCallback(() => {
		setTimeLeft(90);
	}, []);

	/**
	 * Handle special error messages
	 */
	const handleSpecialMessages = useCallback(
		(msg: string | undefined): boolean => {
			if (!msg) return false;
			if (msg === "Reserved") {
				setShowReservedModal(true);
				return true; // Return true to indicate a special case was handled
			}
			if (msg === "not_enough") {
				toast.error(
					"Insufficient balance. Please check your available funds."
				);
				return true;
			}
			// For any other message, show it as a generic error
			toast.error(msg);
			return false; // Return false for generic errors
		},
		[]
	);

	/**
	 * This is the faithful implementation of your original `processWithdraw` function.
	 * Its only job is to execute the final on-chain transaction.
	 */
	const processWithdraw = useCallback(
		async (data: PreWithdrawData) => {
			try {
				if (!data || !data.expiry) {
					toast.error("Withdrawal data is incomplete.");
					setIsLoading(false);
					throw new Error("Withdrawal data is incomplete.");
				}

				const decimals = data.decimal || 6;

				const finalWdAmountFun = ethers.parseUnits(
					withdrawAmount.toString(),
					decimals
				);

				const walletClient = await (
					primaryWallet as unknown as PrimaryWalletWithClient
				)?.getWalletClient();

				const hash = await walletClient.writeContract({
					address: data.contractAddress as `0x${string}`,
					abi: pandaABI,
					functionName: "executePayout",
					args: [
						data.tokenAddress,
						finalWdAmountFun,
						data.transactionId,
						data.encodedData,
						data.expiry,
						data.signature,
					],
				});

				if (!hash) {
					throw new Error(
						"Transaction was sent, but a hash was not returned."
					);
				}

				setTimeout(() => {
					setTransactionHash(hash);
					setIsPending(true);
					startTimer(); // Call the internal timer function
					addTransaction({
						hash: hash,
						type: TransactionType.WITHDRAW,
						amount: withdrawAmount,
						tokenSymbol: selectedToken!.token_symbol,
						network: chainId!,
					});
				}, 500);
				return hash;
			} catch (error) {
				let message =
					"Cannot withdraw at the moment, please try again later!";
				if (typeof error === "object" && error !== null) {
					if (
						"shortMessage" in error &&
						typeof (error as { shortMessage?: unknown })
							.shortMessage === "string"
					) {
						message = (error as { shortMessage: string })
							.shortMessage;
					} else if (
						"message" in error &&
						typeof (error as { message?: unknown }).message ===
							"string"
					) {
						message = (error as { message: string }).message;
					}
				}
				console.error("Error processing withdrawal:", error);
				toast.error(message);
				setIsLoading(false);
				setIsWithdrawalSuccessful(false);
				setTransactionHash("");
				setIsPending(false);
				setTimeLeft(0);
				throw error; // Re-throw the error to be handled by the caller
			}
		},
		[
			withdrawAmount,
			selectedToken,
			addTransaction,
			chainId,
			startTimer,
			primaryWallet,
		]
	);

	// --- Withdrawal transaction execution function ---
	/**
	 * Executes the withdrawal transaction (auto or manual) and manages all related state and side effects.
	 * Handles both auto and manual withdrawal flows, including contract simulation and backend submission.
	 */
	const executeWithdrawTransaction = useCallback(async () => {
		if (
			!selectedToken ||
			!user ||
			!authToken ||
			!chainId ||
			!network?.name
		) {
			toast.error(
				"Cannot proceed: User or network information is missing."
			);
			return;
		}

		setIsLoading(true);
		setIsWithdrawalSuccessful(false);

		try {
			const isAutoWithdrawOn = user.autowd?.toUpperCase() !== "OFF";
			let finalTxHash: string | null = null;

			if (isAutoWithdrawOn) {
				// --- AUTO WITHDRAW FLOW ---
				// Performs risk check, pre-withdrawal data fetch, contract simulation, and execution.
				const riskResult = await transactionService.performRiskCheck(
					{
						username: user.username,
						amount: withdrawAmount,
					},
					authToken
				);

				// console.log("Risk Check Result:", riskResult);

				if (
					riskResult.error ||
					riskResult.status?.toLowerCase() === "critical"
				) {
					handleSpecialMessages(riskResult.status?.toLowerCase());

					setIsLoading(false);
					throw new Error(
						riskResult.status || "Withdrawal failed risk check."
					);
				}

				// console.log({
				// 	username: user.username,
				// 	to_address: user.walletAddress as string,
				// 	token_address: selectedToken.token_address,
				// 	amount: withdrawAmount,
				// 	network: chainId,
				// 	token_type: selectedToken.token_symbol,
				// });

				const preWithdrawResult =
					await transactionService.fetchPreWithdrawData(
						{
							username: user.username,
							to_address: user.walletAddress as string,
							token_address: selectedToken.token_address,
							amount: withdrawAmount,
							network: chainId,
							token_type: selectedToken.token_symbol,
						},
						authToken
					);

				if (preWithdrawResult.error)
					throw new Error(preWithdrawResult.message);
				setPreWithdrawData(preWithdrawResult.data);

				// This is a short delay to allow the `useSimulateContract` hook to react to the new `preWithdrawData`
				await new Promise((resolve) => setTimeout(resolve, 100));

				finalTxHash = (await processWithdraw(
					preWithdrawResult.data
				)) as `0x${string}`;
			} else {
				// --- MANUAL WITHDRAW FLOW ---

				// Submits withdrawal for manual approval via backend.
				const manualResult =
					await transactionService.withdrawWalletManual(
						{
							username: user.username,
							network: chainId,
							amount: withdrawAmount,
							token_type: selectedToken.token_symbol,
							token_address: selectedToken.token_address,
							dst_wallet: user?.walletAddress as string,
						},
						authToken
					);

				if (manualResult.error) throw new Error(manualResult.message);
				toast.success("Withdrawal submitted for manual approval.");

				// Fire confetti for manual withdrawal submission
				confetti({
					spread: 360,
					ticks: 70,
					gravity: 0,
					decay: 0.94,
					startVelocity: 30,
					particleCount: 50,
					scalar: 1.2,
					shapes: ["star"],
				});
				setTimeout(
					() =>
						confetti({
							spread: 360,
							ticks: 70,
							gravity: 0,
							decay: 0.94,
							startVelocity: 30,
							particleCount: 70,
							scalar: 2,
							shapes: ["circle"],
						}),
					200
				);

				finalTxHash = "manual_approval_pending";
			}

			// --- POST-SUBMISSION STATE UPDATES ---
			if (!finalTxHash)
				throw new Error(
					"Transaction was submitted but no hash was returned."
				);

			setTransactionHash(finalTxHash);
			if (finalTxHash !== "manual_approval_pending") {
				setIsPending(true);
				startTimer(); // Start the countdown timer
			} else {
				setIsPending(false);
				setTimeLeft(0);
				resetTransactionState();
				onTransactionComplete?.();
			}

			addTransaction({
				hash: finalTxHash,
				type: TransactionType.WITHDRAW,
				amount: withdrawAmount,
				tokenSymbol: selectedToken.token_symbol,
				network: chainId,
			});
		} catch (error) {
			let message = "Withdrawal failed.";
			if (typeof error === "object" && error !== null) {
				if (
					"shortMessage" in error &&
					typeof (error as { shortMessage?: unknown })
						.shortMessage === "string"
				) {
					message = (error as { shortMessage: string }).shortMessage;
				} else if (
					"message" in error &&
					typeof (error as { message?: unknown }).message === "string"
				) {
					message = (error as { message: string }).message;
				}
			}
			if (message == "User rejected the request.") {
				toast.error(
					"Request declined. Any deducted amount will be refunded within 5 minutes"
				);
			} else {
				toast.error(message);
			}
			console.error("Withdrawal execution failed:", error);
		} finally {
			refreshUserData();
			setIsLoading(false);
		}
	}, [
		selectedToken,
		withdrawAmount,
		user,
		authToken,
		chainId,
		network,
		addTransaction,
		refreshUserData,
		transactionService,
		handleSpecialMessages,
		processWithdraw,
		startTimer,
		onTransactionComplete,
	]);

	/**
	 * Resets all withdrawal transaction state variables to their initial values.
	 * Useful for clearing the form and state after a transaction completes or fails.
	 */
	const resetTransactionState = useCallback(() => {
		setIsLoading(false);
		setIsPending(false);
		setTransactionHash(null);
		setTimeLeft(0);
		setIsWithdrawalSuccessful(false);
		setPreWithdrawData(null);
		setShowReservedModal(false);
		if (pollingIntervalRef.current)
			clearInterval(pollingIntervalRef.current);
	}, []);

	/**
	 * Returns the public API for the withdrawal transaction hook.
	 */
	return {
		isLoading,
		isPending,
		transactionHash,
		timeLeft,
		showReservedModal,
		isWithdrawalSuccessful,

		handleSpecialMessages,
		startTimer,
		setShowReservedModal,
		executeWithdrawTransaction,
		resetTransactionState,
	};
};
