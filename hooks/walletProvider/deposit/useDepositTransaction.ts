//================================= v3 =================================
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/store";
import { Token } from "@/types/blockchain/swap.types";
import {
	TransactionType,
	TransactionStatus,
} from "@/types/blockchain/transactions.types";
import TransactionService from "@/services/walletProvider/TransactionService";
import { toast } from "sonner";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import confetti from "canvas-confetti";
import { PrimaryWalletWithClient } from "@/types/walletProvider/transaction-service.types";

// --- HOOK'S "CONTRACT" (What it needs to receive) ---
interface UseDepositTransactionProps {
	selectedToken: Token | null;
	depositAmount: string;
	depositType: "direct" | "swap";
	dstSwapInfo: { token_address: string; wallet_address: string } | null;
	isBalanceInsufficient: boolean;
	minRequiredAmount: number;
	onTransactionComplete?: () => void; // Callback when transaction completes (success or failure)
}

const spenderAddress =
	process.env.NEXT_PUBLIC_ALLOWANCE_ADDRESS ||
	"0x111111125421ca6dc452d289314280a0f8842a65"; // Default to a known address if not set

// --- MAIN HOOK ---
export const useDepositTransaction = ({
	selectedToken,
	depositAmount,
	depositType,
	dstSwapInfo,
	// isBalanceInsufficient,
	// minRequiredAmount,
	onTransactionComplete,
}: UseDepositTransactionProps) => {
	// --- STATE ---
	const [isLoading, setIsLoading] = useState(false);
	const [isApproving, setIsApproving] = useState(false);
	const [isApproved, setIsApproved] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [transactionHash, setTransactionHash] = useState<string | null>(null);
	const [timeLeft, setTimeLeft] = useState(0);

	// --- ZUSTAND & CONTEXT CONNECTIONS ---
	const { addTransaction, _updateTransaction } = useAppStore(
		(state) => state.blockchain.transaction
	);
	const fetchTokens = useAppStore(
		(state) => state.blockchain.token.fetchTokens
	);
	const { chainId, network } = useAppStore(
		(state) => state.blockchain.network
	);
	const { user, refreshUserData, authToken } = useDynamicAuth();
	const { primaryWallet } = useDynamicContext();

	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const retryCountRef = useRef<number>(0);
	const transactionService = TransactionService.getInstance();

	// Set primary wallet for authentication-aware transactions
	useEffect(() => {
		if (primaryWallet) {
			transactionService.setPrimaryWallet(
				primaryWallet as unknown as PrimaryWalletWithClient
			);
		}
	}, [primaryWallet, transactionService]);

	// --- LOGIC ---

	// Check allowance when token or user changes
	useEffect(() => {
		if (
			!selectedToken ||
			!user?.walletAddress ||
			selectedToken.tags?.includes("native")
		) {
			setIsApproved(true);
			return;
		}

		const isDirect = ["USDT", "USDC", "55Swap", "USD₮0", "USDT0"].includes(
			selectedToken.symbol
		);

		if (isDirect) {
			setIsApproved(true);
			return;
		}

		const check = async () => {
			const { hasAllowance } = await transactionService.checkAllowance({
				tokenAddress: selectedToken.address,
				ownerAddress: user.walletAddress!,
				spenderAddress: spenderAddress, // Use the actual spender address from env
				network: network?.name || String(chainId),
				username: user.username,
			});

			console.log("Allowance check result:", hasAllowance);
			setIsApproved(hasAllowance);
		};
		check();
	}, [selectedToken, user, chainId, network, transactionService]);

	// Countdown timer logic
	useEffect(() => {
		if (!isPending || timeLeft <= 0) {
			if (pollingIntervalRef.current)
				clearInterval(pollingIntervalRef.current);
			return;
		}
		const timer = setInterval(
			() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
			1000
		);
		return () => clearInterval(timer);
	}, [isPending, timeLeft]);

	// Fallback polling logic with retry handling
	const pollTransactionStatus = useCallback(
		async (hash: string, retryCount = 0) => {
			const MAX_RETRIES = 30; // Maximum number of retries (90 seconds with 3-second intervals)

			try {
				const response =
					await transactionService.checkTransactionStatus({
						transaction_type: "DEPO",
						hash,
						username: user?.username || "",
					});

				console.log("Polling response:", response);

				// If error is true (which indicates "Transaction Not Found")
				if (response.error === true) {
					// Increment retry count
					if (retryCount < MAX_RETRIES) {
						console.log(
							`Transaction not found, retry ${
								retryCount + 1
							}/${MAX_RETRIES}`
						);
						return; // Continue polling
					} else {
						// Max retries reached
						console.log(
							"Max retries reached for transaction polling"
						);
						if (pollingIntervalRef.current) {
							clearInterval(pollingIntervalRef.current);
						}
						setIsPending(false);
						toast.error(
							"Transaction confirmation timeout. Please check your wallet or try again."
						);
						// Call completion callback for timeout/failed transaction
						if (onTransactionComplete) {
							onTransactionComplete();
						}
						return;
					}
				}

				// Check for successful confirmation
				const tx = useAppStore
					.getState()
					.blockchain.transaction.transactions.find(
						(t) => t.hash === hash
					);

				if (
					tx &&
					response.error === false &&
					response.transaction_status === "CONFIRMED"
				) {
					if (pollingIntervalRef.current)
						clearInterval(pollingIntervalRef.current);
					setIsPending(false);
					_updateTransaction(tx.id, {
						status: TransactionStatus.CONFIRMED,
					});
					toast.success("Deposit Confirmed!");
					confetti();
					refreshUserData();

					// Refresh token list after successful deposit
					try {
						await fetchTokens(true, { user, authToken });
					} catch (error) {
						console.warn(
							"Failed to refresh tokens after deposit:",
							error
						);
					}

					// Call completion callback for successful transaction
					if (onTransactionComplete) {
						onTransactionComplete();
					}
				}
			} catch (error) {
				console.error("Polling failed:", error);
				// Don't stop polling on network errors, but limit retries
				if (retryCount >= MAX_RETRIES) {
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
					}
					setIsPending(false);
					toast.error(
						"Unable to confirm transaction. Please check manually."
					);
					// Call completion callback for failed transaction
					if (onTransactionComplete) {
						onTransactionComplete();
					}
				}
			}
		},
		[
			_updateTransaction,
			refreshUserData,
			transactionService,
			fetchTokens,
			user,
			authToken,
			onTransactionComplete,
			// user?.username,
		]
	);

	useEffect(() => {
		if (isPending && transactionHash) {
			retryCountRef.current = 0; // Reset retry count when starting new polling
			pollingIntervalRef.current = setInterval(() => {
				pollTransactionStatus(transactionHash, retryCountRef.current);
				retryCountRef.current += 1; // Increment retry count
			}, 3000);
		}
		return () => {
			if (pollingIntervalRef.current)
				clearInterval(pollingIntervalRef.current);
		};
	}, [isPending, transactionHash, pollTransactionStatus]);

	// This is the definitive, faithful implementation of your original executeTransaction function
	const executeTransaction = useCallback(async () => {
		if (!selectedToken || !depositAmount || !user || !chainId || !network)
			return;

		// Pre-flight checks from your original code
		if (user.pendingDepo) {
			toast.warning("A deposit is still processing.");
			return;
		}
		// will enable it in future when the application is production ready currently comemented to avoid blocking UI (development purposes only)
		// if (
		// 	isBalanceInsufficient ||
		// 	parseFloat(depositAmount) < minRequiredAmount
		// ) {
		// 	toast.error("Invalid amount or insufficient balance.");
		// 	return;
		// }

		setIsLoading(true);
		let depositSuccess = false;
		try {
			const isAutoDepositOn = user.autodepo?.toUpperCase() !== "OFF";
			let txResult: {
				success: boolean;
				txHash: string | null;
				error: Error | null;
			};

			if (!isApproved && !selectedToken.tags?.includes("native")) {
				setIsApproving(true);
				const approveResult = await transactionService.approveToken({
					tokenAddress: selectedToken.address,
					spenderAddress: spenderAddress,
				});
				if (!approveResult.success)
					throw approveResult.error || new Error("Approval failed");
				setIsApproving(false);
				setIsApproved(true);
			}

			const destinationWalletResult =
				await transactionService.getDestinationWallet(chainId);
			if (
				!destinationWalletResult.success ||
				!destinationWalletResult.walletAddress
			) {
				throw (
					destinationWalletResult.error ||
					new Error("Could not get destination wallet.")
				);
			}
			const destinationAddress = destinationWalletResult.walletAddress;

			if (!isAutoDepositOn) {
				txResult = await transactionService.executeTokenTransfer({
					tokenAddress: selectedToken.address,
					recipientAddress: destinationAddress,
					amount: depositAmount,
					decimals: selectedToken.decimals,
				});
				if (!txResult.success || !txResult.txHash)
					throw txResult.error || new Error("Manual transfer failed");
				await transactionService.recordManualDeposit({
					username: user.username,
					txHash: txResult.txHash,
					network: network.name,
					amount: depositAmount,
					tokenAddress: selectedToken.address,
					toAddress: destinationAddress,
					tokenType: selectedToken.symbol,
					dstWallet: destinationAddress,
				});
				depositSuccess = true;
			} else {
				const isStablecoin = [
					"USDT",
					"USDC",
					"55Swap",
					"USD₮0",
					"USDT0",
				].includes(selectedToken.symbol);
				if (isStablecoin || depositType === "direct") {
					txResult = await transactionService.executeTokenTransfer({
						tokenAddress: selectedToken.address,
						recipientAddress: destinationAddress,
						amount: depositAmount,
						decimals: selectedToken.decimals,
					});
					depositSuccess = txResult.success;
				} else if (depositType === "swap" && dstSwapInfo) {
					txResult = await transactionService.executeSwap({
						network: network.name,
						fromToken: selectedToken.address,
						toToken: dstSwapInfo.token_address,
						amount: depositAmount,
						walletAddress: user.walletAddress!,
						receiver: dstSwapInfo.wallet_address,
						slippage: "1",
						username: user.username,
						primaryWallet:
							primaryWallet as unknown as PrimaryWalletWithClient,
					});
					depositSuccess = txResult.success;
				} else {
					throw new Error("Invalid deposit path");
				}
			}

			if (!depositSuccess || !txResult.txHash) {
				throw (
					txResult.error ||
					new Error("Transaction failed to return a hash.")
				);
			}

			setTransactionHash(txResult.txHash);
			setIsPending(true);
			setTimeLeft(90);
			addTransaction({
				hash: txResult.txHash,
				type: TransactionType.DEPOSIT,
				amount: depositAmount,
				tokenSymbol: selectedToken.symbol,
				network: chainId,
			});
		} catch (error) {
			console.error("Error details:", {
				message: (error as Error)?.message,
				shortMessage: (error as { shortMessage?: string })
					?.shortMessage,
				code: (error as { code?: unknown })?.code,
				selectedToken: selectedToken?.symbol,
				depositAmount,
				isApproved,
				depositType,
				userAutoDepo: user?.autodepo,
			});

			let message = "Deposit failed.";
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
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}, [
		selectedToken,
		depositAmount,
		user,
		chainId,
		network,
		isApproved,
		depositType,
		dstSwapInfo,
		addTransaction,
		transactionService,
		primaryWallet,
	]);

	const resetTransactionState = useCallback(() => {
		setIsLoading(false);
		setIsApproving(false);
		setIsPending(false);
		setTransactionHash(null);
		setTimeLeft(0);
		retryCountRef.current = 0; // Reset retry count
		if (pollingIntervalRef.current)
			clearInterval(pollingIntervalRef.current);
	}, []);

	return {
		isLoading,
		isApproving,
		isApproved,
		isPending,
		transactionHash,
		timeLeft,
		executeTransaction,
		resetTransactionState,
	};
};
