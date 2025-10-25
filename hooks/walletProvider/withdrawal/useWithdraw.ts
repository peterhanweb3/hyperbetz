/*
 * =============================================================================
 * HOOK API DOCUMENTATION (FINAL)
 * =============================================================================
 *
 * This is the main, public-facing hook for the entire Deposit feature. It follows
 * the "Divide and Conquer" principle by composing five specialized, single-
 * responsibility child hooks into a single, cohesive API for the UI.
 *
 * --- CHILD HOOKS ---
 *
 * 1. `useTokens`
 *    - RESPONSIBILITY: Provides the list of available tokens for the current network.
 *    - RETURNS: { tokens, nativeToken, usdt, usdx, isTokensLoading, fetchTokens }
 *
 * 2. `useSwapInfo`
 *    - RESPONSIBILITY: Fetches the destination wallet info required for swaps.
 *    - RETURNS: { dstSwapInfo, isLoading }
 *
 * 3. `useDepositFormState`
 *    - RESPONSIBILITY: Manages all user inputs and core form state (token, amount).
 *    - RETURNS: { selectedToken, depositAmount, depositType, isBalanceInsufficient,
 *                 formattedBalance, selectToken, handleAmountChange, setMaxAmount,
 *                 validateDeposit, resetFormState }
 *
 * 4. `useGasManager`
 *    - RESPONSIBILITY: Manages all logic related to gas fees and native tokens.
 *    - RETURNS: { gasReservationAmount, isLowBalance, isNativeCurrency,
 *                 tooltipMessage, showTooltip }
 *
 * 5. `useDepositCalculations`
 *    - RESPONSIBILITY: Manages async conversion rate calculations for UI feedback.
 *    - RETURNS: { minRequiredAmount, usdtConversionAmount, isFetchingConversion }
 *
 * 6. `useDepositTransaction`
 *    - RESPONSIBILITY: Manages the entire on-chain transaction lifecycle.
 *    - RETURNS: { isLoading, isApproving, isApproved, isPending,
 *                 transactionHash, timeLeft, executeTransaction, resetTransactionState }
 *
 * --- MAIN `useDeposit` HOOK ---
 *
 *    - RESPONSIBILITY: Composes all child hooks, provides final validation, and
 *      returns a unified API for the UI component, including computed helpers
 *      like `getButtonText` and `isDepositDisabled`.
 *
 * =============================================================================
 */

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
// Localization: import the translation hook
import { useTranslations } from "@/lib/locale-provider";

// Wrap user-facing messages with translations in the walletProvider.withdrawPanel namespace.
// If this hook uses toast or error strings, prefer keys under walletProvider.withdrawPanel.errors/*.

// Withdraw localization accessor (no `any` or fuzzy fallbacks)
const useWithdrawI18n = () => {
	const t = useTranslations("walletProvider.withdrawPanel");
	return {
		errors: {
			pendingWithdrawal: () => t("errors.pendingWithdrawal"),
			invalidAddress: () => t("errors.invalidAddress"),
			enterAmount: () => t("errors.enterAmount"),
			networkNotSupported: () => t("errors.networkNotSupported"),
		},
		status: {
			processing: () => t("status.processing"),
			insufficientBalance: () => t("status.insufficientBalance"),
			pendingWithdrawal: () => t("status.pendingWithdrawal"),
		},
		buttons: {
			withdraw: (amount: string, symbol: string) =>
				t("buttons.withdraw", { amount, symbol }),
			minimum: (amount: string, symbol: string) =>
				t("buttons.minimum", { amount, symbol }),
		},
	};
};

// Import all five specialized child hooks
import { useWithdrawalNetworkCheck } from "./useWithdrawalNetworkCheck";
import { useWithdrawFormState } from "./useWithdrawFormState";
import { useWithdrawCalculations } from "./useWithdrawCalculations";
import { useWithdrawTransaction } from "./useWithdrawTransaction";

