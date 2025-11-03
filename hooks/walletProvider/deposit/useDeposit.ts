// Localization: import the translation hook
import { useTranslations } from "@/lib/locale-provider";

// Wrap user-facing messages with translations in the walletProvider.depositPanel namespace.
// If this hook uses toast or error strings, prefer keys under walletProvider.depositPanel.errors/*.

// Deposit localization accessor (no `any` or fuzzy fallbacks)
const useDepositI18n = () => {
	const t = useTranslations("walletProvider.depositPanel");
	return {
		errors: {
			selectTokenAndAmount: () => t("errors.selectTokenAndAmount"),
			insufficientBalance: () => t("errors.insufficientBalance"),
			amountTooHighGas: () => t("errors.amountTooHighGas"),
			checkForm: () => t("errors.checkForm"),
			pendingDeposit: () => t("errors.pendingDeposit"),
		},
		status: {
			processing: () => t("status.processing"),
			awaitingApproval: () => t("status.awaitingApproval"),
			calculatingRate: () => t("status.calculatingRate"),
			insufficientBalance: () => t("status.insufficientBalance"),
		},
		prompts: {
			selectToken: () => t("selectToken"),
			enterAmount: () => t("enterAmount"),
		},
		buttons: {
			depositUsd: (amount: string) => t("buttons.depositUsd", { amount }),
		},
		minimumIs: (min: string) => t("minimumIs", { min }),
	};
};

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

import { useCallback, useEffect } from "react";
import { toast } from "sonner";

// Import all our specialized child hooks
import { useTokens } from "@/hooks/walletProvider/useTokens";
import { useSwapInfo } from "./useSwapInfo";
import { useDepositFormState } from "./useDepositFormState";
import { useGasManager } from "@/hooks/walletProvider/deposit/useGasManger";
import { useDepositCalculations } from "@/hooks/walletProvider/deposit/useDepositCalclulations";
import { useDepositTransaction } from "./useDepositTransaction";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useAppStore } from "@/store/store";
import { sanitizeAmountInput } from "@/lib/utils";

