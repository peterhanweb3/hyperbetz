/**
 * useSwapQuote.ts
 * Manages token conversion calculations and quote fetching
 */

import { useState, useEffect, useCallback } from "react";
import TransactionService from "@/services/walletProvider/TransactionService";
import {
	UseSwapQuoteParams,
	UseSwapQuoteReturn,
	SwapConversion,
} from "@/types/walletProvider/swap-hooks.types";
import LocalStorageService from "@/services/localStorageService";
import { useAppStore } from "@/store/store";
import { useDebounce } from "../useDebounce";

export const useSwapQuote = ({
	fromToken,
	toToken,
	exchangeAmount,
	receivedAmount,
	isReversedQuote,
	_setExchangeAmount,
	_setReceivedAmount,
}: UseSwapQuoteParams): UseSwapQuoteReturn => {
	// --- DEBOUNCING FOR PERFORMANCE ---
	// Debounce amounts to prevent excessive API calls while user is typing (500ms)
	const debouncedExchangeAmount = useDebounce(exchangeAmount, 500);
	const debouncedReceivedAmount = useDebounce(receivedAmount, 500);

	// --- STATE ---
	const [conversion, setConversion] = useState<SwapConversion | null>(null);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [minRequiredAmount, setMinRequiredAmount] = useState<string>("0.01");
	const [estimatedGas, setEstimatedGas] = useState<string>("0");

	// --- DEPENDENCIES ---
	const { chainId } = useAppStore((state) => state.blockchain.network);
	const localStorageService = LocalStorageService.getInstance();
	const username = localStorageService.getUserData()?.username;

	/**
	 * Calculate and get the current exchange rate
	 * @returns {number} Exchange rate - how many toTokens you get for 1 fromToken
	 */
	const getExchangeRate = useCallback((): number => {
		if (
			!fromToken ||
			!toToken ||
			!exchangeAmount ||
			!receivedAmount ||
			parseFloat(exchangeAmount) === 0
		) {
			return 0;
		}

		const rate = parseFloat(receivedAmount) / parseFloat(exchangeAmount);
		return isNaN(rate) ? 0 : rate;
	}, [fromToken, toToken, exchangeAmount, receivedAmount]);

	/**
	 * Fetch quote from the conversion service (using debounced amounts)
	 */
	const fetchQuote = useCallback(async (): Promise<void> => {
		if (!fromToken || !toToken || !username) {
			return;
		}

		// If both amounts are empty, do nothing
		if (!debouncedExchangeAmount && !debouncedReceivedAmount) {
			return;
		}

		// If isReversedQuote is true, the receivedAmount should be used as the source
		// If isReversedQuote is false, the exchangeAmount should be used as the source
		const sourceAmount = isReversedQuote ? debouncedReceivedAmount : debouncedExchangeAmount;

		// Check if we have a valid source amount
		if (!sourceAmount || parseFloat(sourceAmount) <= 0) {
			return;
		}

		setIsFetching(true);

		try {
			const transactionService = TransactionService.getInstance();
			const networkId = chainId;

			const response = await transactionService.getTokenConversion({
				network: networkId as number,
				fromToken: isReversedQuote
					? toToken.address
					: fromToken.address,
				toToken: isReversedQuote ? fromToken.address : toToken.address,
				amount: parseFloat(sourceAmount),
				username,
			});

			if (response.success && response.conversion) {
				setConversion(response.conversion);

				// Set estimated gas if available
				setEstimatedGas(
					response.conversion.estimateGas?.toString() || "0"
				);

				const decimalValue = parseInt(
					localStorage.getItem("decimals") || "6"
				);

				// Update the target amount based on the quote direction
				if (isReversedQuote) {
					const formattedAmount = parseFloat(
						response.conversion.toAmount.toString()
					).toFixed(decimalValue);
					_setExchangeAmount(formattedAmount);
				} else {
					const formattedAmount = parseFloat(
						response.conversion.toAmount.toString()
					).toFixed(decimalValue);
					_setReceivedAmount(formattedAmount);
				}
			}
		} catch (error) {
			console.error("Error fetching swap quote:", error);
			setConversion(null);
		} finally {
			setIsFetching(false);
		}
	}, [
		fromToken,
		toToken,
		debouncedExchangeAmount,
		debouncedReceivedAmount,
		isReversedQuote,
		_setExchangeAmount,
		_setReceivedAmount,
		username,
		chainId,
	]);

	/**
	 * Effect to get quote when swap parameters change
	 */
	useEffect(() => {
		fetchQuote();
	}, [fetchQuote]);

	return {
		// State
		conversion,
		isFetching,
		minRequiredAmount,
		estimatedGas, // Export the estimated gas value

		// Actions
		getExchangeRate,
		fetchQuote,
		setMinRequiredAmount,
	};
};
