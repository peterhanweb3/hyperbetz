import { parseUnits as ethersParseUnits } from "ethers";
import abiErc20 from "@/abi/erc20.json";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

import {
	ApproveTokenParams,
	ApproveTokenResult,
	CheckAllowanceParams,
	CheckAllowanceResult,
	ExecuteSwapParams,
	ExecuteSwapResult,
	SwapTransactionData,
	ExecuteTokenTransferParams,
	ExecuteTokenTransferResult,
	RecordDepositParams,
	RecordDepositResult,
	RecordSwapDepositParams,
	RecordSwapDepositResult,
	RecordManualDepositParams,
	RecordManualDepositResult,
	GetTokenConversionParams,
	GetTokenConversionResult,
	CachedConversionData,
	GetDestinationWalletResult,
	GetDestinationSwapInfoResult,
	GetTokenPriceParams,
	GetTokenPriceResult,
	AllowanceData,
	WalletAgentData,
	SwapInfo,
	TokenPriceData,
	DepositData,
	SwapDepositData,
	ConversionData,
	CacheKey,
	CheckTransactionStatusRequest,
	CheckTransactionStatusResponse,
	CheckTransactionStatusData,
	// ...existing imports...
	GetWithdrawWalletRequest,
	GetWithdrawWalletResponse,
	WithdrawToken,
	RiskWithdrawRequest,
	RiskWithdrawResponse,
	PreWithdrawRequest,
	PreWithdrawResponse,
	PreWithdrawData,
	SearchTokenRequest,
	SearchTokenResponse,
	WalletAgentApiRequest,
	PrimaryWalletWithClient,
	GetTipWalletResult,
	TipWalletResponse,
} from "@/types/walletProvider/transaction-service.types";
import { parseAbi, parseUnits } from "viem";
import { toast } from "sonner";

interface ApiResponse<T> {
	error: boolean;
	message: string;
	data: T;
}

/**
 * TransactionService.ts
 * Provides centralized transaction handling capabilities across the application.
 * Handles blockchain interactions, API calls, and transaction state management.
 */
class TransactionService {
	private static instance: TransactionService;
	private baseUrl: string;
	private apiKey: string;
	private jwtType: string;
	private primaryWallet: PrimaryWalletWithClient | null = null; // Store the primaryWallet for authentication-aware transactions

	private constructor() {
		this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;
		this.apiKey = process.env.NEXT_PUBLIC_API_KEY as string;
		this.jwtType = process.env.NEXT_PUBLIC_JWT_TYPE as string;
	}

	static getInstance(): TransactionService {
		if (!TransactionService.instance) {
			TransactionService.instance = new TransactionService();
		}
		return TransactionService.instance;
	}

	/**
	 * Set the primary wallet for authentication-aware transactions
	 * This should be called from hooks that have access to useDynamicContext
	 */
	setPrimaryWallet(primaryWallet: PrimaryWalletWithClient | null = null) {
		this.primaryWallet = primaryWallet;
	}

	private async makeRequest<T>(
		endpoint: string,
		method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
		data?: unknown,
		token?: string,
		additionalConfigs?: RequestInit
	): Promise<ApiResponse<T>> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		const config: RequestInit = {
			...additionalConfigs,
			method,
			headers,
		};

