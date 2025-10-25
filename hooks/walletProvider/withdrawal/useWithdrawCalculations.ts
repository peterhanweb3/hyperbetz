"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import TransactionService from "@/services/walletProvider/TransactionService";

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
	const { authToken, isLoggedIn } = useDynamicAuth();

	// --- 2. Manage the Hook's Own State ---
	const [fee, setFee] = useState<number | null>(null);
	const [totalPayout, setTotalPayout] = useState(0);
	const [minWithdrawAmount, setMinWithdrawAmount] = useState<number | null>(
		null
	);
	const [isFetchingMinWithdrawAmount, setIsFetchingMinWithdrawAmount] =
		useState(false);

	// --- 3. The Core Logic Effects ---

	// Effect 1: Synchronous Fee and Payout calculation
	useEffect(() => {
		const amount = parseFloat(withdrawAmount);
		if (isNaN(amount) || amount <= 0) {
			setFee(null);
			setTotalPayout(0);
			return;
		}
		const calculatedFee = amount * 0.01; // 1% fee
		const calculatedPayout = amount - calculatedFee;
		setFee(calculatedFee);
		setTotalPayout(calculatedPayout);
	}, [withdrawAmount]);

	// Effect 2: Asynchronous fetching of the DYNAMIC Minimum Withdrawal Amount
	useEffect(() => {
		let isActive = true;

		const fetchWithdrawConfig = async () => {
			// Guard clause: Do not run if essential info is missing.
			if (!isLoggedIn || !authToken || !chainId) {
				setMinWithdrawAmount(null);
				return;
			}

			setIsFetchingMinWithdrawAmount(true);
			try {
				const transactionService = TransactionService.getInstance();
				const response = await transactionService.getWalletAgentData(
					String(chainId), // Pass network as string if needed by service
					authToken
				);

				if (
					isActive &&
					!response.error &&
					response.data?.setting?.withdraw &&
					response.data?.setting?.fee
				) {
					const minAmount = parseFloat(
						response.data.setting.withdraw
					);
					const feeAmount = parseFloat(response.data.setting.fee);
					// console.log("minWithdrawalAmount from API", minAmount);
					setMinWithdrawAmount(isNaN(minAmount) ? null : minAmount);
					setFee(isNaN(feeAmount) ? null : feeAmount);
					// console.log(
					// 	"minWithdrawalAmount set to",
					// 	minWithdrawAmount
					// );
				} else {
					setMinWithdrawAmount(null);
					setFee(null);
				}
			} catch (error) {
				if (isActive) {
					setMinWithdrawAmount(null);
					setFee(null);
				}
				console.error("Failed to fetch wallet agent config:", error);
			} finally {
				if (isActive) setIsFetchingMinWithdrawAmount(false);
			}
		};

		fetchWithdrawConfig();

		return () => {
			isActive = false;
		};
	}, [chainId, authToken, isLoggedIn]);

	// --- 4. Return the Final, Public API ---
	return {
		fee: fee as number, // Fee is now either a number or fetched from API
		totalPayout,
		minWithdrawAmount: minWithdrawAmount as number, // The dynamic, API-driven value
		isFetchingMinWithdrawAmount, // A loading state for the UI to consume
	};
};