export const useDeposit = () => {
	// i18n accessors for messages and labels
	const i18n = useDepositI18n();
	// --- 1. COMPOSE THE CHILD HOOKS IN LOGICAL ORDER ---

	// Provider hooks (data sources)
	const { user } = useDynamicAuth(); // Get accInfo for pendingDepo checks
	const { isTokensLoading } = useTokens();
	const { dstSwapInfo } = useSwapInfo();

	// Get current chainId from store to monitor network changes
	const chainId = useAppStore((state) => state.blockchain.network.chainId);

	// State management and calculation hooks
	const {
		selectedToken,
		depositAmount,
		depositType,
		isBalanceInsufficient,
		formattedBalance,
		selectToken,
		handleAmountChange,
		setDepositAmount,
		setIsBalanceInsufficient,
		resetFormState,
	} = useDepositFormState();

	const {
		gasReservationAmount,
		isLowBalance,
		isNativeCurrency,
		tooltipMessage,
		showTooltip,
	} = useGasManager({ selectedToken });

	const {
		minRequiredAmount,
		usdtConversionAmount,
		isFetchingConversion,
		isFetchingMinDepositAmount,
	} = useDepositCalculations({
		selectedToken,
		depositAmount,
		dstSwapInfo,
	});

	// --- 1.5. MONITOR NETWORK CHANGES AND RESET FORM ---
	// This effect clears the selected token when the network changes
	// to prevent the bug where a token from the previous network remains selected
	useEffect(() => {
		if (selectedToken && chainId) {
			// Reset the form when network changes to prevent cross-network token selection
			resetFormState();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chainId]); // Only depend on chainId to trigger on network changes

	// The final execution engine
	const {
		isLoading,
		isApproving,
		isApproved,
		isPending,
		transactionHash,
		timeLeft,
		executeTransaction,
		resetTransactionState,
	} = useDepositTransaction({
		selectedToken,
		depositAmount,
		depositType,
		dstSwapInfo,
		isBalanceInsufficient,
		minRequiredAmount,
		onTransactionComplete: resetFormState, // Reset form when transaction completes
	});

	// --- 2. IMPLEMENT THE FINAL ORCHESTRATION & HELPER LOGIC ---

	/**
	 * The final, public-facing executeDeposit function. It performs the last
	 * set of checks that depend on state from multiple child hooks before
	 * calling the transaction executor.
	 */

	const setMaxAmount = useCallback(() => {
		if (!selectedToken) return;
		if (isNativeCurrency) {
			const balance = parseFloat(selectedToken.balance);
			const maxAmount = Math.max(0, balance - gasReservationAmount);
			const sanitizedValue = sanitizeAmountInput(String(maxAmount));
			setDepositAmount(sanitizedValue);
		} else {
			const sanitizedValue = sanitizeAmountInput(
				String(selectedToken.balance)
			);
			setDepositAmount(sanitizedValue);
			// setDepositAmount();
		}
		setIsBalanceInsufficient(false);
	}, [
		selectedToken,
		isNativeCurrency,
		gasReservationAmount,
		setDepositAmount,
		setIsBalanceInsufficient,
	]);

	const validateDeposit = useCallback(
		() => {
			if (
				!selectedToken ||
				!depositAmount ||
				parseFloat(depositAmount) <= 0
			) {
				toast.error(i18n.errors.selectTokenAndAmount());
				return false;
			}
			if (parseFloat(depositAmount) > parseFloat(selectedToken.balance)) {
				setIsBalanceInsufficient(true);
				toast.error(i18n.errors.insufficientBalance());
				return false;
			}
			// if (parseFloat(depositAmount) < minRequiredAmount) {
			// 	toast.error(
			// 		`Minimum deposit is ${minRequiredAmount.toFixed(4)} ${
			// 			selectedToken.symbol
			// 		}`
			// 	);
			// 	return false;
			// }
			setIsBalanceInsufficient(false);
			return true;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			selectedToken,
			depositAmount,
			minRequiredAmount,
			setIsBalanceInsufficient,
		]
	);

	const executeDeposit = useCallback(async () => {
		// This is the faithful implementation of your original pre-flight checks.
		if (user && user.pendingDepo === true) {
			toast.warning(i18n.errors.pendingDeposit());
			return;
		}

		// Commenting out the gas reservation check as this does not exist in Dhiraj's Code
		// if (isNativeCurrency) {
		// 	const totalNeeded = parseFloat(depositAmount);
		// 	// Ensure the deposit amount doesn't consume the gas reservation

		// 	if (
		// 		totalNeeded >
		// 		parseFloat(selectedToken!.balance) - gasReservationAmount
		// 	) {
		// 		toast.error("Amount is too high when accounting for gas fees.");
		// 		return;
		// 	}
		// }

		if (!validateDeposit()) {
			toast.error(i18n.errors.checkForm());
			return;
		}

		// If all checks pass, call the actual transaction execution logic.
		await executeTransaction();
	}, [
		user,
		isNativeCurrency,
		depositAmount,
		selectedToken,
		gasReservationAmount,
		validateDeposit,
		minRequiredAmount,
		executeTransaction,
	]);

	/**
	 * Resets the state of all relevant child hooks.
	 */
	const resetPage = useCallback(() => {
		resetFormState();
		resetTransactionState();
	}, [resetFormState, resetTransactionState]);

	/**
	 * A UI helper that computes the correct button text based on the
	 * combined state from multiple child hooks.
	 */
	const getButtonText = useCallback(() => {
		if (isLoading) return i18n.status.processing();
		if (isApproving) return i18n.status.awaitingApproval();
		if (!selectedToken) return i18n.prompts.selectToken();
		if (!depositAmount || parseFloat(depositAmount) <= 0)
			return i18n.prompts.enterAmount();
		if (isFetchingConversion) return i18n.status.calculatingRate();
		// if (parseFloat(depositAmount) < minRequiredAmount) {
		// 	return `Minimum ${minRequiredAmount.toFixed(4)} ${
		// 		selectedToken.symbol
		// 	}`;
		// }
		if (isBalanceInsufficient) return i18n.status.insufficientBalance();

		// The logic from the original reference code
		const displayAmount =
			usdtConversionAmount.toFixed(2) === "0.00"
				? "< 0.01"
				: usdtConversionAmount.toFixed(2);
		return i18n.buttons.depositUsd(displayAmount);
	}, [
		isLoading,
		isApproving,
		selectedToken,
		depositAmount,
		isBalanceInsufficient,
		minRequiredAmount,
		usdtConversionAmount,
		isFetchingConversion,
	]);

	/**
	 * A UI helper that computes if the main action button should be disabled.
	 */
	const isDepositDisabled = useCallback(() => {
		return (
			isLoading ||
			isApproving ||
			isPending ||
			!selectedToken ||
			!depositAmount ||
			parseFloat(depositAmount) <= 0 ||
			isBalanceInsufficient ||
			parseFloat(depositAmount) < minRequiredAmount ||
			user?.pendingDepo === true
		);
	}, [
		isLoading,
		isApproving,
		isPending,
		selectedToken,
		depositAmount,
		isBalanceInsufficient,
		minRequiredAmount,
		user,
	]);

	// --- 3. RETURN THE COMPLETE, UNIFIED API ---
	// This return object has 100% parity with your requested list.
	return {
		// State
		selectedToken,
		depositAmount,
		depositType,
		isLoading,
		isApproving,
		isApproved,
		isPending,
		isBalanceInsufficient,
		formattedBalance,
		minRequiredAmount,
		usdtConversionAmount,
		transactionHash,
		timeLeft,
		gasReservationAmount,
		isLowBalance,
		isNativeCurrency,
		isFetchingMinDepositAmount,
		isTokensLoading,

		// Actions
		selectToken,
		handleAmountChange,
		setMaxAmount,
		executeDeposit,
		resetPage,

		// UI Helpers
		getButtonText,
		isDepositDisabled,
		tooltipMessage,
		showTooltip,
		isFetchingConversion,
	};
};