		if (data && (method === "POST" || method === "PUT")) {
			config.body = JSON.stringify(data);
		}

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				throw new Error(
					`HTTP error!\n status: ${response.status} \n message: ${response.text} statusText: ${response.statusText}`
				);
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("API request failed:", error);
			throw error;
		}
	}

	// --- BLOCKCHAIN TRANSACTION METHODS ---

	/**
	 * Handle token approval for spending by contract
	 */
	async approveToken(
		params: ApproveTokenParams
	): Promise<ApproveTokenResult> {
		const {
			tokenAddress,
			spenderAddress,
			// username,
			unlimited = true,
		} = params;

		try {
			const maxAmount = unlimited
				? "115792089237316195423570985008687907853269984665640564039457584007913129639935"
				: ethersParseUnits("1000000", 18);

			const walletClient = await this.primaryWallet?.getWalletClient();

			const hash = await walletClient?.writeContract({
				address: tokenAddress as `0x${string}`,
				abi: abiErc20,
				functionName: "approve",
				args: [spenderAddress, maxAmount],
			});

			return {
				success: true,
				txHash: hash || "tempHash",
				error: null,
			};
		} catch (error) {
			console.error("Token approval failed:", error);
			return {
				success: false,
				txHash: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Check token allowance for a specific spender
	 */
	async checkAllowance(
		params: CheckAllowanceParams
	): Promise<CheckAllowanceResult> {
		const {
			tokenAddress,
			ownerAddress,
			spenderAddress,
			network,
			username,
		} = params;

		try {
			const data = {
				api_key: this.apiKey,
				network,
				fromToken: tokenAddress,
				walletAddress: ownerAddress,
				username: username || localStorage.getItem("username"),
				spender: spenderAddress,
			};
			const response = await this.makeRequest<AllowanceData>(
				"/apiSwap/getAllowance",
				"POST",
				data
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to check allowance"
				);
			}

			const allowanceAmount = response.data.allowance;
			return {
				hasAllowance: Number(allowanceAmount) > 0,
				allowanceAmount,
			};
		} catch (error) {
			console.error("Allowance check failed:", error);
			return {
				hasAllowance: false,
				allowanceAmount: "0",
			};
		}
	}

	/**
	 * Execute a token swap
	 */
	async executeSwap(params: ExecuteSwapParams): Promise<ExecuteSwapResult> {
		const {
			network,
			fromToken,
			toToken,
			amount,
			walletAddress,
			receiver,
			slippage = "Auto",
			username,
			primaryWallet, // Use the primary wallet for authentication
		} = params;

		// Use passed primaryWallet parameter, fall back to stored singleton
		const wallet = primaryWallet || this.primaryWallet;

		if (!wallet) {
			throw new Error("Primary wallet is not set");
		}

		try {
			const swapData = {
				api_key: this.apiKey,
				network,
				fromToken,
				toToken,
				amount,
				walletAddress,
				slippage,
				username,
				...(receiver && { receiver }),
			};

			const swapResponse = await this.makeRequest<SwapTransactionData>(
				"/apiSwap/swap",
				"POST",
				swapData
			);

			if (swapResponse.error) {
				throw new Error(
					swapResponse.message || "Swap preparation failed"
				);
			}

			// Check if the response contains the necessary transaction data
			const txDetails = swapResponse.data;
			if ("error" in txDetails) {
				throw new Error(
					`Transaction Failed: ${txDetails.description?.replace(/\b\w/g, (char) => char.toUpperCase())}`
				);
			}

			//  Check if walletClient is available before sending transaction
			const walletClient = await wallet.getWalletClient();
			if (!walletClient) {
				throw new Error(
					"Failed to get wallet client from connected wallet"
				);
			}

			// Execute transaction only if txDetails contains the required fields
			const hash = await walletClient.sendTransaction({
				to: txDetails.to as `0x${string}`,
				data: txDetails.data as `0x${string}`,
				value: BigInt(txDetails.value || "0"),
				account: walletAddress as `0x${string}`,
			});

			return {
				success: true,
				txHash: hash,
				error: null,
			};
		} catch (error) {
			return {
				success: false,
				txHash: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Execute a direct token transfer (ERC-20)
	 */
	async executeTokenTransfer(
		params: ExecuteTokenTransferParams
	): Promise<ExecuteTokenTransferResult> {
		const {
			tokenAddress,
			recipientAddress,
			amount,
			decimals = 6,
			isNative = false,
		} = params;
		try {
			const walletClient = await this.primaryWallet?.getWalletClient();

			if (!isNative) {
				const hash = await walletClient?.writeContract({
					address: tokenAddress as `0x${string}`,
					abi: parseAbi([
						"function transfer(address to, uint256 amount) returns (bool)",
					]),
					functionName: "transfer",
					args: [
						recipientAddress as `0x${string}`,
						parseUnits(amount.toString(), decimals),
					],
				});

				return {
					success: true,
					txHash: hash || "tempHash",
					error: null,
				};
			}
			const hash = await walletClient?.sendTransaction({
				to: recipientAddress as `0x${string}`,
				value: parseUnits(amount.toString(), 18), // amount in ETH/MATIC etc.
			});
			return {
				success: true,
				txHash: hash || "tempHash",
				error: null,
			};
		} catch (error) {
			console.error("Token transfer failed:", error);
			return {
				success: false,
				txHash: null,
				error: error as Error,
			};
		}
	}

	// --- API METHODS ---

	/**
	 * Record deposit in the backend system
	 */
	async recordDeposit(
		params: RecordDepositParams,
		jwtToken?: string
	): Promise<RecordDepositResult> {
		const {
			username,
			toAddress,
			txHash,
			network,
			amount,
			tokenAddress,
			walletAddress,
			token_type,
			country = "",
			city = "",
			ipAddress = "",
		} = params;

		try {
			const data = {
				api_key: this.apiKey,
				username,
				to_address: toAddress,
				hash: txHash,
				network,
				amount,
				tokenAddress,
				walletAddress,
				country,
				city,
				ip_address: ipAddress,
				jwt_type: this.jwtType,
				token_type,
			};

			const response = await this.makeRequest<DepositData>(
				"/api/depositWallet",
				"POST",
				data,
				jwtToken || getAuthToken()
			);

			if (response.error) {
				throw new Error(response.message || "Failed to record deposit");
			}

			return {
				success: true,
				data: response.data,
				error: null,
			};
		} catch (error) {
			console.error("Recording deposit failed:", error);
			return {
				success: false,
				data: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Record swap deposit in the backend system
	 */
	async recordSwapDeposit(
		params: RecordSwapDepositParams,
		jwtToken?: string
	): Promise<RecordSwapDepositResult> {
		const { username, txHash, network, amount } = params;

		try {
			const data = {
				api_key: this.apiKey,
				username,
				hash: txHash,
				network,
				amount,
				jwt_type: this.jwtType,
			};

			const response = await this.makeRequest<SwapDepositData>(
				"/api/depositWalletSwap",
				"POST",
				data,
				jwtToken || getAuthToken()
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to record swap deposit"
				);
			}

			return {
				success: true,
				data: response.data,
				error: null,
			};
		} catch (error) {
			console.error("Recording swap deposit failed:", error);
			return {
				success: false,
				data: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Record manual deposit in the backend system when autodepo is OFF
	 */
	async recordManualDeposit(
		// eslint-disable-next-line
		_params: RecordManualDepositParams,
		// eslint-disable-next-line
		_jwtToken?: string
	): Promise<RecordManualDepositResult> {
		// Currently commented out in original implementation
		try {
			return {
				success: true,
				data: null,
				error: null,
			};
		} catch (error) {
			console.error("Recording manual deposit failed:", error);
			return {
				success: false,
				data: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Get token conversion rate with caching
	 */
	async getTokenConversion(
		params: GetTokenConversionParams
	): Promise<GetTokenConversionResult> {
		const { network, fromToken, toToken, amount, username } = params;

		if (!amount) {
			return {
				success: false,
				conversion: null,
				error: new Error("Amount is required for conversion"),
			};
		}

		try {
			const cacheKey = this.generateCacheKey(
				network.toString(),
				fromToken,
				toToken
			);
			const cachedConversion = this.getCachedConversion(cacheKey);

			if (cachedConversion) {
				const rate =
					cachedConversion.toAmount / cachedConversion.fromAmount;
				const calculatedToAmount = amount * rate;

				return {
					success: true,
					conversion: {
						fromToken,
						toToken,
						fromAmount: amount,
						toAmount: calculatedToAmount,
					},
					error: null,
					fromCache: true,
				};
			}

			const data = {
				api_key: this.apiKey,
				network,
				fromToken,
				toToken,
				amount,
				username,
			};

			const response = await this.makeRequest<ConversionData>(
				"/apiSwap/getConvert",
				"POST",
				data
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to get token conversion"
				);
			}

			const baseConversion = response.data;
			this.setCachedConversion(cacheKey, baseConversion);

			const rate = baseConversion.toAmount / baseConversion.fromAmount;
			const calculatedToAmount = amount * rate;

			return {
				success: true,
				conversion: {
					fromToken,
					toToken,
					fromAmount: amount,
					toAmount: calculatedToAmount,
				},
				error: null,
				fromCache: false,
			};
		} catch (error) {
			if (
				error &&
				(error as GetTokenConversionResult["error"] as Error).message
					.toLowerCase()
					.includes("not supported")
			) {
				toast.error(
					(error as GetTokenConversionResult["error"] as Error)
						.message as string
				);
			}
			console.error("Getting token conversion failed:", error);
			return {
				success: false,
				conversion: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Fetch destination wallet for deposit
	 */
	async getDestinationWallet(
		networkId: number,
		jwtToken?: string
	): Promise<GetDestinationWalletResult> {
		try {
			const data = {
				api_key: this.apiKey,
				network: networkId,
				jwt_type: this.jwtType,
			};

			const response = await this.makeRequest<WalletAgentData>(
				"/api/getWalletAgent",
				"POST",
				data,
				jwtToken || getAuthToken()
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to get destination wallet"
				);
			}

			return {
				success: true,
				walletAddress: response.data.wallet_address,
				error: null,
			};
		} catch (error) {
			console.error("Getting destination wallet failed:", error);
			return {
				success: false,
				walletAddress: null,
				error: error as Error,
			};
		}
	}

	async getTipWallet(
		networkId: number | string,
		jwtToken?: string
	): Promise<GetTipWalletResult> {
		try {
			const data = {
				api_key: this.apiKey,
				network: networkId,
				jwt_type: this.jwtType,
			};

			const response = (await this.makeRequest<TipWalletResponse>(
				"/api/getTipWallet",
				"POST",
				data,
				jwtToken || getAuthToken()
			)) as unknown as TipWalletResponse;

			if (response.error) {
				throw new Error(response.message || "Failed to get tip wallet");
			}

			const tipWallet =
				response.tip_wallet ?? response.data?.tip_wallet ?? null;
			const tipMinimum =
				response.tip_min ?? response.data?.tip_min ?? null;

			return {
				success: true,
				tipWallet,
				tipMinimum,
				error: null,
			};
		} catch (error) {
			console.error("Getting tip wallet failed:", error);
			return {
				success: false,
				tipWallet: null,
				tipMinimum: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Fetch wallet agent data
	 * @param network The blockchain network to use
	 * @param jwtToken Optional JWT token for authentication
	 * @returns The wallet agent data or an error
	 */
	async getWalletAgentData(
		network: string,
		jwtToken?: string
	): Promise<ApiResponse<WalletAgentData>> {
		try {
			const data: WalletAgentApiRequest = {
				api_key: this.apiKey,
				network,
				jwt_type: this.jwtType,
			};

			const response = await this.makeRequest<WalletAgentData>(
				"/api/getWalletAgent",
				"POST",
				data,
				jwtToken
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to get wallet agent"
				);
			}

			return response;
		} catch (error) {
			console.error("Getting wallet agent data failed:", error);
			return {
				data: {
					setting: {
						deposit_min: "",
						withdraw: "",
						tip_min: "",
						fee: "",
					},
					wallet_address: "",
				},
				error: true,
				message: (error as Error).message || "Unknown error",
			};
		}
	}

	/**
	 * Get destination swap information
	 */
	async getDestinationSwapInfo(
		networkId: string,
		username: string,
		jwtToken?: string
	): Promise<GetDestinationSwapInfoResult> {
		try {
			const data = {
				api_key: this.apiKey,
				network: networkId || localStorage.getItem("network"),
				username,
			};

			const response = await this.makeRequest<SwapInfo>(
				"/apiSwap/getDstSwap",
				"POST",
				data,
				jwtToken
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to get destination swap info"
				);
			}

			return {
				success: true,
				swapInfo: response.data,
				error: null,
			};
		} catch (error) {
			console.error("Getting destination swap info failed:", error);
			return {
				success: false,
				swapInfo: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Get token price information
	 */
	async getTokenPrice(
		params: GetTokenPriceParams,
		jwtToken?: string
	): Promise<GetTokenPriceResult> {
		const { network, fromToken, toToken, username } = params;

		try {
			const data = {
				api_key: this.apiKey,
				network,
				fromToken,
				toToken,
				username,
			};

			const response = await this.makeRequest<TokenPriceData>(
				"/apiSwap/tokenPrice",
				"POST",
				data,
				jwtToken
			);

			if (response.error) {
				throw new Error(
					response.message || "Failed to get token price"
				);
			}

			return {
				success: true,
				priceData: response.data,
				error: null,
			};
		} catch (error) {
			console.error("Getting token price failed:", error);
			return {
				success: false,
				priceData: null,
				error: error as Error,
			};
		}
	}

	/**
	 * Check transaction status via API
	 */
	async checkTransactionStatus(
		params: CheckTransactionStatusRequest,
		jwtToken?: string
	): Promise<CheckTransactionStatusResponse> {
		try {
			const data = {
				...params,
				api_key: this.apiKey,
			};

			const response = await this.makeRequest<CheckTransactionStatusData>(
				"/dynamic/checkTransactionStatus",
				"POST",
				data,
				jwtToken
			);

			return response as unknown as CheckTransactionStatusResponse;
		} catch (error) {
			console.error("Checking transaction status failed:", error);
			return {
				error: true,
				transaction_status: "FAILED",
			};
		}
	}

	// --- PRIVATE CACHE MANAGEMENT METHODS ---

	private getCachedConversion(
		cacheKey: CacheKey
	): CachedConversionData | null {
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const parsedCache = JSON.parse(cached);
				if (!this.isCacheExpired(parsedCache)) {
					return parsedCache;
				} else {
					localStorage.removeItem(cacheKey);
				}
			}
		} catch (error) {
			console.warn("Error reading cached conversion:", error);
		}
		return null;
	}

	private setCachedConversion(
		cacheKey: CacheKey,
		conversionData: ConversionData
	): void {
		try {
			const cacheData: CachedConversionData = {
				...conversionData,
				timestamp: Date.now(),
			};
			localStorage.setItem(cacheKey, JSON.stringify(cacheData));
		} catch (error) {
			console.warn("Error saving conversion to cache:", error);
		}
	}

	private generateCacheKey(
		network: string,
		fromToken: string,
		toToken: string
	): CacheKey {
		return `token_conversion_${network}_${fromToken}_${toToken}`;
	}

	private isCacheExpired(
		cachedData: CachedConversionData,
		expirationTimeMs = 2 * 60 * 1000
	): boolean {
		if (!cachedData.timestamp) return true;
		return Date.now() - cachedData.timestamp > expirationTimeMs;
	}

	// --- PUBLIC CACHE MANAGEMENT METHODS ---

	/**
	 * Clear all cached conversion rates or specific token pair
	 */
	clearConversionCache(cacheKey: CacheKey | null = null): void {
		try {
			if (cacheKey) {
				localStorage.removeItem(cacheKey);
			} else {
				const keysToRemove = [];
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i);
					if (key && key.startsWith("token_conversion_")) {
						keysToRemove.push(key);
					}
				}
				keysToRemove.forEach((key) => localStorage.removeItem(key));
			}
		} catch (error) {
			console.warn("Error clearing conversion cache:", error);
		}
	}

	/**
	 * Fetch available withdrawal tokens from API
	 */
	/**
	 * Fetch available withdrawal tokens from API
	 */
	async fetchWithdrawTokens(
		params: Omit<GetWithdrawWalletRequest, "api_key" | "jwt_type">,
		jwtToken?: string
	): Promise<GetWithdrawWalletResponse> {
		const response = await this.makeRequest<WithdrawToken[]>(
			"/api/getWithdrawWallet",
			"POST",
			{ ...params, api_key: this.apiKey, jwt_type: this.jwtType },
			jwtToken
		);
		return {
			error: response.error,
			data: response.data,
		};
	}

	/**
	 * Refetch account balance after successful operations
	 */
	async refetchBalance(
		params: {
			api_key: string;
			jwt_type: string;
			network: number | string;
		},
		jwtToken?: string
	): // eslint-disable-next-line
	Promise<ApiResponse<any>> {
		// eslint-disable-next-line
		return this.makeRequest<any>(
			"/api/fetchInfo",
			"POST",
			params,
			jwtToken
		);
	}

	/**
	 * Execute manual withdrawal when autowd is OFF
	 */
	async withdrawWalletManual(
		params: {
			// api_key: string;
			username: string;
			network: number | string;
			amount: string | number;
			token_type: string;
			token_address: string;
			dst_wallet: string;
			country?: string;
			city?: string;
			ip_address?: string;
		},
		jwtToken?: string
	): Promise<{ error: boolean; message?: string }> {
		const response = await this.makeRequest<{
			error: boolean;
			message?: string;
		}>(
			"/api/withdrawWalletManual",
			"POST",
			{ ...params, api_key: this.apiKey },
			jwtToken
		);
		return response;
	}

	/**
	 * Perform risk check before proceeding with withdrawal
	 */
	async performRiskCheck(
		params: Omit<RiskWithdrawRequest, "api_key" | "jwt_type">,
		jwtToken?: string
	): Promise<RiskWithdrawResponse> {
		const data = {
			...params,
			api_key: this.apiKey,
			jwt_type: this.jwtType,
		};
		const response = await this.makeRequest<RiskWithdrawResponse>(
			"/api/riskWithdraw",
			"POST",
			data,
			jwtToken
		);
		return response as unknown as RiskWithdrawResponse;
	}

	/**
	 * Fetch pre-withdrawal data from the API
	 */
	async fetchPreWithdrawData(
		params: Omit<PreWithdrawRequest, "api_key" | "jwt_type">,
		jwtToken?: string
	): Promise<PreWithdrawResponse> {
		const response = await this.makeRequest<PreWithdrawData>(
			"/api/preWithdraw/",
			"POST",
			{ ...params, api_key: this.apiKey, jwt_type: this.jwtType },
			jwtToken
		);
		return {
			error: response.error,
			message: response.message,
			data: response.data,
		};
	}

	/**
	 * Search for tokens using the apiSwap/searchToken endpoint
	 */
	public async searchToken(
		params: Omit<SearchTokenRequest, "api_key" | "jwt_type">,
		jwtToken?: string
	): Promise<SearchTokenResponse> {
		const response = await this.makeRequest<SearchTokenResponse["data"]>(
			"/apiSwap/searchToken",
			"POST",
			{ ...params, api_key: this.apiKey, jwt_type: this.jwtType },
			jwtToken
		);
		return {
			error: response.error,
			data: response.data,
		};
	}
}

export default TransactionService;
