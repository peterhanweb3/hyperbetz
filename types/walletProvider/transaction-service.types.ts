/**
 * TypeScript type definitions for TransactionService.js
 * Contains all request/response types for blockchain transaction operations
 */

import { Wallet } from "ethers";
import { WalletClient, Transport, Chain, Account } from "viem";

export type PrimaryWalletWithClient = Wallet & {
	getWalletClient(
		chainId?: string
	): Promise<WalletClient<Transport, Chain, Account>>;
};

// --- Base Response Structure ---
interface ApiSuccessResponse<T> {
	error: false;
	message: string;
	data: T;
}

interface ApiErrorResponse {
	error: true;
	message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// --- Common Types ---
export interface TransactionResult {
	success: boolean;
	txHash: string | null;
	error: Error | null;
}
// eslint-disable-next-line
export interface ServiceResult<T = any> {
	success: boolean;
	data: T | null;
	error: Error | null;
}

// --- 1. Token Approval ---
export interface ApproveTokenParams {
	tokenAddress: string;
	spenderAddress: string;
	username?: string;
	unlimited?: boolean;
}

export type ApproveTokenResult = TransactionResult;

// --- 2. Check Allowance ---
export interface CheckAllowanceParams {
	tokenAddress: string;
	ownerAddress: string;
	spenderAddress: string;
	network: string;
	username: string;
}

export interface AllowanceData {
	unit: string;
	allowance: string;
	contractAddress: string;
}

export interface CheckAllowanceResult {
	hasAllowance: boolean;
	allowanceAmount: string;
}

export interface CheckAllowanceRequest {
	api_key: string;
	network: string;
	fromToken: string;
	walletAddress: string;
	spender?: string;
	username: string;
}

export type CheckAllowanceResponse = ApiResponse<AllowanceData>;

// --- 3. Execute Swap ---
export interface ExecuteSwapParams {
	network: string;
	fromToken: string;
	toToken: string;
	amount: string;
	walletAddress: string;
	receiver?: string;
	slippage?: string;
	username: string;
	primaryWallet: PrimaryWalletWithClient;
}

export interface SwapTransactionData {
	from: string;
	to: string;
	data: string;
	value: string;
	gas: number;
	gasPrice: string;
}

export interface SwapApiRequest {
	api_key: string;
	network: string;
	fromToken: string;
	toToken: string;
	amount: string;
	walletAddress: string;
	receiver?: string;
	slippage: string;
	username: string;
}

export type SwapApiResponse = ApiResponse<SwapTransactionData>;
export type ExecuteSwapResult = TransactionResult;

// --- 4. Execute Token Transfer ---
export interface ExecuteTokenTransferParams {
	tokenAddress: string;
	recipientAddress: string;
	amount: string | number;
	decimals?: number;
}

export type ExecuteTokenTransferResult = TransactionResult;

// --- 5. Record Deposit ---
export interface RecordDepositParams {
	username: string;
	toAddress: string;
	txHash: string;
	network: string;
	amount: string | number;
	tokenAddress: string;
	walletAddress: string;
	token_type: string;
	country?: string;
	city?: string;
	ipAddress?: string;
}

export interface DepositApiRequest {
	api_key: string;
	username: string;
	to_address: string;
	hash: string;
	network: string;
	amount: string | number;
	tokenAddress: string;
	walletAddress: string;
	country: string;
	city: string;
	ip_address: string;
	jwt_type: string;
	token_type: string;
}

export interface DepositData {
	// Define the expected structure of deposit response data
	id?: string;
	status?: string;
	timestamp?: string;
	[key: string]: unknown;
}

export type RecordDepositResponse = ApiResponse<DepositData>;
export type RecordDepositResult = ServiceResult<DepositData>;

// --- 6. Record Swap Deposit ---
export interface RecordSwapDepositParams {
	username: string;
	txHash: string;
	network: string;
	amount: string | number;
}

export interface SwapDepositApiRequest {
	api_key: string;
	username: string;
	hash: string;
	network: string;
	amount: string | number;
	jwt_type: string;
}

// eslint-disable-next-line
export interface SwapDepositData {
	// No data returned, only success message
}

export type RecordSwapDepositResponse = ApiResponse<SwapDepositData>;
export type RecordSwapDepositResult = ServiceResult<SwapDepositData>;

// --- 7. Record Manual Deposit ---
export interface RecordManualDepositParams {
	username: string;
	txHash: string;
	network: string;
	amount: string | number;
	tokenAddress: string;
	toAddress: string;
	tokenType: string;
	dstWallet: string;
	country?: string;
	city?: string;
	ipAddress?: string;
}

export interface ManualDepositApiRequest {
	api_key: string;
	username: string;
	hash: string;
	network: string;
	amount: string | number;
	token_address: string;
	to_address: string;
	token_type: string;
	jwt_type: string;
	dst_wallet: string;
	country: string;
	city: string;
	ip_address: string;
}

export interface ManualDepositData {
	// Define the expected structure of manual deposit response data
	id?: string;
	status?: string;
	timestamp?: string;
	[key: string]: unknown;
}

export type RecordManualDepositResponse = ApiResponse<ManualDepositData>;
export type RecordManualDepositResult = ServiceResult<ManualDepositData>;

// --- 8. Token Conversion ---
export interface GetTokenConversionParams {
	network: string | number;
	fromToken: string;
	toToken: string;
	amount: number;
	username: string;
}

export interface ConversionApiRequest {
	api_key: string;
	network: string;
	fromToken: string;
	toToken: string;
	amount: number;
	username: string;
}

export interface ConversionData {
	fromToken: string;
	toToken: string;
	fromAmount: number;
	toAmount: number;
	estimateGas?: string | number; // Optional gas estimation from API
}

export interface CachedConversionData extends ConversionData {
	timestamp: number;
}

export interface GetTokenConversionResult {
	success: boolean;
	conversion: ConversionData | null;
	error: Error | null;
	fromCache?: boolean;
}

export type GetTokenConversionResponse = ApiResponse<ConversionData>;

// --- 9. Get Destination Wallet ---
export interface GetDestinationWalletParams {
	network: string;
}

export interface WalletAgentApiRequest {
	api_key: string;
	network: string;
	jwt_type: string;
}

export interface WalletAgentData {
	setting: {
		deposit_min: string;
		withdraw: string;
		tip_min: string;
		fee: string;
	};
	wallet_address: string;
}

export interface GetDestinationWalletResult {
	success: boolean;
	walletAddress: string | null;
	error: Error | null;
}

export type GetDestinationWalletResponse = ApiResponse<WalletAgentData>;

export interface TipWalletResponse {
	error: boolean;
	message?: string;
	tip_wallet?: string;
	tip_min?: string;
	data?: {
		tip_wallet?: string;
		tip_min?: string;
	};
}

export interface GetTipWalletResult {
	success: boolean;
	tipWallet: string | null;
	tipMinimum: string | null;
	error: Error | null;
}

// --- 10. Get Destination Swap Info ---
export interface GetDestinationSwapInfoParams {
	network: string;
	username: string;
}

export interface DstSwapApiRequest {
	api_key: string;
	network: string;
	username: string;
}

export interface SwapInfo {
	token_address: string;
	token_name: string;
	token_symbol: string;
	wallet_address: string;
}

export interface GetDestinationSwapInfoResult {
	success: boolean;
	swapInfo: SwapInfo | null;
	error: Error | null;
}

export type GetDestinationSwapInfoResponse = ApiResponse<SwapInfo>;

// --- 11. Get Token Price ---
export interface GetTokenPriceParams {
	network: string;
	fromToken: string;
	toToken: string;
	username: string;
}

export interface TokenPriceApiRequest {
	api_key: string;
	network: string;
	fromToken: string;
	toToken: string;
	username: string;
}

export interface TokenPriceData {
	currency: string;
	token_1: string;
	token_2: string;
}

export interface GetTokenPriceResult {
	success: boolean;
	priceData: TokenPriceData | null;
	error: Error | null;
}

export type GetTokenPriceResponse = ApiResponse<TokenPriceData>;

// --- Cache Management Types ---
export interface CacheKeyGenerator {
	network: string;
	fromToken: string;
	toToken: string;
}

export type CacheKey = string;
export interface CheckTransactionStatusRequest {
	transaction_type: string;
	hash: string;
	api_key?: string;
	username: string;
}
export interface CheckTransactionStatusData {
	transaction_status: "CONFIRMED" | "PENDING" | "REJECTED" | "FAILED";
	hash: string;
	amount?: string;
	currency?: string;
	details?: Record<string, unknown>;
}

export interface CheckTransactionStatusResponse {
	error: boolean;
	transaction_status: "CONFIRMED" | "PENDING" | "REJECTED" | "FAILED";
}

// --- Utility Types ---
// --- 12. Withdraw Wallet ---
export interface GetWithdrawWalletRequest {
	api_key: string;
	jwt_type: string;
	network: number | string;
}

export interface WithdrawToken {
	token_symbol: string;
	token_name: string;
	token_address: string;
	token_icon: string;
	decimals: number;
}

export type GetWithdrawWalletResponse = {
	error: boolean;
	data: WithdrawToken[];
};

// --- 13. Risk Withdraw ---
export interface RiskWithdrawRequest {
	api_key: string;
	username: string;
	amount: string | number;
	jwt_type: string;
}

export interface RiskWithdrawResponse {
	error: boolean;
	status: string;
}

// --- 14. Pre Withdraw ---
export interface PreWithdrawRequest {
	api_key: string;
	jwt_type: string;
	username: string;
	to_address: string;
	token_address: string;
	amount: string | number;
	network: number | string;
	token_type: string;
}

export interface PreWithdrawData {
	signature: string;
	transactionId: string;
	amount: string;
	decimal: number;
	tokenAddress: string;
	contractAddress: string;
	toAddress: string;
	encodedData: string;
	expiry: number;
	message: string;
}

export interface PreWithdrawResponse {
	error: boolean;
	message: string;
	data: PreWithdrawData;
}

// --- 15. Search Token ---
export interface SearchTokenRequest {
	network: number;
	searchWord: string;
	api_key: string;
	username: string;
}

export interface SearchTokenTag {
	value: string;
	provider: string;
}

export interface SearchTokenResult {
	symbol: string;
	chainId: number;
	name: string;
	address: string;
	decimals: number;
	logoURI: string;
	eip2612: boolean;
	isFoT: boolean;
	providers: string[];
	rating: string;
	tags: SearchTokenTag[];
	marketCap: number;
}

export interface SearchTokenResponse {
	error: boolean;
	data: SearchTokenResult[];
}

export type NetworkName = string;
export type TokenAddress = string;
export type WalletAddress = string;
export type TransactionHash = string;
export type Username = string;
