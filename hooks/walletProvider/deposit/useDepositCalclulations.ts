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
	const { user, authToken } = useDynamicAuth();
	const username = user?.username;

	// --- 2. Manage the Hook's Own State ---
	const [minRequiredAmount, setMinRequiredAmount] = useState<number | null>(
		null
	);
	const [usdtConversionAmount, setUsdtConversionAmount] = useState(0);
	const [isFetchingMinDepositAmount, setIsFetchingMinDepositAmount] =
		useState(false);
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
				setMinRequiredAmount(null); // Reset to default
				return;
			}

			let letsCheckApi = 1;

			// For stablecoins, ask the wallet agent config for the minimum deposit.
			// if (
			// 	["USDT", "USDC", "55Swap", "USD₮0", "USDT0"].includes(
			// 		selectedToken.symbol
			// 	)
			// ) {
			setIsFetchingMinDepositAmount(true);
			try {
				const transactionService = TransactionService.getInstance();
				const response = await transactionService.getWalletAgentData(
					String(chainId),
					authToken
				);

				if (
					isActive &&
					!response.error &&
					response.data?.setting?.deposit_min
				) {
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
				if (isActive) setMinRequiredAmount(null);
				console.error(
					"Failed to fetch wallet agent config for deposit:",
					error
				);
			} finally {
				if (isActive) setIsFetchingMinDepositAmount(false);
			}

			// 	return;
			// }

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

				if (isActive && result.success && result.conversion) {
					// The API tells us the equivalent `fromAmount` needed.
					setMinRequiredAmount(result.conversion.toAmount);
				}
			} catch (error) {
				toast.error(
					`Error fetching minimum deposit amount. Please try again. ${error}`
				);

				if (isActive) setMinRequiredAmount(null); // Fallback on error
				console.error(
					"Failed to calculate minimum deposit amount:",
					error
				);
			} finally {
				if (isActive) setIsFetchingMinDepositAmount(false);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedToken, chainId, username, depositAmount]);

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
				["USDT", "USDC", "55Swap", "USD₮0", "USDT0"].includes(
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
		minRequiredAmount: minRequiredAmount as number,
		usdtConversionAmount,
		isFetchingConversion,
		isFetchingMinDepositAmount,
	};
};
