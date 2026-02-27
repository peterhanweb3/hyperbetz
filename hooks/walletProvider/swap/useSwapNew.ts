/**
 * useSwap.ts
 * Main orchestrating hook for token swap operations
 *
 * This hook follows the "Divide and Conquer" principle by composing specialized,
 * single-responsibility child hooks into a single, cohesive API for the UI.
 *
 * --- CHILD HOOKS ---
 *
 * 1. `useSwapFormState`
 *    - RESPONSIBILITY: Manages all user inputs and core form state (tokens, amounts)
 *    - RETURNS: { fromToken, toToken, exchangeAmount, receivedAmount, isReversedQuote,
 *                 setFromToken, setToToken, handleAmountChanges, resetFormState, etc. }
 *
 * 2. `useSwapQuote`
 *    - RESPONSIBILITY: Manages token conversion calculations and quote fetching
 *    - RETURNS: { conversion, isFetching, getExchangeRate, fetchQuote }
 *
 * 3. `useSwapGasManager`
 *    - RESPONSIBILITY: Manages gas fees, tooltips, and native currency logic
 *    - RETURNS: { gasReservationAmount, isLowBalance, toolTipMessage, showToolTip, isNativeCurrency }
 *
 * 4. `useSwapAllowance`
 *    - RESPONSIBILITY: Manages token allowance checking and approval
 *    - RETURNS: { isTokenAllowed, isApproveLoading, approveToken, resetPermitState }
 *
 * 5. `useSwapTransaction`
 *    - RESPONSIBILITY: Manages the swap transaction execution and state
 *    - RETURNS: { isLoading, executeSwap, validateSwap, resetSwapState, txHash }
 *
 * --- MAIN `useSwap` HOOK ---
 *
 *    - RESPONSIBILITY: Composes all child hooks, provides final validation, and
 *      returns a unified API for the UI component.
 */

import { useState, useEffect, useCallback } from "react";
import { useTokens } from "@/hooks/walletProvider/useTokens";
import { Token } from "@/types/blockchain/swap.types";
import { useAppStore } from "@/store/store";
import { useTranslations } from "@/lib/locale-provider";

// Import all specialized child hooks
import { useSwapFormState } from "./useSwapFormState";
import { useSwapQuote } from "./useSwapQuote";
import { useSwapGasManager } from "./useSwapGasManager";
import { useSwapAllowance } from "./useSwapAllowance";
import { useSwapTransaction } from "./useSwapTransaction";
import { useSwapTokenPrices } from "./useSwapTokenPrices";

// Import types
import {
	UseSwapOptions,
	UseSwapReturn,
	SwapTransactionResult,
} from "@/types/walletProvider/swap-hooks.types";

// Swap localization accessor
const useSwapI18n = () => {
	const t = useTranslations("walletProvider.swapPanel");
	return {
		selectTokens: () => t("selectTokens"),
		enterAmount: () => t("enterAmount"),
		gettingQuote: () => t("gettingQuote"),
		confirming: () => t("confirming"),
		approving: () => t("approving"),
		approveAndSwap: () => t("approveAndSwap"),
		swap: () => t("swap"),
		insufficientBalance: () => t("insufficientBalance"),
		sameToken: () => t("sameToken"),
	};
};

