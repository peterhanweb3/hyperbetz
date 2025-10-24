"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/lib/locale-provider";
import { useTipFormState } from "./useTipFormState";
import { useTipTransaction } from "./useTipTransaction";
import { useGasManager } from "@/hooks/walletProvider/deposit/useGasManger";
import { useAppStore } from "@/store/store";
import TransactionService from "@/services/walletProvider/TransactionService";

const useTipI18n = () => {
	const t = useTranslations("walletProvider.tipPanel");
	return useMemo(
		() => ({
			errors: {
				selectTokenAndAmount: () => t("errors.selectTokenAndAmount"),
				insufficientBalance: () => t("errors.insufficientBalance"),
				belowMinimum: (min: string) =>
					t("errors.belowMinimum", { min }),
				missingWallet: () => t("errors.missingWallet"),
				checkForm: () => t("errors.checkForm"),
			},
			status: {
				processing: () => t("status.processing"),
				awaitingApproval: () => t("status.awaitingApproval"),
				calculatingRate: () => t("status.calculatingRate"),
				insufficientBalance: () => t("status.insufficientBalance"),
				fetchingWallet: () => t("status.fetchingWallet"),
			},
			prompts: {
				selectToken: () => t("prompts.selectToken"),
				enterAmount: () => t("prompts.enterAmount"),
			},
			buttons: {
				tipUsd: (amount: string) => t("buttons.tipUsd", { amount }),
				tip: () => t("buttons.tip"),
			},
			minimumIs: (min: string) => t("minimumIs", { min }),
		}),
		[t]
	);
};