export const useWithdraw = () => {
	// --- 1. COMPOSE THE CHILD HOOKS IN A STRICT, TOP-DOWN ORDER ---

	// Initialize localization
	const i18n = useWithdrawI18n();

	// A. Get Global Context and Source State
	const { user, refreshUserData } = useDynamicAuth();
	const { isNetworkSupported } = useWithdrawalNetworkCheck();

	// B. Initialize the SELF-SUFFICIENT Form State and Token Fetching Hook
	const {
		availableTokens,
		isLoadingTokens,
		fetchWithdrawTokensApi,
		withdrawAmount,
		withdrawAddress,
		selectedToken,
		isAddressValid,
		isBalanceInsufficient,
		isBelowMinimum,
		maxWithdrawAmount,
		handleAmountChange,
		handleAddressChange,
		setMaxAmount,
		updateSelectedToken,
		resetFormState,
		validateWithdrawal,
	} = useWithdrawFormState();

	// C. Call the "Calculator" hooks
	const { fee, totalPayout, minWithdrawAmount, isFetchingMinWithdrawAmount } =
		useWithdrawCalculations({
			withdrawAmount,
		});

	// D. Call the "Executor" hook
	const {
		isLoading: isTransactionLoading,
		isPending,
		transactionHash,
		timeLeft,
		isWithdrawalSuccessful,
		showReservedModal,
		setShowReservedModal,
		executeWithdrawTransaction,
		startTimer,
		handleSpecialMessages,
		resetTransactionState,
	} = useWithdrawTransaction({
		selectedToken,
		withdrawAmount,
		withdrawAddress,
		onTransactionComplete: resetFormState, // Reset form when transaction completes
	});

	// E. Manage Final UI State that is local to this hook
	const [showingConfetti, setShowingConfetti] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);

	// F. Effect to show success modal when withdrawal is successful
	useEffect(() => {
		if (isWithdrawalSuccessful) {
			// Small delay to let confetti start first
			const timer = setTimeout(() => {
				setShowSuccessModal(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isWithdrawalSuccessful]);

	// --- 2. ORCHESTRATION & FINAL HELPER LOGIC (Faithful Implementation) ---

	const executeWithdraw = useCallback(async () => {
		// This is the orchestration logic from your original reference code.
		if (!validateWithdrawal()) {
			// The form state hook will have already shown a specific toast message.
			return;
		}
		if (user?.pendingWd === true) {
			toast.error(i18n.errors.pendingWithdrawal());
			return;
		}
		await executeWithdrawTransaction();
	}, [validateWithdrawal, user, executeWithdrawTransaction, i18n]);

	const resetPage = useCallback(() => {
		resetFormState();
		resetTransactionState();
		setShowSuccessModal(false);
	}, [resetFormState, resetTransactionState]);

	const getButtonText = useCallback((): string => {
		if (user?.pendingWd) return i18n.status.pendingWithdrawal();
		if (isTransactionLoading || isLoadingTokens)
			return i18n.status.processing();
		if (!withdrawAmount || parseFloat(withdrawAmount) <= 0)
			return i18n.errors.enterAmount();
		if (isBelowMinimum)
			return i18n.buttons.minimum(
				minWithdrawAmount.toFixed(2),
				selectedToken?.token_symbol || ""
			);
		if (isBalanceInsufficient) return i18n.status.insufficientBalance();
		if (!isAddressValid) return i18n.errors.invalidAddress();
		if (!isNetworkSupported) return i18n.errors.networkNotSupported();
		return i18n.buttons.withdraw(
			withdrawAmount,
			selectedToken?.token_symbol || ""
		);
	}, [
		isTransactionLoading,
		isLoadingTokens,
		withdrawAmount,
		isBelowMinimum,
		isBalanceInsufficient,
		isAddressValid,
		isNetworkSupported,
		selectedToken,
		minWithdrawAmount,
		user?.pendingWd,
		i18n,
	]);

	const isWithdrawDisabled = useCallback((): boolean => {
		return (
			!isNetworkSupported ||
			isTransactionLoading ||
			isLoadingTokens ||
			isPending ||
			user?.pendingWd === true ||
			!withdrawAmount ||
			parseFloat(withdrawAmount) <= 0 ||
			isBalanceInsufficient ||
			isBelowMinimum ||
			!isAddressValid
		);
	}, [
		isNetworkSupported,
		isTransactionLoading,
		isLoadingTokens,
		isPending,
		user?.pendingWd,
		withdrawAmount,
		isBalanceInsufficient,
		isBelowMinimum,
		isAddressValid,
	]);

	// --- 3. RETURN THE COMPLETE, UNIFIED API ---
	// This return object has 100% parity with your requested list.
	return {
		// State
		selectedToken,
		withdrawAmount,
		withdrawAddress,
		withdrawTokenSymbol: selectedToken?.token_symbol,
		fee,
		totalPayout,
		maxWithdrawAmount,
		pendingStatus: isPending,
		timeLeft,
		timerActive: isPending && timeLeft > 0,
		isLoading:
			isTransactionLoading ||
			isLoadingTokens ||
			isFetchingMinWithdrawAmount,
		isAmountValid: !isBelowMinimum && !isBalanceInsufficient,
		isAddressValid,
		isWithdrawalSuccessful,
		withdrawTxHash: transactionHash,
		showingConfetti,
		showSuccessModal,
		isBalanceInsufficient,
		isBelowMinimum,
		isNetworkSupported,
		showReservedModal,
		availableTokens,
		isLoadingTokens,
		tokenWD: selectedToken,
		minWithdrawAmount,
		isFetchingMinWithdrawAmount,

		// Actions
		handleAmountChange,
		handleAddressChange,
		setMaxAmount,
		// selectWithdrawToken: updateSelectedToken, // Alias for clarity
		updateSelectedToken,
		fetchWithdrawTokensApi,
		executeWithdraw,
		resetPage,
		startTimer, // Internal to useWithdrawTransaction
		handleSpecialMessages, // Internal to useWithdrawTransaction
		setShowingConfetti: (value: boolean) => setShowingConfetti(value),
		setShowReservedModal,
		refetchBalance: refreshUserData,
		setShowSuccessModal,

		// UI Helpers
		getButtonText,
		isWithdrawDisabled,
	};
};
