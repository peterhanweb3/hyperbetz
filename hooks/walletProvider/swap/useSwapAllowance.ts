/**
 * useSwapAllowance.ts
 * Manages token allowance checking and approval for swaps
 */

import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import TransactionService from "@/services/walletProvider/TransactionService";
import LocalStorageService from "@/services/localStorageService";
import {
	UseSwapAllowanceParams,
	UseSwapAllowanceReturn,
} from "@/types/walletProvider/swap-hooks.types";
import { useAppStore } from "@/store/store";

export const useSwapAllowance = ({
	fromToken,
	allowanceAddress = "0x111111125421ca6dc452d289314280a0f8842a65",
}: UseSwapAllowanceParams): UseSwapAllowanceReturn => {
	// --- STATE ---
	const [isTokenAllowed, setIsTokenAllowed] = useState<boolean>(true);
	const [isApproveLoading, setIsApproveLoading] = useState<boolean>(false);
	const [isApproveSuccess, setIsApproveSuccess] = useState<boolean>(false);
	const [isApproveError, setIsApproveError] = useState<boolean>(false);
	const [approveErrorMsg, setApproveErrorMsg] = useState<string>("");
	const [tokenAproveStarted, setTokenAproveStarted] =
		useState<boolean>(false);

	// --- DEPENDENCIES ---
	const { address } = useAccount();
	const localStorageService = LocalStorageService.getInstance();
	const username = localStorageService.getUserData()?.username;
	const { chainId } = useAppStore((state) => state.blockchain.network);

	/**
	 * Check token allowance when fromToken or chain changes
	 */
	const checkTokenAllowance = useCallback(async (): Promise<boolean> => {
		if (!fromToken || !address || !username || !chainId) {
			return false;
		}

		try {
			const transactionService = TransactionService.getInstance();
			const { hasAllowance } = await transactionService.checkAllowance({
				tokenAddress: fromToken.address,
				ownerAddress: address,
				spenderAddress: allowanceAddress,
				network: chainId.toString(),
				username,
			});

			setIsTokenAllowed(hasAllowance);
			return hasAllowance;
		} catch (error) {
			console.error("Failed to check allowance:", error);
			return false;
		}
	}, [fromToken]);

	/**
	 * Handle token approval
	 */
	const approveToken = useCallback(async (): Promise<boolean> => {
		if (!fromToken || !address) return false;

		setTokenAproveStarted(true);
		setIsApproveLoading(true);
		setIsApproveError(false);
		setApproveErrorMsg("");

		try {
			const transactionService = TransactionService.getInstance();
			const { success, txHash, error } =
				await transactionService.approveToken({
					tokenAddress: fromToken.address,
					spenderAddress: allowanceAddress,
					username,
				});

			console.log("Approval response:", success, txHash, error);

			if (success) {
				setIsApproveSuccess(true);
				setIsTokenAllowed(true);

				await new Promise<boolean>((resolve) => {
					let maxAttempts = 15;
					let attempts = 0;
					const interval = setInterval(async () => {
						const hasAllowance = await checkTokenAllowance();
						if (hasAllowance) {
							clearInterval(interval);
							resolve(true);
						}
						attempts++;
						if (attempts >= maxAttempts) {
							clearInterval(interval);
							resolve(false);
						}
					}, 2000);
				});
				return true;
			} else {
				setIsApproveError(true);
				setApproveErrorMsg(error?.message || "Failed to approve token");
				return false;
			}
		} catch (error) {
			setIsApproveError(true);
			setApproveErrorMsg(
				(error as Error).message || "Failed to approve token"
			);
			return false;
		} finally {
			setIsApproveLoading(false);
			setTokenAproveStarted(false);
		}
	}, [fromToken]);

	/**
	 * Reset approval-related state
	 */
	const resetPermitState = useCallback(() => {
		setIsApproveSuccess(false);
		setIsApproveError(false);
		setApproveErrorMsg("");
		setTokenAproveStarted(false);
		setIsApproveLoading(false);
	}, []);

	/**
	 * Effect to check allowance when fromToken changes
	 */
	useEffect(() => {
		if (fromToken) {
			checkTokenAllowance();
		}
	}, [fromToken, checkTokenAllowance]);

	return {
		// State
		isTokenAllowed,
		isApproveLoading,
		isApproveSuccess,
		isApproveError,
		approveErrorMsg,
		tokenAproveStarted,

		// Actions
		checkTokenAllowance,
		approveToken,
		resetPermitState,
	};
};
