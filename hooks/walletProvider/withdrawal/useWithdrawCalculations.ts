"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import TransactionService from "@/services/walletProvider/TransactionService";
import { useDebounce } from "../useDebounce";

// --- HOOK'S "CONTRACT" ---
interface UseWithdrawCalculationsProps {
	withdrawAmount: string;
}

/**
 * The definitive, feature-complete hook for all off-chain withdrawal calculations.
 *
 * It is responsible for:
 * 1. Fetching the DYNAMIC minimum withdrawal amount from the /getWalletAgent API.
 * 2. Calculating the withdrawal fee based on the user's input.
 * 3. Calculating the final total payout.
 */
export const useWithdrawCalculations = ({
	withdrawAmount,
}: UseWithdrawCalculationsProps) => {
	// --- 1. Get Dependencies from State and Context ---
	const { chainId } = useAppStore((state) => state.blockchain.network);
	const { authToken } = useDynamicAuth();

	// Debounce the withdrawal amount to prevent excessive calculations (300ms)
	const debouncedWithdrawAmount = useDebounce(withdrawAmount, 300);

	// --- 2. Manage the Hook's Own State ---
	const [fee, setFee] = useState<number>(0);
	const [totalPayout, setTotalPayout] = useState(0);
	const [minWithdrawAmount, setMinWithdrawAmount] = useState<number>(0);
	const [isFetchingMinWithdrawAmount, setIsFetchingMinWithdrawAmount] =
		useState(false);

	// --- 3. The Core Logic Effects ---

	// Effect 1: Synchronous Fee and Payout calculation (debounced)
	useEffect(() => {
		const amount = parseFloat(debouncedWithdrawAmount);
		if (isNaN(amount) || amount <= 0) {
			setTotalPayout(0);
			return;
		}
		const calculatedFee = amount * 0.01; // 1% fee
		const calculatedPayout = amount - calculatedFee;
		setTotalPayout(calculatedPayout);
	}, [debouncedWithdrawAmount]);

	// Effect 2: Asynchronous fetching of the DYNAMIC Minimum Withdrawal Amount
	useEffect(() => {
		const fetchWithdrawConfig = async () => {
			try {
				const transactionService = TransactionService.getInstance();
				const response = await transactionService.getWalletAgentData(
					String(chainId), // Pass network as string if needed by service
					authToken
				);

				if (
					!response.error &&
					response.data?.setting?.withdraw &&
					response.data?.setting?.fee
				) {
					const minAmount = parseFloat(
						response.data.setting.withdraw
					);
					const feeAmount = parseFloat(response.data.setting.fee);

					setMinWithdrawAmount(Number(minAmount));
					setFee(Number(feeAmount));
				}
				setIsFetchingMinWithdrawAmount(false);
			} catch (error) {
				setIsFetchingMinWithdrawAmount(false);
				console.error("Failed to fetch wallet agent config:", error);
			}
		};

		setIsFetchingMinWithdrawAmount(true);
		fetchWithdrawConfig();
	}, [chainId]);

	// --- 4. Return the Final, Public API ---
	return {
		fee: fee as number, // The calculated fee
		totalPayout,
		minWithdrawAmount: minWithdrawAmount as number, // The dynamic, API-driven value
		isFetchingMinWithdrawAmount, // A loading state for the UI to consume
	};
};