const useSwap = (options: UseSwapOptions = {}): UseSwapReturn => {
	// i18n accessors for messages and labels
	const i18n = useSwapI18n();

	// --- 1. COMPOSE THE CHILD HOOKS IN LOGICAL ORDER ---

	// Get chainId from store to listen for network changes
	const { chainId } = useAppStore((state) => state.blockchain.network);

	// Additional state for slippage and other settings
	const [slippage, setSlippage] = useState<string>("Auto");
	const [isTokenPermit, setIsTokenPermit] = useState<boolean>(true);
	const [allowanceAddress] = useState<string>(
		options.allowanceAddress || "0x111111125421ca6dc452d289314280a0f8842a65"
	);

	// A. Form State Management (Core state)
	const {
		fromToken,
		toToken,
		exchangeAmount,
		receivedAmount,
		isReversedQuote,
		setFromToken,
		setToToken,
		switchTokens,
		handleExchangeAmountChange,
		handleReceivedAmountChange,
		setMaxAmount,
		resetTokens,
		resetAmounts,
		resetFormState,
		_setExchangeAmount,
		_setReceivedAmount,
	} = useSwapFormState();

	// B. Quote and Conversion Management
	const {
		conversion,
		isFetching,
		minRequiredAmount,
		estimatedGas,
		getExchangeRate,
		fetchQuote,
		setMinRequiredAmount,
	} = useSwapQuote({
		fromToken,
		toToken,
		exchangeAmount,
		receivedAmount,
		isReversedQuote,
		_setExchangeAmount,
		_setReceivedAmount,
	});

	// C. Gas and Native Currency Management
	const {
		gasReservationAmount,
		isLowBalance,
		toolTipMessage,
		showToolTip,
		isNativeCurrency,
		getGasReservationAmount,
	} = useSwapGasManager({ fromToken });

	// D. Token Allowance Management
	const {
		isTokenAllowed,
		isApproveLoading,
		isApproveSuccess,
		isApproveError,
		approveErrorMsg,
		tokenAproveStarted,
		checkTokenAllowance,
		approveToken,
		resetPermitState: resetAllowancePermitState,
	} = useSwapAllowance({ fromToken, allowanceAddress });

	// E. Transaction Execution
	const {
		isLoading,
		checkSuccess,
		transactionSuccess,
		successPop,
		txHash,
		isPending,
		timeLeft,
		completedExchangeAmount,
		completedReceivedAmount,
		completedFromToken,
		completedToToken,
		executeSwap: executeSwapTransaction,
		validateSwap,
		resetSwapState,
		setSuccessPop,
	} = useSwapTransaction({
		fromToken,
		toToken,
		exchangeAmount,
		receivedAmount,
		slippage,
		onTransactionComplete: resetFormState,
	});

	// F. Token Data (from existing hook)
	const { fetchTokens, tokens } = useTokens();

	// G. Token Price Management
	const {
		fromTokenUsdPrice,
		toTokenUsdPrice,
		isFetchingPrices,
		fetchTokenPrices,
	} = useSwapTokenPrices({ fromToken, toToken });

	// --- 2. ORCHESTRATION & HELPER LOGIC ---

	/**
	 * Execute the swap with all pre-flight checks
	 */
	const executeSwap =
		useCallback(async (): Promise<SwapTransactionResult> => {
			if (!validateSwap()) {
				return { success: false, error: "Validation failed" };
			}

			// Check if approval is needed for non-native tokens
			if (!isTokenAllowed && !isNativeCurrency()) {
				const approvalResult = await approveToken();
				if (!approvalResult) {
					return { success: false, error: "Token approval failed" };
				}
			}

			// Execute the actual swap
			return await executeSwapTransaction();
		}, [
			validateSwap,
			isTokenAllowed,
			isNativeCurrency,
			approveToken,
			executeSwapTransaction,
		]);

	/**
	 * Reset the entire swap state
	 */
	const resetPage = useCallback(() => {
		resetFormState();
		resetSwapState();
		resetAllowancePermitState();
	}, [resetFormState, resetSwapState, resetAllowancePermitState]);

	/**
	 * Enhanced setMaxAmount that handles gas reservation for native tokens
	 */
	const enhancedSetMaxAmount = useCallback(async () => {
		if (fromToken && fromToken.balance) {
			let gasReservation = 0;

			// If it's a native currency, get gas reservation amount
			if (isNativeCurrency()) {
				gasReservation = await getGasReservationAmount();
			}

			setMaxAmount(gasReservation);
		}
	}, [fromToken, isNativeCurrency, getGasReservationAmount, setMaxAmount]);
	/**
	 * Enhanced token update functions that preserve functionality
	 */
	const updateFromToken = useCallback(
		(token: Token | null) => {
			if (toToken && token && toToken.address === token.address) {
				// Switch tokens if selecting the same token
				const temp = fromToken;
				setFromToken(token);
				setToToken(temp);
			} else {
				setFromToken(token);
			}
		},
		[fromToken, toToken, setFromToken, setToToken]
	);

	const updateToToken = useCallback(
		(token: Token | null) => {
			if (fromToken && token && fromToken.address === token.address) {
				// Switch tokens if selecting the same token
				const temp = toToken;
				setToToken(token);
				setFromToken(temp);
			} else {
				setToToken(token);
			}
		},
		[fromToken, toToken, setFromToken, setToToken]
	);

	/**
	 * Determine if gas fee information should be shown
	 */
	const showGasFee = Boolean(
		exchangeAmount &&
		receivedAmount &&
		fromToken &&
		toToken &&
		parseFloat(exchangeAmount) > 0
	);

	/**
	 * Enhanced resetPermitState that maintains backwards compatibility
	 */
	const resetPermitState = useCallback(() => {
		// Reset both permit state and allowance state
		setIsTokenPermit(true);
		resetAllowancePermitState();
	}, [resetAllowancePermitState]);

	// Add effect to sync selected tokens with refreshed token data (with debounce)
	useEffect(() => {
		if (!tokens || !Array.isArray(tokens)) return;

		const timeoutId = setTimeout(() => {
			// Update fromToken if it exists and tokens have been refreshed
			if (fromToken && fromToken.address) {
				const updatedFromToken = tokens.find(
					(token: Token) =>
						token.address?.toLowerCase() ===
						fromToken.address?.toLowerCase()
				);
				if (
					updatedFromToken &&
					updatedFromToken.balance !== fromToken.balance
				) {
					setFromToken(updatedFromToken);
				}
			}

			// Update toToken if it exists and tokens have been refreshed
			if (toToken && toToken.address) {
				const updatedToToken = tokens.find(
					(token: Token) =>
						token.address?.toLowerCase() ===
						toToken.address?.toLowerCase()
				);
				if (
					updatedToToken &&
					updatedToToken.balance !== toToken.balance
				) {
					setToToken(updatedToToken);
				}
			}
		}, 500); // 500ms debounce

		return () => clearTimeout(timeoutId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tokens, fromToken?.address, toToken?.address]);

	// Add effect to reset tokens when network changes
	useEffect(() => {
		if (chainId) {
			// Reset the form state when network changes to prevent
			// tokens from previous network being retained
			resetFormState();
			resetSwapState();
			resetAllowancePermitState();
		}
		// Only depend on chainId changes, not initial load
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chainId]);

	/**
	 * A UI helper that computes the correct button text based on the
	 * combined state from multiple child hooks.
	 */
	const getSwapButtonText = useCallback(() => {
		if (!fromToken || !toToken) return i18n.selectTokens();
		if (!exchangeAmount && !receivedAmount) return i18n.enterAmount();
		if (isFetching) return i18n.gettingQuote();
		if (isLoading) return i18n.confirming();
		if (isApproveLoading) return i18n.approving();
		if (!isTokenAllowed) return i18n.approveAndSwap();
		if (validateSwap()) return i18n.swap();
		if (parseFloat(exchangeAmount) > parseFloat(fromToken.balance))
			return i18n.insufficientBalance();
		if (fromToken.address === toToken.address) return i18n.sameToken();
		return i18n.enterAmount();
	}, [
		fromToken,
		toToken,
		exchangeAmount,
		receivedAmount,
		isFetching,
		isLoading,
		isApproveLoading,
		isTokenAllowed,
		validateSwap,
		i18n,
	]);

	// --- 3. RETURN THE COMPLETE, UNIFIED API ---
	// This maintains 100% compatibility with the original useSwap hook interface
	return {
		// Core state (backwards compatible)
		fromToken,
		toToken,
		setFromToken: updateFromToken,
		setToToken: updateToToken,
		exchangeAmount,
		receivedAmount,
		conversion,
		estimatedGas,
		slippage,
		setSlippage,
		isLoading,
		isFetching,
		isApproveLoading,
		isApproveSuccess,
		isApproveError,
		approveErrorMsg,
		isTokenAllowed,
		isTokenPermit: isTokenPermit, // Now a real state variable
		setIsTokenPermit,
		checkSuccess,
		transactionSuccess,
		successPop,
		txHash,
		isPending,
		timeLeft,
		completedExchangeAmount,
		completedReceivedAmount,
		completedFromToken,
		completedToToken,
		showGasFee,
		isLowBalance,
		gasReservationAmount,
		isNativeCurrency,
		tokenAproveStarted,

		// Actions (backwards compatible)
		switchTokens,
		resetTokens,
		resetAmounts,
		handleExchangeAmountChange,
		handleReceivedAmountChange,
		setMaxAmount: enhancedSetMaxAmount,
		executeSwap,
		approveToken,
		resetSwapState,
		resetPermitState,
		getExchangeRate,
		toolTipMessage,
		showToolTip,

		// Additional methods for completeness
		validateSwap,
		resetPage,
		fetchTokens,
		tokens,
		setSuccessPop,
		minRequiredAmount,
		setMinRequiredAmount,
		fetchQuote,
		checkTokenAllowance,
		getGasReservationAmount,

		// Token price data
		fromTokenUsdPrice,
		toTokenUsdPrice,
		isFetchingPrices,
		fetchTokenPrices,

		// UI Helpers
		getSwapButtonText,
	};
};

export default useSwap;
