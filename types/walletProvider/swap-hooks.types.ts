/**
 * TypeScript type definitions for swap hooks
 * Contains all types for the modular swap hook architecture
 */

import { Token } from "@/types/blockchain/swap.types";

// --- Base Swap Types ---
export interface SwapFormState {
	fromToken: Token | null;
	toToken: Token | null;
	exchangeAmount: string;
	receivedAmount: string;
	isReversedQuote: boolean;
}

export interface SwapConversion {
	fromToken: string;
	toToken: string;
	fromAmount: number;
	toAmount: number;
	timestamp?: number;
}

export interface SwapQuoteParams {
	network: string;
	fromToken: string;
	toToken: string;
	amount: number;
	username: string;
}

export interface SwapExecuteParams {
	network: string;
	fromToken: string;
	toToken: string;
	amount: string;
	walletAddress: string;
	receiver?: string;
	slippage: string;
	username: string;
}

// --- Hook Options ---
export interface UseSwapOptions {
	allowanceAddress?: string;
}

export interface UseSwapFormStateReturn {
	// State
	fromToken: Token | null;
	toToken: Token | null;
	exchangeAmount: string;
	receivedAmount: string;
	isReversedQuote: boolean;
	isValidSwap: boolean;

	// Actions
	setFromToken: (token: Token | null) => void;
	setToToken: (token: Token | null) => void;
	switchTokens: () => void;
	handleExchangeAmountChange: (
		value: string | React.ChangeEvent<HTMLInputElement>,
		decimal?: number
	) => void;
	handleReceivedAmountChange: (
		value: string | React.ChangeEvent<HTMLInputElement>,
		decimal?: number
	) => void;
	setMaxAmount: (gasReservationAmount?: number) => void;
	resetTokens: () => void;
	resetAmounts: () => void;
	resetFormState: () => void;

	// Internal setters for other hooks
	_setExchangeAmount: (amount: string) => void;
	_setReceivedAmount: (amount: string) => void;
	_setIsReversedQuote: (isReversed: boolean) => void;
}

export interface UseSwapQuoteParams {
	fromToken: Token | null;
	toToken: Token | null;
	exchangeAmount: string;
	receivedAmount: string;
	isReversedQuote: boolean;
	_setExchangeAmount: (amount: string) => void;
	_setReceivedAmount: (amount: string) => void;
}

export interface UseSwapQuoteReturn {
	// State
	conversion: SwapConversion | null;
	isFetching: boolean;
	minRequiredAmount: string;
	estimatedGas: string;
	// Actions
	getExchangeRate: () => number;
	fetchQuote: () => Promise<void>;
	setMinRequiredAmount: (amount: string) => void;
}

export interface UseSwapGasManagerParams {
	fromToken: Token | null;
}

export interface UseSwapGasManagerReturn {
	// State
	gasReservationAmount: number;
	isLowBalance: boolean;
	toolTipMessage: string;
	showToolTip: boolean;

	// Computed values
	isNativeCurrency: () => boolean;

	// Actions
	getGasReservationAmount: () => Promise<number>;
	getMessage: () => Promise<string>;
}

export interface UseSwapAllowanceParams {
	fromToken: Token | null;
	allowanceAddress?: string;
}

export interface UseSwapAllowanceReturn {
	// State
	isTokenAllowed: boolean;
	isApproveLoading: boolean;
	isApproveSuccess: boolean;
	isApproveError: boolean;
	approveErrorMsg: string;
	tokenAproveStarted: boolean;

	// Actions
	checkTokenAllowance: () => Promise<boolean>;
	approveToken: () => Promise<boolean>;
	resetPermitState: () => void;
}

export interface UseSwapTransactionParams {
	fromToken: Token | null;
	toToken: Token | null;
	exchangeAmount: string;
	receivedAmount: string;
	slippage: string;
	onTransactionComplete?: () => void;
}

export interface SwapTransactionResult {
	success: boolean;
	txHash?: string;
	error?: string;
}

export interface UseSwapTransactionReturn {
	// State
	isLoading: boolean;
	checkSuccess: boolean;
	transactionSuccess: boolean;
	successPop: boolean;
	txHash: string;
	isPending: boolean;
	timeLeft: number;
	// Completed transaction amounts and tokens (stored before reset)
	completedExchangeAmount: string;
	completedReceivedAmount: string;
	completedFromToken: Token | null;
	completedToToken: Token | null;

	// Actions
	executeSwap: () => Promise<SwapTransactionResult>;
	validateSwap: () => boolean;
	resetSwapState: () => void;
	setSuccessPop: (value: boolean) => void;
}

export interface UseSwapReturn {
	// Core state
	fromToken: Token | null;
	toToken: Token | null;
	setFromToken: (token: Token | null) => void;
	setToToken: (token: Token | null) => void;
	exchangeAmount: string;
	receivedAmount: string;
	conversion: SwapConversion | null;
	estimatedGas: string;
	slippage: string;
	setSlippage: (slippage: string) => void;
	isLoading: boolean;
	isFetching: boolean;
	isApproveLoading: boolean;
	isApproveSuccess: boolean;
	isApproveError: boolean;
	approveErrorMsg: string;
	isTokenAllowed: boolean;
	isTokenPermit: boolean;
	setIsTokenPermit: (value: boolean) => void;
	checkSuccess: boolean;
	transactionSuccess: boolean;
	successPop: boolean;
	txHash: string;
	isPending: boolean;
	timeLeft: number;
	// Completed transaction amounts and tokens (stored before reset)
	completedExchangeAmount: string;
	completedReceivedAmount: string;
	completedFromToken: Token | null;
	completedToToken: Token | null;
	showGasFee: boolean;
	isLowBalance: boolean;
	gasReservationAmount: number;
	isNativeCurrency: () => boolean;
	tokenAproveStarted: boolean;

	// Actions
	switchTokens: () => void;
	resetTokens: () => void;
	resetAmounts: () => void;
	handleExchangeAmountChange: (
		value: string | React.ChangeEvent<HTMLInputElement>,
		decimal?: number
	) => void;
	handleReceivedAmountChange: (
		value: string | React.ChangeEvent<HTMLInputElement>,
		decimal?: number
	) => void;
	setMaxAmount: () => void;
	executeSwap: () => Promise<SwapTransactionResult>;
	approveToken: () => Promise<boolean>;
	resetSwapState: () => void;
	resetPermitState: () => void;
	getExchangeRate: () => number;
	toolTipMessage: string;
	showToolTip: boolean;

	// Additional methods
	validateSwap: () => boolean;
	resetPage: () => void;
	fetchTokens: () => Promise<void>;
	tokens: Token[];
	setSuccessPop: (value: boolean) => void;
	minRequiredAmount: string;
	setMinRequiredAmount: (amount: string) => void;
	fetchQuote: () => Promise<void>;
	checkTokenAllowance: () => Promise<boolean>;
	getGasReservationAmount: () => Promise<number>;

	// Token price data
	fromTokenUsdPrice: string;
	toTokenUsdPrice: string;
	isFetchingPrices: boolean;
	fetchTokenPrices: () => Promise<void>;

	// UI Helpers
	getSwapButtonText: () => string;
}

// --- useSwapTokenPrices Types ---
export interface UseSwapTokenPricesParams {
	fromToken: Token | null;
	toToken: Token | null;
}

export interface UseSwapTokenPricesReturn {
	// State
	fromTokenUsdPrice: string;
	toTokenUsdPrice: string;
	isFetchingPrices: boolean;

	// Actions
	fetchTokenPrices: () => Promise<void>;
}
