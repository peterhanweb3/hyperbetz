"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/store";
import { Token } from "@/types/blockchain/swap.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import TransactionService from "@/services/walletProvider/TransactionService";
import { SwapInfo } from "@/types/walletProvider/transaction-service.types";
import { toast } from "sonner";
// import { useDebounce } from "../useDebounce";

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
	const { user } = useDynamicAuth();
	const username = user?.username;

	// Example of getting min deposit from a global config slice.
	// Replace with your actual implementation if you have one.
	// const MINIMUM_DEPOSIT_AMOUNT = useAppStore(state => state.config.minimumDeposit) || 1;
	const MINIMUM_DEPOSIT_AMOUNT = 1; // Using a constant for now

	// --- 2. Manage the Hook's Own State ---
	const [minRequiredAmount, setMinRequiredAmount] = useState(
		MINIMUM_DEPOSIT_AMOUNT
	);
	const [usdtConversionAmount, setUsdtConversionAmount] = useState(0);
	const [isFetchingConversion, setIsFetchingConversion] = useState(false);

	// --- DEBOUNCING FOR PERFORMANCE ---
	// We debounce the user's input to prevent API spam while they are typing.
	// Lightweight inline debounce via a ref/timer to avoid extra hook churn
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	// Deduplication refs to avoid firing the same request repeatedly
	const lastUsdDepsRef = useRef<string>("");
	const lastMinDepsRef = useRef<string>("");

	// --- 3. The Core Logic Effects ---

	// Effect for calculating the minimum required deposit amount.
	useEffect(() => {
		// This effect handles its own state and dependencies.
		let isActive = true;

		const calculateMinAmount = async () => {
			// Guard clause: Don't run if the necessary data isn't available.
			if (!selectedToken || !username || !chainId || !dstSwapInfo) {
				setMinRequiredAmount(MINIMUM_DEPOSIT_AMOUNT); // Reset to default
				return;
			}

			// For stablecoins, the minimum is fixed and doesn't require an API call.
			if (
				["USDT", "USDC", "55Swap", "USD₮0","USDT0"].includes(
					selectedToken.symbol
				)
			) {
				setMinRequiredAmount(MINIMUM_DEPOSIT_AMOUNT);
				return;
			}

			setIsFetchingConversion(true);
			try {
				const transactionService = TransactionService.getInstance();

				const result = await transactionService.getTokenConversion({
					network: chainId,
					// Find out how much of the selected token is equal to our minimum USD deposit.
					fromToken: dstSwapInfo.token_address,
					toToken: selectedToken.address,
					amount: MINIMUM_DEPOSIT_AMOUNT,
					username,
				});

				if (isActive && result.success && result.conversion) {
					// The API tells us the equivalent `fromAmount` needed.
					setMinRequiredAmount(result.conversion.toAmount);
				}
			} catch (error) {
				toast.error(
					`Error fetching minimum deposit amount. Please try again. ${error}`
				);

				if (isActive) setMinRequiredAmount(MINIMUM_DEPOSIT_AMOUNT); // Fallback on error
				console.error(
					"Failed to calculate minimum deposit amount:",
					error
				);
			} finally {
				if (isActive) setIsFetchingConversion(false);
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

		return () => {
			isActive = false;
		};
	}, [selectedToken, chainId, username, MINIMUM_DEPOSIT_AMOUNT]);

	// --- EFFECT 2: USDT Conversion Calculation ---
	// useEffect(() => {
	// 	let isActive = true;

	// 	const calculateUsdValue = async () => {
	// 		if (
	// 			!selectedToken ||
	// 			!depositAmount ||
	// 			!username ||
	// 			!chainId ||
	// 			!dstSwapInfo ||
	// 			parseFloat(depositAmount) <= 0
	// 		) {
	// 			setUsdtConversionAmount(0);
	// 			return;
	// 		}
	// 		if (["USDT", "USDC", "55Swap","USD₮0"].includes(selectedToken.symbol)) {
	// 			setUsdtConversionAmount(parseFloat(depositAmount));
	// 			return;
	// 		}

	// 		setIsFetchingConversion(true);
	// 		try {
	// 			const transactionService = TransactionService.getInstance();
	// 			const result = await transactionService.getTokenConversion({
	// 				network: String(chainId),
	// 				fromToken: dstSwapInfo.token_address,
	// 				toToken: selectedToken.address,
	// 				amount: parseFloat(depositAmount),
	// 				username,
	// 			});

	// 			if (isActive && result.success && result.conversion) {
	// 				console.log("Result.conversion:", result.conversion);
	// 				setUsdtConversionAmount(result.conversion.toAmount);
	// 			}
	// 		} catch (error) {
	// 			if (isActive) setUsdtConversionAmount(0);
	// 			console.error(
	// 				"Failed to calculate USDT conversion value:",
	// 				error
	// 			);
	// 		} finally {
	// 			if (isActive) setIsFetchingConversion(false);
	// 		}
	// 	};

	// 	calculateUsdValue();

	// 	return () => {
	// 		isActive = false;
	// 	};
	// }, [selectedToken, depositAmount, chainId, username]);

	useEffect(() => {
		let isActive = true;

		const calculateUsdValue = async () => {
			if (
				!selectedToken ||
				!depositAmount ||
				!username ||
				!chainId ||
				!dstSwapInfo ||
				parseFloat(depositAmount) <= 0
			) {
				setUsdtConversionAmount(0);
				return;
			}
			if (
				["USDT", "USDC", "55Swap", "USD₮0","USDT0"].includes(
					selectedToken.symbol
				)
			) {
				setUsdtConversionAmount(parseFloat(depositAmount));
				return;
			}

			setIsFetchingConversion(true);
			try {
				const transactionService = TransactionService.getInstance();
				const result = await transactionService.getTokenConversion({
					network: chainId,
					fromToken: selectedToken.address,
					toToken: dstSwapInfo.token_address,
					amount: parseFloat(depositAmount),
					username,
				});

				if (isActive && result.success && result.conversion) {
					setUsdtConversionAmount(result.conversion.toAmount);
				}
			} catch (error) {
				if (isActive) setUsdtConversionAmount(0);
				console.error(
					"Failed to calculate USDT conversion value:",
					error
				);
			} finally {
				if (isActive) setIsFetchingConversion(false);
			}
		};

		// Debounce and dedupe: only call when inputs settle and actually change
		const usdKey = JSON.stringify({
			chainId,
			username,
			selected: selectedToken?.address,
			dst: dstSwapInfo?.token_address,
			amount: depositAmount,
		});
		if (lastUsdDepsRef.current !== usdKey) {
			lastUsdDepsRef.current = usdKey;
			if (debounceTimerRef.current)
				clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = setTimeout(() => {
				calculateUsdValue();
			}, 400);
		}

		return () => {
			isActive = false;
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		};
	}, [selectedToken, depositAmount, chainId, username]);

	// --- 4. Return the Final API ---
	return {
		minRequiredAmount,
		usdtConversionAmount,
		isFetchingConversion,
	};
};
