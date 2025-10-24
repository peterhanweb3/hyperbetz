"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { sanitizeAmountInput, formatFullAmount } from "@/lib/utils";
import { Token } from "@/types/blockchain/swap.types";

export const useTipFormState = () => {
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);
	const [tipAmount, setTipAmount] = useState("");
	const [isBalanceInsufficient, setIsBalanceInsufficient] = useState(false);

	const formattedBalance = useMemo(() => {
		if (!selectedToken?.balance) return "0.00";
		return parseFloat(formatFullAmount(selectedToken.balance)).toFixed(6);
	}, [selectedToken]);

	const selectToken = useCallback((token: Token) => {
		setSelectedToken(token);
		setTipAmount("");
		setIsBalanceInsufficient(false);
	}, []);

	const handleAmountChange = useCallback((value: string) => {
		const sanitizedValue = sanitizeAmountInput(value);
		setTipAmount(sanitizedValue);
	}, []);

	useEffect(() => {
		if (selectedToken && tipAmount) {
			setIsBalanceInsufficient(
				parseFloat(tipAmount) > parseFloat(selectedToken.balance)
			);
		} else {
			setIsBalanceInsufficient(false);
		}
	}, [tipAmount, selectedToken]);

	const resetFormState = useCallback(() => {
		setSelectedToken(null);
		setTipAmount("");
		setIsBalanceInsufficient(false);
	}, []);

	return {
		selectedToken,
		tipAmount,
		isBalanceInsufficient,
		formattedBalance,
		selectToken,
		handleAmountChange,
		resetFormState,
		setTipAmount,
		setIsBalanceInsufficient,
	};
};
