"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { WithdrawToken } from "@/types/walletProvider/transaction-service.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useAppStore } from "@/store/store";
import TransactionService from "@/services/walletProvider/TransactionService";
import { toast } from "sonner";

// A simple utility for basic address format validation.
const validateAddress = (address: string): boolean => {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * A specialized hook with a single responsibility: to manage all user inputs
 * and the state of the withdrawal form itself.
 *
 * It is the primary "state source" for the withdrawal feature.
 */
export const useWithdrawFormState = () => {
	// --- 1. Get Dependencies from Global Context ---
	const { user, authToken, isLoggedIn } = useDynamicAuth();

	// The user's total balance from the auth context.
	const maxWithdrawAmount = useMemo(
		() => user?.balance || 0,
		[user?.balance]
	);

	// maybe I'll be needing getNetwork here later if getting chainId from store becomes a problem
	const chainId = useAppStore((state) => state.blockchain.network.chainId);

	// --- 2. Manage the Hook's Own State ---

	// State for network and token selection
	const [availableTokens, setAvailableTokens] = useState<WithdrawToken[]>([]);
	const [isLoadingTokens, setIsLoadingTokens] = useState(false);

	// State for withdrawal form inputs
	const [withdrawAmount, setWithdrawAmount] = useState("");
	const [withdrawAddress, setWithdrawAddress] = useState("");
	const [selectedToken, setSelectedToken] = useState<WithdrawToken | null>(
		null
	);
	const [withdrawTokenSymbol, setWithdrawTokenSymbol] = useState("USDT"); // Default symbol

	// State for input validation
	const [isAddressValid, setIsAddressValid] = useState(true);
	const [isBalanceInsufficient, setIsBalanceInsufficient] = useState(false);
	const [isBelowMinimum, setIsBelowMinimum] = useState(false);

	// --- 3. CORE LOGIC: FETCHING AND STATE INITIALIZATION ---
	const fetchWithdrawTokensApi = async () => {
		if (!chainId) {
			setAvailableTokens([]);
			return;
		}
		setIsLoadingTokens(true);
		try {
			const transactionService = TransactionService.getInstance();
			const response = await transactionService.fetchWithdrawTokens(
				{ network: chainId },
				authToken
			);

			if (response.error === false && Array.isArray(response.data)) {
				const tokens = response.data;
				setAvailableTokens(tokens);
				if (tokens.length > 0) {
					setSelectedToken(tokens[0]);
					setWithdrawTokenSymbol(
						tokens[0]?.token_symbol || "Backup Value"
					);
				}
			} else {
				setAvailableTokens([]);
				const errorMessage =
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(response as any).message ||
					"Could not load withdrawal tokens for this network.";
				toast.error(errorMessage);
				console.error("Error fetching withdraw tokens:", errorMessage);
			}
		} catch (error) {
			setAvailableTokens([]);
			console.error("Error fetching withdraw tokens:", error);
			toast.error("An error occurred while fetching withdrawal tokens.");
		} finally {
			setIsLoadingTokens(false);
		}
	};

	useEffect(() => {
		if (isLoggedIn && chainId) {
			fetchWithdrawTokensApi();
		}
	}, [isLoggedIn, chainId]);

	// useEffect(() => {
	// 	// console.log("Fetching withdraw tokens for chainId:", chainId);
	// 	fetchWithdrawTokens();
	// }, []);

	// useEffect(() => {
	// 	console.log("Fetching withdraw tokens for chainId:", chainId);
	// 	console.log("Is user logged in?", isLoggedIn);
	// 	if (isLoggedIn && chainId) {
	// 		fetchWithdrawTokens();
	// 	} else {
	// 		setAvailableTokens([]);
	// 	}
	// }, [isLoggedIn, chainId]);

	// Fetch tokens when the hook is initialized or when the chainId changes
	// useEffect(() => {
	// 	if (isLoggedIn && chainId) {
	// 		fetchWithdrawTokens();
	// 	} else {
	// 		setAvailableTokens([]);
	// 	}
	// }, [chainId]);

	// --- 4. Logic Effects ---

	// Effect to set the initial state when data becomes available.
	// useEffect(() => {
	// 	// Set the first available token as the default selection.
	// 	if (!selectedToken && availableTokens.length > 0) {
	// 		setSelectedToken(availableTokens[0]);
	// 	}
	// 	// Set the user's own wallet as the default destination address.
	// 	if (!withdrawAddress && user?.walletAddress) {
	// 		setWithdrawAddress(user.walletAddress);
	// 		setIsAddressValid(validateAddress(user.walletAddress));
	// 	}
	// }, [availableTokens, user?.walletAddress, selectedToken, withdrawAddress]);

	// --- 4. Core Action Handlers (Callbacks) ---

	/**
	 * Handle changes to the withdrawal address
	 */
	const handleAddressChange = useCallback((value: string) => {
		setWithdrawAddress(value);
		setIsAddressValid(validateAddress(value));
	}, []);

	/**
	 * Handle changes to the withdrawal amount
	 */
	const handleAmountChange = useCallback(
		(value: string, minAmount: number) => {
			// This is a faithful implementation of your original sanitization logic.
			let sanitizedValue = value.replace(/[^0-9.]/g, "");

			// Handle decimal point logic
			const decimalCount = (sanitizedValue.match(/\./g) || []).length;
			if (decimalCount > 1) {
				sanitizedValue = sanitizedValue.substring(
					0,
					sanitizedValue.lastIndexOf(".")
				);
			}

			// handle decimal precision
			if (sanitizedValue.includes(".")) {
				const parts = sanitizedValue.split(".");
				sanitizedValue = `${parts[0]}.${parts[1].slice(0, 2)}`; // only 2 decimal places for withdrawals
			}

			if (
				sanitizedValue.startsWith("0") &&
				sanitizedValue !== "0" &&
				!sanitizedValue.startsWith("0.")
			) {
				sanitizedValue = sanitizedValue.replace(/^0+/, ""); // Remove leading zeros
			}

			if (sanitizedValue.startsWith(".")) {
				sanitizedValue = `0${sanitizedValue}`;
			}

			//  Check amount validity
			const amount = parseFloat(sanitizedValue) || 0;

			if (amount > maxWithdrawAmount) {
				setIsBalanceInsufficient(true);
			} else {
				setIsBalanceInsufficient(false);
			}

			//  Check if amount is below minmum
			if (amount > 0 && amount < minAmount) {
				setIsBelowMinimum(true);
			} else {
				setIsBelowMinimum(false);
			}

			setWithdrawAmount(sanitizedValue);
		},
		[maxWithdrawAmount]
	);

	/**
	 * Update token selection
	 */
	const updateSelectedToken = useCallback((token: WithdrawToken) => {
		setSelectedToken(token);
		setWithdrawTokenSymbol(token.token_symbol);
	}, []);

	/**
	 * Set maximum withdrawal amount
	 */
	const setMaxAmount = useCallback(
		(minAmount: number) => {
			const maxAmount = maxWithdrawAmount.toString();

			handleAmountChange(maxAmount, minAmount);
		},
		[maxWithdrawAmount, handleAmountChange]
	);

	/**
	 * Change the withdrawal token
	 */
	// const selectWithdrawToken = (token: WithdrawToken) => {
	// 	setWithdrawTokenSymbol(token.token_symbol);
	// };

	const resetFormState = useCallback(() => {
		setWithdrawAmount("");
		setIsAddressValid(true);
		setIsBalanceInsufficient(false);
		setIsBelowMinimum(false);
		setWithdrawTokenSymbol("USDT"); // Reset to default symbol
		// Do not reset the selected token or address, as these are often convenient to keep.
	}, []);

	const validateWithdrawal = useCallback(() => {
		const amount = parseFloat(withdrawAmount) || 0;
		if (
			isBalanceInsufficient ||
			isBelowMinimum ||
			!isAddressValid ||
			amount <= 0
		) {
			return false;
		}
		return true;
	}, [withdrawAmount]);

	// --- 5. Return the Final, Public API ---
	return {
		// State
		withdrawAmount,
		withdrawAddress,
		selectedToken,
		withdrawTokenSymbol,
		isAddressValid,
		isBalanceInsufficient,
		isBelowMinimum,
		maxWithdrawAmount,
		availableTokens,
		isLoadingTokens,

		// Actions
		handleAmountChange,
		handleAddressChange,
		setMaxAmount,
		// selectWithdrawToken,
		setWithdrawTokenSymbol,
		fetchWithdrawTokensApi,
		updateSelectedToken,
		resetFormState,
		validateWithdrawal,
	};
};
