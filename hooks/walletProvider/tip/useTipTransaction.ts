"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/store";
import { Token } from "@/types/blockchain/swap.types";
import {
	TransactionStatus,
	TransactionType,
} from "@/types/blockchain/transactions.types";
import TransactionService from "@/services/walletProvider/TransactionService";
import { toast } from "sonner";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import confetti from "canvas-confetti";
import { PrimaryWalletWithClient } from "@/types/walletProvider/transaction-service.types";

interface UseTipTransactionProps {
	selectedToken: Token | null;
	tipAmount: string;
	tipWalletAddress: string | null;
	fetchTipWallet?: () => Promise<string | null>;
	onTransactionComplete?: () => void;
}

const spenderAddress =
	process.env.NEXT_PUBLIC_ALLOWANCE_ADDRESS ||
	"0x111111125421ca6dc452d289314280a0f8842a65";

export const useTipTransaction = ({
	selectedToken,
	tipAmount,
	tipWalletAddress,
	fetchTipWallet,
	onTransactionComplete,
}: UseTipTransactionProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isApproving, setIsApproving] = useState(false);
	const [isApproved, setIsApproved] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [transactionHash, setTransactionHash] = useState<string | null>(null);

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

	const transactionService = TransactionService.getInstance();
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const retryCountRef = useRef<number>(0);

	useEffect(() => {
		if (primaryWallet) {
			transactionService.setPrimaryWallet(
				primaryWallet as unknown as PrimaryWalletWithClient
			);
		}
	}, [primaryWallet, transactionService]);

	useEffect(() => {
		setIsApproved(true);
	}, [selectedToken, user, chainId, network, transactionService]);

	// No countdown/polling needed for TIP; success is immediate on send

	// Polling removed for TIP flow

	// No interval lifecycle; success is immediate

	const resolveTipWalletAddress = useCallback(async () => {
		if (tipWalletAddress) {
			return tipWalletAddress;
		}
		if (fetchTipWallet) {
			return await fetchTipWallet();
		}
		return null;
	}, [tipWalletAddress, fetchTipWallet]);

	const executeTransaction = useCallback(async () => {
		if (!selectedToken || !tipAmount || !user || !chainId || !network) {
			return;
		}

		setIsLoading(true);

		try {
			if (!isApproved && !selectedToken.tags?.includes("native")) {
				setIsApproving(true);
				const approveResult = await transactionService.approveToken({
					tokenAddress: selectedToken.address,
					spenderAddress,
				});
				if (!approveResult.success) {
					throw (
						approveResult.error ||
						new Error("Approval failed before tip")
					);
				}
				setIsApproving(false);
				setIsApproved(true);
			}

			const destinationAddress = await resolveTipWalletAddress();
			if (!destinationAddress) {
				throw new Error("Tip wallet address unavailable");
			}
			const isNativeToken = selectedToken.tags?.includes("native");

			const txResult = await transactionService.executeTokenTransfer({
				tokenAddress: selectedToken.address,
				recipientAddress: destinationAddress,
				amount: tipAmount,
				decimals: selectedToken.decimals,
				isNative: isNativeToken,
			});

			if (!txResult.success || !txResult.txHash) {
				throw (
					txResult.error ||
					new Error("Tip transaction failed to provide a hash")
				);
			}

			setTransactionHash(txResult.txHash);
			addTransaction({
				hash: txResult.txHash,
				type: TransactionType.TIP,
				amount: tipAmount,
				tokenSymbol: selectedToken.symbol,
				network: chainId,
			});

			// Immediately mark the tip as confirmed without polling any API
			const tx = useAppStore
				.getState()
				.blockchain.transaction.transactions.find(
					(t) => t.hash === txResult.txHash
				);
			if (tx) {
				_updateTransaction(tx.id, {
					status: TransactionStatus.CONFIRMED,
				});
			}

			// Success feedback and data refresh
			toast.success("Tip sent successfully!");
			confetti();
			refreshUserData();
			try {
				await fetchTokens(true, { user, authToken });
			} catch (error) {
				console.warn("Failed to refresh tokens after tip:", error);
			}

			if (onTransactionComplete) {
				onTransactionComplete();
			}
		} catch (error) {
			console.error("Tip transaction failed:", error);

			let message = "Tip failed.";
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
		tipAmount,
		user,
		chainId,
		network,
		isApproved,
		transactionService,
		addTransaction,
		resolveTipWalletAddress,
		_updateTransaction,
		fetchTokens,
		refreshUserData,
		authToken,
		user,
	]);

	const resetTransactionState = useCallback(() => {
		setIsLoading(false);
		setIsApproving(false);
		setIsPending(false);
		setTransactionHash(null);
		retryCountRef.current = 0;
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
		}
	}, []);

	return {
		isLoading,
		isApproving,
		isApproved,
		isPending,
		transactionHash,
		executeTransaction,
		resetTransactionState,
	};
};
