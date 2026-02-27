/**
 * useSwapTransaction.ts
 * Manages the swap transaction execution and state.
 * Includes pending state, countdown timer and on-chain receipt polling
 * to mirror the deposit/withdraw user experience.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { usePublicClient } from "wagmi";
import TransactionService from "@/services/walletProvider/TransactionService";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useAppStore } from "@/store/store";
import {
	TransactionType,
	TransactionStatus,
} from "@/types/blockchain/transactions.types";
import {
	UseSwapTransactionParams,
	UseSwapTransactionReturn,
	SwapTransactionResult,
} from "@/types/walletProvider/swap-hooks.types";
import { PrimaryWalletWithClient } from "@/types/walletProvider/transaction-service.types";
import { Token } from "@/types/blockchain/swap.types";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const useSwapTransaction = ({
	fromToken,
	toToken,
	exchangeAmount,
	receivedAmount,
	slippage,
	onTransactionComplete,
}: UseSwapTransactionParams): UseSwapTransactionReturn => {
	// --- STATE ---
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [checkSuccess, setCheckSuccess] = useState<boolean>(false);
	const [transactionSuccess, setTransactionSuccess] =
		useState<boolean>(false);
	const [successPop, setSuccessPop] = useState<boolean>(false);
	const [txHash, setTxHash] = useState<string>("");
	const [isPending, setIsPending] = useState<boolean>(false);
	const [timeLeft, setTimeLeft] = useState<number>(0);

	// Store transaction amounts and tokens before they get reset
	const [completedExchangeAmount, setCompletedExchangeAmount] =
		useState<string>("");
	const [completedReceivedAmount, setCompletedReceivedAmount] =
		useState<string>("");
	const [completedFromToken, setCompletedFromToken] = useState<Token | null>(
		null
	);
	const [completedToToken, setCompletedToToken] = useState<Token | null>(
		null
	);

	// --- REFS ---
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const retryCountRef = useRef<number>(0);

	// --- DEPENDENCIES ---
	const { user, authToken } = useDynamicAuth();
	const { primaryWallet } = useDynamicContext();
	const publicClient = usePublicClient();
	const network = useAppStore((state) => state.blockchain.network);
	const { addTransaction, _updateTransaction } = useAppStore(
		(state) => state.blockchain.transaction
	);
	const fetchTokens = useAppStore(
		(state) => state.blockchain.token.fetchTokens
	);

	// --- COUNTDOWN TIMER ---
	useEffect(() => {
		if (!isPending || timeLeft <= 0) {
			return;
		}
		const timer = setInterval(
			() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
			1000
		);
		return () => clearInterval(timer);
	}, [isPending, timeLeft]);

	// --- POLLING FOR TRANSACTION RECEIPT ---
	const pollTransactionReceipt = useCallback(
		async (hash: string, retryCount = 0) => {
			const MAX_RETRIES = 30; // 90 seconds at 3-second intervals

			try {
				if (publicClient) {
					const receipt = await publicClient.getTransactionReceipt({
						hash: hash as `0x${string}`,
					});

					if (receipt) {
						// Transaction mined — check status
						if (pollingIntervalRef.current) {
							clearInterval(pollingIntervalRef.current);
						}

						if (receipt.status === "success") {
							setIsPending(false);
							setTransactionSuccess(true);
							setCheckSuccess(true);
							setSuccessPop(true);

							// Update transaction store
							const tx = useAppStore
								.getState()
								.blockchain.transaction.transactions.find(
									(t) => t.hash === hash
								);
							if (tx) {
								_updateTransaction(tx.id, {
									status: TransactionStatus.CONFIRMED,
								});
							}

							toast.success("Swap Confirmed!");
							confetti({
								particleCount: 100,
								spread: 70,
								origin: { y: 0.6 },
								colors: [
									"#10b981",
									"#3b82f6",
									"#f59e0b",
									"#ef4444",
									"#8b5cf6",
								],
							});

							// Refresh token balances
							try {
								await fetchTokens(true, { user, authToken });
							} catch (err) {
								console.warn(
									"Failed to refresh tokens after swap:",
									err
								);
							}

							if (onTransactionComplete) {
								onTransactionComplete();
							}
						} else {
							// Transaction reverted on-chain
							setIsPending(false);
							const tx = useAppStore
								.getState()
								.blockchain.transaction.transactions.find(
									(t) => t.hash === hash
								);
							if (tx) {
								_updateTransaction(tx.id, {
									status: TransactionStatus.FAILED,
								});
							}
							toast.error(
								"Swap transaction reverted on-chain. Please try again."
							);
							if (onTransactionComplete) {
								onTransactionComplete();
							}
						}
						return;
					}
				}

				// Receipt not available yet — check retry limit
				if (retryCount >= MAX_RETRIES) {
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
					}
					setIsPending(false);
					toast.error(
						"Transaction confirmation timeout. Please check your wallet or try again."
					);
					if (onTransactionComplete) {
						onTransactionComplete();
					}
				}
			} catch {
				// getTransactionReceipt throws when tx is not yet mined — continue polling
				if (retryCount >= MAX_RETRIES) {
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
					}
					setIsPending(false);
					toast.error(
						"Unable to confirm transaction. Please check manually."
					);
					if (onTransactionComplete) {
						onTransactionComplete();
					}
				}
			}
		},
		[
			publicClient,
			_updateTransaction,
			fetchTokens,
			user,
			authToken,
			onTransactionComplete,
		]
	);

	// Start polling when isPending and hash are set
	useEffect(() => {
		if (isPending && txHash) {
			retryCountRef.current = 0;
			pollingIntervalRef.current = setInterval(() => {
				pollTransactionReceipt(txHash, retryCountRef.current);
				retryCountRef.current += 1;
			}, 3000);
		}
		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, [isPending, txHash, pollTransactionReceipt]);

	/**
	 * Validate swap parameters
	 */
	const validateSwap = useCallback((): boolean => {
		if (!fromToken || !toToken) return false;
		if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) return false;
		if (parseFloat(exchangeAmount) > parseFloat(fromToken.balance))
			return false;
		if (fromToken.address === toToken.address) return false;
		return true;
	}, [fromToken, toToken, exchangeAmount]);

	/**
	 * Execute the swap transaction
	 */
	const executeSwap =
		useCallback(async (): Promise<SwapTransactionResult> => {
			if (!validateSwap()) {
				return { success: false, error: "Invalid swap parameters" };
			}

			setIsLoading(true);
			setCheckSuccess(false);
			setTransactionSuccess(false);

			try {
				const userWalletAddress = primaryWallet?.address || "";

				if (!userWalletAddress) {
					throw new Error("Wallet address not found");
				}

				const swapParams = {
					network: network?.chainId?.toString() || "1",
					fromToken: fromToken!.address,
					toToken: toToken!.address,
					amount: exchangeAmount,
					walletAddress: userWalletAddress,
					slippage: slippage === "Auto" ? "1" : slippage,
					username: user?.username as string,
					primaryWallet:
						primaryWallet as unknown as PrimaryWalletWithClient,
				};

				const transactionService = TransactionService.getInstance();
				const result = await transactionService.executeSwap(swapParams);

				if (result.success && result.txHash) {
					// Store transaction amounts and tokens before they get reset
					setCompletedExchangeAmount(exchangeAmount);
					setCompletedReceivedAmount(receivedAmount);
					setCompletedFromToken(fromToken);
					setCompletedToToken(toToken);

					setTxHash(result.txHash);
					setCheckSuccess(true);

					// Add transaction notification
					const networkName = network?.network?.name;
					addTransaction({
						hash: result.txHash,
						type: TransactionType.SWAP,
						amount: exchangeAmount,
						tokenSymbol: fromToken!.symbol,
						network: networkName as string,
						fromToken: fromToken!.symbol,
						toToken: toToken!.symbol,
					});

					// Enter pending state — wait for on-chain confirmation
					setIsPending(true);
					setTimeLeft(90);

					return { success: true, txHash: result.txHash };
				} else {
					if (
						result.error?.message.includes(
							"User rejected the request"
						)
					) {
						throw new Error("Transaction rejected by user.");
					}
					throw new Error(
						result.error?.message || "Swap transaction failed"
					);
				}
			} catch (error) {
				console.error("Swap execution failed:", error);
				setCheckSuccess(false);
				setTransactionSuccess(false);

				let message = "Swap failed.";
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
				toast.error(message);

				return { success: false, error: (error as Error).message };
			} finally {
				setIsLoading(false);
			}
		}, [
			validateSwap,
			fromToken,
			toToken,
			exchangeAmount,
			receivedAmount,
			slippage,
			primaryWallet,
			network,
			addTransaction,
			user?.username,
		]);

	/**
	 * Reset the swap state after a successful transaction
	 */
	const resetSwapState = useCallback(() => {
		setCheckSuccess(false);
		setTransactionSuccess(false);
		setSuccessPop(false);
		setTxHash("");
		setIsPending(false);
		setTimeLeft(0);
		setCompletedExchangeAmount("");
		setCompletedReceivedAmount("");
		setCompletedFromToken(null);
		setCompletedToToken(null);
		setIsLoading(false);
		retryCountRef.current = 0;
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
		}
	}, []);

	return {
		// State
		isLoading,
		checkSuccess,
		transactionSuccess,
		successPop,
		txHash,
		isPending,
		timeLeft,
		completedExchangeAmount,
		completedReceivedAmount,
		completedFromToken,
		completedToToken,

		// Actions
		executeSwap,
		validateSwap,
		resetSwapState,
		setSuccessPop,
	};
};