export const useTip = () => {
	const i18n = useTipI18n();
	const chainId = useAppStore((state) => state.blockchain.network.chainId);

	const {
		selectedToken,
		tipAmount,
		isBalanceInsufficient,
		formattedBalance,
		selectToken,
		handleAmountChange,
		resetFormState,
		setTipAmount,
		setIsBalanceInsufficient,
	} = useTipFormState();

	const { gasReservationAmount, isNativeCurrency } = useGasManager({
		selectedToken,
	});

	const [tipWalletAddress, setTipWalletAddress] = useState<string | null>(
		null
	);
	const [minTipAmount, setMinTipAmount] = useState<number>(0);
	const [isFetchingWallet, setIsFetchingWallet] = useState(false);

	const fetchTipWallet = useCallback(async () => {
		if (!chainId) {
			return null;
		}
		setIsFetchingWallet(true);
		try {
			const transactionService = TransactionService.getInstance();
			const result = await transactionService.getTipWallet(chainId);
			if (result.success && result.tipWallet) {
				setTipWalletAddress(result.tipWallet);
				const parsedMin = parseFloat(result.tipMinimum ?? "0");
				setMinTipAmount(Number.isFinite(parsedMin) ? parsedMin : 0);
				return result.tipWallet;
			}
			toast.error(i18n.errors.missingWallet());
			return null;
		} catch (error) {
			console.error("Failed to fetch tip wallet:", error);
			toast.error(i18n.errors.missingWallet());
			return null;
		} finally {
			setIsFetchingWallet(false);
		}
	}, [chainId, i18n]);

	useEffect(() => {
		fetchTipWallet();
	}, [fetchTipWallet]);

	const {
		isLoading,
		isApproving,
		isApproved,
		isPending,
		transactionHash,
		executeTransaction,
		resetTransactionState,
	} = useTipTransaction({
		selectedToken,
		tipAmount,
		tipWalletAddress,
		fetchTipWallet,
		onTransactionComplete: resetFormState,
	});

	const setMaxAmount = useCallback(() => {
		if (!selectedToken) return;
		if (isNativeCurrency) {
			const balance = parseFloat(selectedToken.balance);
			const maxAmount = Math.max(0, balance - gasReservationAmount);
			setTipAmount(String(maxAmount));
		} else {
			setTipAmount(selectedToken.balance);
		}
		setIsBalanceInsufficient(false);
	}, [
		selectedToken,
		isNativeCurrency,
		gasReservationAmount,
		setTipAmount,
		setIsBalanceInsufficient,
	]);

	const validateTip = useCallback(() => {
		if (!selectedToken || !tipAmount || parseFloat(tipAmount) <= 0) {
			toast.error(i18n.errors.selectTokenAndAmount());
			return false;
		}

		if (parseFloat(tipAmount) > parseFloat(selectedToken.balance)) {
			setIsBalanceInsufficient(true);
			toast.error(i18n.errors.insufficientBalance());
			return false;
		}

		if (minTipAmount > 0 && parseFloat(tipAmount) < minTipAmount) {
			toast.error(
				i18n.errors.belowMinimum(
					`${minTipAmount.toFixed(2)} ${selectedToken.symbol}`
				)
			);
			return false;
		}

		setIsBalanceInsufficient(false);
		return true;
	}, [
		selectedToken,
		tipAmount,
		minTipAmount,
		i18n.errors,
		setIsBalanceInsufficient,
	]);

	const executeTip = useCallback(async () => {
		if (!tipWalletAddress) {
			const address = await fetchTipWallet();
			if (!address) {
				toast.error(i18n.errors.missingWallet());
				return;
			}
		}

		if (!validateTip()) {
			toast.error(i18n.errors.checkForm());
			return;
		}

		await executeTransaction();
	}, [
		tipWalletAddress,
		fetchTipWallet,
		i18n.errors,
		validateTip,
		executeTransaction,
	]);

	const resetPage = useCallback(() => {
		resetFormState();
		resetTransactionState();
	}, [resetFormState, resetTransactionState]);

	const usdEstimate = useMemo(() => {
		if (!selectedToken || !tipAmount) return 0;
		const price = parseFloat(selectedToken.usd_price ?? "0");
		if (!Number.isFinite(price) || price <= 0) return 0;
		return price * parseFloat(tipAmount);
	}, [selectedToken, tipAmount]);

	const getButtonText = useCallback(() => {
		if (isLoading) return i18n.status.processing();
		if (isApproving) return i18n.status.awaitingApproval();
		if (isFetchingWallet) return i18n.status.fetchingWallet();
		if (!selectedToken) return i18n.prompts.selectToken();
		if (!tipAmount || parseFloat(tipAmount) <= 0)
			return i18n.prompts.enterAmount();
		if (isBalanceInsufficient) return i18n.status.insufficientBalance();
		if (minTipAmount > 0 && parseFloat(tipAmount) < minTipAmount)
			return i18n.minimumIs(
				`${minTipAmount.toFixed(2)} ${selectedToken.symbol}`
			);

		const displayAmount = usdEstimate.toFixed(2);
		return usdEstimate > 0
			? i18n.buttons.tipUsd(
					displayAmount === "0.00" ? "< 0.01" : displayAmount
			  )
			: i18n.buttons.tip();
	}, [
		isLoading,
		isApproving,
		isFetchingWallet,
		selectedToken,
		tipAmount,
		isBalanceInsufficient,
		minTipAmount,
		i18n,
		usdEstimate,
	]);

	const isTipDisabled = useCallback(() => {
		return (
			isLoading ||
			isApproving ||
			isPending ||
			isFetchingWallet ||
			!selectedToken ||
			!tipAmount ||
			parseFloat(tipAmount) <= 0 ||
			isBalanceInsufficient ||
			(minTipAmount > 0 && parseFloat(tipAmount) < minTipAmount)
		);
	}, [
		isLoading,
		isApproving,
		isPending,
		isFetchingWallet,
		selectedToken,
		tipAmount,
		isBalanceInsufficient,
		minTipAmount,
	]);

	return {
		selectedToken,
		tipAmount,
		isBalanceInsufficient,
		formattedBalance,
		isLoading,
		isApproving,
		isApproved,
		isPending,
		transactionHash,
		minTipAmount,
		usdEstimate,
		isFetchingWallet,
		selectToken,
		handleAmountChange,
		setMaxAmount,
		executeTip,
		resetPage,
		getButtonText,
		isTipDisabled,
	};
};
