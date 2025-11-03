/**
 * useSwapFormState.ts
 * Manages all user inputs and core form state for token swapping
 */

import { useState, useCallback } from "react";
import React from "react";
import { Token } from "@/types/blockchain/swap.types";
import { UseSwapFormStateReturn } from "@/types/walletProvider/swap-hooks.types";
import { sanitizeAmountInput } from "@/lib/utils";

export const useSwapFormState = (): UseSwapFormStateReturn => {
	// --- STATE ---
	const [fromToken, setFromToken] = useState<Token | null>(null);
	const [toToken, setToToken] = useState<Token | null>(null);
	const [exchangeAmount, setExchangeAmount] = useState<string>("");
	const [receivedAmount, setReceivedAmount] = useState<string>("");
	const [isReversedQuote, setIsReversedQuote] = useState<boolean>(false);

	// --- DERIVED STATE ---
	const isValidSwap = Boolean(
		fromToken && toToken && fromToken.address !== toToken.address
	);

	/**
	 * Switch fromToken and toToken
	 */
	const switchTokens = useCallback(() => {
		if (fromToken || toToken) {
			const tempFrom = fromToken;
			const tempTo = toToken;
			const tempExchange = exchangeAmount;
			const tempReceived = receivedAmount;

			setFromToken(tempTo);
			setToToken(tempFrom);
			setExchangeAmount(tempReceived);
			setReceivedAmount(tempExchange);
			setIsReversedQuote(!isReversedQuote);
		}
	}, [fromToken, toToken, exchangeAmount, receivedAmount, isReversedQuote]);

	/**
	 * Handle exchange amount input change
	 */
	const handleExchangeAmountChange = useCallback(
		(
			value: string | React.ChangeEvent<HTMLInputElement>,
			decimal: number = 6
		) => {
			let sanitizedValue: string =
				typeof value === "string" ? value : value.target.value;

			sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, "");

			const decimalCount = (sanitizedValue.match(/\./g) || []).length;
			if (decimalCount > 1) {
				sanitizedValue = sanitizedValue.substring(
					0,
					sanitizedValue.lastIndexOf(".")
				);
			}

			if (sanitizedValue.includes(".")) {
				const parts = sanitizedValue.split(".");
				sanitizedValue = `${parts[0]}.${parts[1].slice(0, decimal)}`;
			}

			setExchangeAmount(sanitizedValue);
			// Clear receivedAmount to trigger a new quote calculation
			// and set isReversedQuote to false to indicate we're calculating in the normal direction
			if (receivedAmount) {
				setReceivedAmount("");
			}
			setIsReversedQuote(false);
		},
		[receivedAmount]
	);

	/**
	 * Handle received amount input change
	 */
	const handleReceivedAmountChange = useCallback(
		(
			value: string | React.ChangeEvent<HTMLInputElement>,
			decimal: number = 6
		) => {
			let sanitizedValue: string =
				typeof value === "string" ? value : value.target.value;

			sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, "");

			const decimalCount = (sanitizedValue.match(/\./g) || []).length;
			if (decimalCount > 1) {
				sanitizedValue = sanitizedValue.substring(
					0,
					sanitizedValue.lastIndexOf(".")
				);
			}

			if (sanitizedValue.includes(".")) {
				const parts = sanitizedValue.split(".");
				sanitizedValue = `${parts[0]}.${parts[1].slice(0, decimal)}`;
			}

			setReceivedAmount(sanitizedValue);
			// Clear exchangeAmount to trigger a new quote calculation
			// and set isReversedQuote to true to indicate we're calculating in the reverse direction
			if (exchangeAmount) {
				setExchangeAmount("");
			}
			setIsReversedQuote(true);
		},
		[exchangeAmount]
	);

	/**
	 * Set maximum amount based on available balance
	 * Note: Gas reservation logic is handled by the calling component through useSwapGasManager
	 */
	const setMaxAmount = useCallback(
		(gasReservationAmount?: number) => {
			if (fromToken && fromToken.balance) {
				const balance = parseFloat(fromToken.balance);
				let maxAmount = balance;

				// If gas reservation amount is provided (for native tokens), subtract it
				if (gasReservationAmount && gasReservationAmount > 0) {
					maxAmount = Math.max(0, balance - gasReservationAmount);
				}

				if (maxAmount <= 0) {
					setExchangeAmount("0");
				} else {
					// setExchangeAmount(maxAmount.toString());
					setExchangeAmount(sanitizeAmountInput(String(maxAmount), 6));
				}
				setReceivedAmount("");
				setIsReversedQuote(false);
			}
		},
		[fromToken]
	);

	/**
	 * Reset token selections
	 */
	const resetTokens = useCallback(() => {
		setFromToken(null);
		setToToken(null);
		setExchangeAmount("");
		setReceivedAmount("");
		setIsReversedQuote(false);
	}, []);

	/**
	 * Reset amounts but keep token selections
	 */
	const resetAmounts = useCallback(() => {
		setExchangeAmount("");
		setReceivedAmount("");
		setIsReversedQuote(false);
	}, []);

	/**
	 * Reset the entire form state
	 */
	const resetFormState = useCallback(() => {
		setFromToken(null);
		setToToken(null);
		setExchangeAmount("");
		setReceivedAmount("");
		setIsReversedQuote(false);
	}, []);

	return {
		// State
		fromToken,
		toToken,
		exchangeAmount,
		receivedAmount,
		isReversedQuote,
		isValidSwap,

		// Actions
		setFromToken,
		setToToken,
		switchTokens,
		handleExchangeAmountChange,
		handleReceivedAmountChange,
		setMaxAmount,
		resetTokens,
		resetAmounts,
		resetFormState,

		// Raw setters for internal use by other hooks
		_setExchangeAmount: setExchangeAmount,
		_setReceivedAmount: setReceivedAmount,
		_setIsReversedQuote: setIsReversedQuote,
	};
};
