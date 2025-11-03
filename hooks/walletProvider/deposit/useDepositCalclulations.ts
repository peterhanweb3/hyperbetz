"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/store";
import { Token } from "@/types/blockchain/swap.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import TransactionService from "@/services/walletProvider/TransactionService";
import { SwapInfo } from "@/types/walletProvider/transaction-service.types";
import { toast } from "sonner";
import { useDebounce } from "../useDebounce";

// --- HOOK'S "CONTRACT" ---
// We define the props this hook needs to receive from the main useDeposit hook.
interface UseDepositCalculationsProps {
	selectedToken: Token | null;
	depositAmount: string;
	dstSwapInfo: SwapInfo | null;
}

/**
 * A dedicated, self-contained hook with a single responsibility:
 * to manage all asynchronous, off-chain calculations needed for the deposit UI.
 *
 * It is responsible for:
 * 1. Calculating the dynamic minimum deposit amount for non-stablecoin tokens.
 * 2. Calculating the real-time USDT conversion value for the user's input amount.
 *
 * It is resilient to race conditions and memory leaks.
 */
export const useDepositCalculations = ({
	selectedToken,
	depositAmount,
	dstSwapInfo,
}: UseDepositCalculationsProps) => {
	// --- 1. Get Dependencies from State and Context ---
	const { chainId } = useAppStore((state) => state.blockchain.network);
	const { user, authToken } = useDynamicAuth();
	const username = user?.username;

	// --- DEBOUNCING FOR PERFORMANCE ---
	// Debounce the deposit amount to prevent API spam while user is typing (500ms)
	const debouncedDepositAmount = useDebounce(depositAmount, 500);

	// --- 2. Manage the Hook's Own State ---
	const [minRequiredAmount, setMinRequiredAmount] = useState<number | null>(
		null
	);
	const [usdtConversionAmount, setUsdtConversionAmount] = useState(0);
	const [isFetchingMinDepositAmount, setIsFetchingMinDepositAmount] =
		useState(false);
	const [isFetchingConversion, setIsFetchingConversion] = useState(false);

	// Deduplication refs to avoid firing the same request repeatedly
	const lastUsdDepsRef = useRef<string>("");
	const lastMinDepsRef = useRef<string>("");

	const only2Decimals = (value: string) => {
		const regex = /^\d+(\.\d{0,2})?/;
		const match = value.match(regex);
		return match ? match[0] : "0";
	}

	// Effect for calculating the minimum required deposit amount.
	useEffect(() => {
		// This effect handles its own state and dependencies.

		const calculateMinAmount = async () => {
			// Guard clause: Don't run if the necessary data isn't available.
			if (!selectedToken || !username || !chainId || !dstSwapInfo) {
				setMinRequiredAmount(null); // Reset to default
				setIsFetchingMinDepositAmount(false);
				return;
			}

			let letsCheckApi = 1;

			// For stablecoins, ask the wallet agent config for the minimum deposit.

			setIsFetchingMinDepositAmount(true);

			// Safety timeout: Force loading to false after 10 seconds
			// timeoutId = setTimeout(() => {
			// 	if (isActive) {
			// 		setIsFetchingMinDepositAmount(false);
			// 		setMinRequiredAmount(1); // Default fallback
			// 	}
			// }, 10000);

			try {
				const transactionService = TransactionService.getInstance();
				const response = await transactionService.getWalletAgentData(
					String(chainId),
					authToken
				);

				if (!response.error && response.data?.setting?.deposit_min) {
					const minAmount = parseFloat(
						response.data.setting.deposit_min
					);
					letsCheckApi = minAmount;
					setMinRequiredAmount(isNaN(minAmount) ? null : minAmount);
				} else {
					setMinRequiredAmount(null);
				}
			} catch (error) {
				toast.error(
					`Error fetching minimum deposit amount. Please try again. ${error}`
				);
			} finally {
				setIsFetchingMinDepositAmount(false);
			}

			if (
				["USDT", "USDC", "55Swap", "USD₮0", "USDT0"].includes(
					selectedToken.symbol
				)
			) {
				setMinRequiredAmount(letsCheckApi);
				return;
			}

			// Non-stablecoin path: compute how much of the token equals our USD minimum.
			setIsFetchingMinDepositAmount(true);
			try {
				const transactionService = TransactionService.getInstance();
				const result = await transactionService.getTokenConversion({
					network: chainId,
					// Find out how much of the selected token is equal to our minimum USD deposit.
					fromToken: dstSwapInfo.token_address,
					toToken: selectedToken.address,
					amount: letsCheckApi,
					username,
				});

				if (result.success && result.conversion) {
					const finalAmountShow = only2Decimals(
						result.conversion.toAmount.toString()
					);
					setMinRequiredAmount(
						finalAmountShow.toString() as unknown as number
					);
				}
			} catch (error) {
				toast.error(
					`Error fetching minimum deposit amount. Please try again. ${error}`
				);

				console.error(
					"Failed to calculate minimum deposit amount:",
					error
				);
			} finally {
				setIsFetchingMinDepositAmount(false);
			}
		};

		// Dedupe: run only if deps changed meaningfully
		const minKey = JSON.stringify({
			chainId,
			username,
			selected: selectedToken?.address,
			dst: dstSwapInfo?.token_address,
		});
		if (lastMinDepsRef.current !== minKey) {
			lastMinDepsRef.current = minKey;
			calculateMinAmount();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedToken, chainId, username, dstSwapInfo]);

	useEffect(() => {
		const calculateUsdValue = async () => {
			if (
				!selectedToken ||
				!debouncedDepositAmount ||
				!username ||
				!chainId ||
				!dstSwapInfo ||
				parseFloat(debouncedDepositAmount) <= 0
			) {
				setUsdtConversionAmount(0);
				return;
			}
			if (
				["USDT", "USDC", "55Swap", "USD₮0", "USDT0"].includes(
					selectedToken.symbol
				)
			) {
				setUsdtConversionAmount(parseFloat(debouncedDepositAmount));
				setIsFetchingConversion(false);
				return;
			}

			setIsFetchingConversion(true);
			try {
				const transactionService = TransactionService.getInstance();
				const result = await transactionService.getTokenConversion({
					network: chainId,
					fromToken: selectedToken.address,
					toToken: dstSwapInfo.token_address,
					amount: parseFloat(debouncedDepositAmount),
					username,
				});

				if (result.success && result.conversion) {
					setUsdtConversionAmount(result.conversion.toAmount);
				}
			} catch (error) {
				console.error(
					"Failed to calculate USDT conversion amount:",
					error
				);
				setUsdtConversionAmount(0);
			} finally {
				setIsFetchingConversion(false);
			}
		};

		// Dedupe: only call when inputs actually change
		const usdKey = JSON.stringify({
			chainId,
			username,
			selected: selectedToken?.address,
			dst: dstSwapInfo?.token_address,
			amount: debouncedDepositAmount,
		});
		if (lastUsdDepsRef.current !== usdKey) {
			lastUsdDepsRef.current = usdKey;
			calculateUsdValue();
		}
	}, [selectedToken, debouncedDepositAmount, chainId, username, dstSwapInfo]);

	// --- 4. Return the Final API ---
	return {
		minRequiredAmount: minRequiredAmount as number,
		usdtConversionAmount,
		isFetchingConversion,
		isFetchingMinDepositAmount,
	};
};
