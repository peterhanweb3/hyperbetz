/**
 * @file This file defines the ApiService class, a singleton for making API requests.
 * It centralizes all API communication, handling request creation, authorization,
 * and error management. It includes methods for various features like authentication,
 * games, swaps, transactions, affiliate programs, and user bonuses.
 * @licence QbitronLabs
 */

import {
	RegisterWalletRequestBody,
	UserInfoApiResponse,
} from "@/types/auth/auth.types";
import { GameListApiResponse } from "@/types/games/gameList.types";
import { ProviderIcon } from "@/types/games/providerIcon.types";
import {
	GetLobbyRequestBody,
	GetLobbyResponse,
} from "@/types/games/getLobby.types";
import {
	GetGameUrlApiResponse,
	GetGameUrlRequestBody,
} from "@/types/games/gameUrl.types";
import {
	GetBetHistoryRequestBody,
	GetBetHistoryResponse,
} from "@/types/games/betHistory.types";
import {
	GetTokenListRequest,
	GetTokenListResponse,
	GetConversionRequest,
	GetConversionResponse,
	GetAllowanceRequest,
	GetAllowanceResponse,
	SwapRequest,
	SwapResponse,
	GetGasFeeRequest,
	GetGasFeeResponse,
	TokenPriceRequest,
	TokenPriceResponse,
	GetDstSwapRequest,
	GetDstSwapResponse,
	DepositWalletSwapRequest,
	DepositWalletSwapResponse,
} from "@/types/blockchain/swap.types";
import {
	DepoWdHistoryRequest,
	DepoWdHistoryResponse,
} from "@/types/transactions/transaction.types";
import {
	CheckTransactionStatusRequest,
	CheckTransactionStatusResponse,
} from "@/types/walletProvider/transaction-service.types";
import {
	GetAffiliateBonusRequest,
	GetAffiliateBonusResponse,
	GetAffiliateBonusByDownlineRequest,
	GetAffiliateHistoryRequest,
	AffiliateBonusData,
	AffiliateRate,
	ClaimAffiliateBonusRequest,
	ClaimAffiliateBonusResponse,
	GetDownlineRequest,
	GetDownlineResponse,
} from "@/types/affiliate/affiliate.types";
import {
	ChatHistoryRequest,
	ChatHistoryApiResponse,
} from "@/types/features/chat-history.types";
import {
	ClaimMemberBonusRequest,
	ClaimMemberBonusResponse,
	GetBonusRateResponse,
	GetMemberBonusDetailRequest,
	GetMemberBonusDetailResponse,
	GetMemberBonusRequest,
	GetMemberBonusResponse,
	GetMemberUnclaimedBonusRequest,
	GetMemberUnclaimedBonusResponse,
} from "@/types/bonus/bonus.types";

// Additional types for transaction status check

interface ApiResponse<T> {
	error: boolean;
	message: string;
	data: T;
}

class ApiService {
	private static instance: ApiService;
	private baseUrl: string;
	private apiKey: string;
	private networkId: number;
	private jwtType: string;
	private password: string;
	private chatHistoryApiKey: string;
	private wsKey: string;

	private constructor() {
		this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;
		this.apiKey = process.env.NEXT_PUBLIC_API_KEY as string;
		this.networkId = process.env
			.NEXT_PUBLIC_NETWORK_ID as unknown as number;
		this.jwtType = process.env.NEXT_PUBLIC_JWT_TYPE as string;
		this.password = process.env.NEXT_PUBLIC_GAME_URL_API_PASSWORD as string;
		this.chatHistoryApiKey = process.env.NEXT_PUBLIC_API_KEY as string;
		// this.wsKey = process.env.NEXT_PUBLIC_WS_KEY as string;
		this.wsKey = "global" as string;
	}

	static getInstance(): ApiService {
		if (!ApiService.instance) {
			ApiService.instance = new ApiService();
		}
		return ApiService.instance;
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
			throw error;
		}
	}

	// --- CREDENTIALS-RELATED API SERVICES ---
	async fetchUserInfo(
		jwtToken: string,
		chainId?: number
	): Promise<ApiResponse<UserInfoApiResponse>> {
		const data = {
			api_key: this.apiKey,
			network:
				chainId ||
				localStorage.getItem("app_chainId") ||
				this.networkId,
			jwt_type: this.jwtType,
		};

		return this.makeRequest<UserInfoApiResponse>(
			"/api/fetchInfo",
			"POST",
			data,
			jwtToken
		);
	}
	async checkNickName(
		nickname: string,
		jwtToken: string
	): Promise<ApiResponse<null>> {
		const data = { api_key: this.apiKey, nickname: nickname };
		return this.makeRequest<null>(
			"/api/checkNickname",
			"POST",
			data,
			jwtToken
		);
	}
	async registerWallet(
		body: RegisterWalletRequestBody,
		jwtToken: string
	): Promise<ApiResponse<null>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: this.jwtType };
		return this.makeRequest<null>(
			"/api/registerWalletV2",
			"POST",
			data,
			jwtToken
		);
	}

	// --- GAMES-RELATED API SERVICES ---
	async fetchGameList(
		jwtToken?: string
	): Promise<ApiResponse<GameListApiResponse>> {
		const data = { api_key: this.apiKey, jwt_type: this.jwtType };
		return this.makeRequest<GameListApiResponse>(
			"/api/getGameListLastLast",
			"POST",
			data,
			jwtToken,
			{ next: { revalidate: 600 } }
		);
	}
	async fetchProviderIcons(): Promise<ApiResponse<ProviderIcon[]>> {
		const data = { api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<ProviderIcon[]>(
			"/api/getProviderIcon/",
			"POST",
			data
		);
	}
	async getGameUrl(
		body: GetGameUrlRequestBody,
		jwtToken?: string
	): Promise<GetGameUrlApiResponse> {
		const data = { ...body, api_key: this.apiKey, jwt_type: this.jwtType };
		const response = await this.makeRequest<GetGameUrlApiResponse>(
			"/api/getGameUrl/",
			"POST",
			data,
			jwtToken
		);
		return response as unknown as GetGameUrlApiResponse;
	}
	async getLobby(
		request: GetLobbyRequestBody
	): Promise<ApiResponse<GetLobbyResponse>> {
		const data = {
			...request,
			api_key: this.apiKey,
			jwt_type: this.jwtType,
		};
		return this.makeRequest<GetLobbyResponse>(
			"/api/getLobby",
			"POST",
			data
		);
	}

	async getBetHistory(
		body: GetBetHistoryRequestBody,
		jwtToken?: string
	): Promise<GetBetHistoryResponse> {
		const data = {
			...body,
			api_key: this.apiKey,
			password: this.password,
			jwt_type: this.jwtType,
		};
		const response = this.makeRequest<GetBetHistoryResponse>(
			"/api/getBetHistory/",
			"POST",
			data,
			jwtToken
		);
		return response as unknown as GetBetHistoryResponse;
	}

	// --- SWAP-RELATED API SERVICES ---
	async getTokenList(
		body: GetTokenListRequest,
		jwtToken: string
	): Promise<ApiResponse<GetTokenListResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetTokenListResponse>(
			"/apiSwap/getTokenList",
			"POST",
			data,
			jwtToken
		);
	}
	async getConversion(
		body: GetConversionRequest,
		jwtToken: string
	): Promise<ApiResponse<GetConversionResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetConversionResponse>(
			"/apiSwap/getConversion",
			"POST",
			data,
			jwtToken
		);
	}
	async getAllowance(
		body: GetAllowanceRequest,
		jwtToken: string
	): Promise<ApiResponse<GetAllowanceResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetAllowanceResponse>(
			"/apiSwap/getAllowance",
			"POST",
			data,
			jwtToken
		);
	}
	async swap(
		body: SwapRequest,
		jwtToken: string
	): Promise<ApiResponse<SwapResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<SwapResponse>(
			"/apiSwap/swap",
			"POST",
			data,
			jwtToken
		);
	}
	async getGasFee(
		body: GetGasFeeRequest,
		jwtToken: string
	): Promise<ApiResponse<GetGasFeeResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetGasFeeResponse>(
			"/apiSwap/getGasFee",
			"POST",
			data,
			jwtToken
		);
	}
	async getTokenPrice(
		body: TokenPriceRequest,
		jwtToken: string
	): Promise<ApiResponse<TokenPriceResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<TokenPriceResponse>(
			"/apiSwap/tokenPrice",
			"POST",
			data,
			jwtToken
		);
	}
	async getDstSwap(
		body: GetDstSwapRequest,
		jwtToken: string
	): Promise<ApiResponse<GetDstSwapResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetDstSwapResponse>(
			"/apiSwap/getDstSwap",
			"POST",
			data,
			jwtToken
		);
	}
	async depositWalletSwap(
		body: DepositWalletSwapRequest,
		jwtToken: string
	): Promise<ApiResponse<DepositWalletSwapResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<DepositWalletSwapResponse>(
			"/apiSwap/depositWalletSwap",
			"POST",
			data,
			jwtToken
		);
	}
	async getDepoWdHistory(
		params: DepoWdHistoryRequest,
		jwtToken?: string
	): Promise<ApiResponse<DepoWdHistoryResponse>> {
		const data = {
			...params,
			api_key: this.apiKey,
			jwt_type: this.jwtType,
		};
		const result = await this.makeRequest<DepoWdHistoryResponse>(
			"/api/getDepoWdHistory/",
			"POST",
			data,
			jwtToken
		);
		return result;
	}

	/** AFFILIATE-RELATED API SERVICES */
	/**
	 * Get affiliate rate levels for a user or API key.
	 */
	async getAffiliateRate(): Promise<ApiResponse<AffiliateRate[]>> {
		const data = {
			api_key: this.apiKey,
			jwt_type: this.jwtType,
		};
		return this.makeRequest<AffiliateRate[]>(
			"/api/getAffiliateRate",
			"POST",
			data
		);
	}
	/**
	 * Get affiliate bonus for a user.
	 */
	async getAffiliateBonus(
		body: GetAffiliateBonusRequest,
		jwtToken?: string
	): Promise<ApiResponse<GetAffiliateBonusResponse>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: this.jwtType };
		return this.makeRequest<GetAffiliateBonusResponse>(
			"/api/getAffiliateBonus",
			"POST",
			data,
			jwtToken
		);
	}
	/**
	 * Get affiliate bonus by downline for a user.
	 */
	async getAffiliateBonusByDownline(
		body: GetAffiliateBonusByDownlineRequest,
		jwtToken?: string
	): Promise<ApiResponse<AffiliateBonusData>> {
		const data = { ...body, api_key: this.apiKey, jwt_type: this.jwtType };
		return this.makeRequest<AffiliateBonusData>(
			"/api/getAffiliateBonusByDownline",
			"POST",
			data,
			jwtToken
		);
	}
	/**
	 * Get affiliate history for a user.
	 */
	async getAffiliateHistory(
		body: GetAffiliateHistoryRequest,
		jwtToken?: string
	): Promise<ApiResponse<AffiliateBonusData>> {
		const data = { ...body };
		return this.makeRequest<AffiliateBonusData>(
			"/api/getAffiliateHistory",
			"POST",
			data,
			jwtToken
		);
	}

	/**
	 * Claim affiliate bonus for a user.
	 */
	async claimAffiliateBonus(
		body: ClaimAffiliateBonusRequest,
		jwtToken?: string
	): Promise<ClaimAffiliateBonusResponse> {
		const data = { ...body, api_key: this.apiKey, jwt_type: this.jwtType };
		const response = await this.makeRequest<ClaimAffiliateBonusResponse>(
			"/api/claimAffiliateBonus",
			"POST",
			data,
			jwtToken
		);

		// The API returns the response.data directly, this is must as the ClaimAffiliateBonusResponse type & ApiResponse api causes type mismatch from the actual api response
		return response.data as unknown as ClaimAffiliateBonusResponse;
	}

	/**
	 * Get downline list for an affiliate user.
	 */
	async getDownline(
		body: Omit<GetDownlineRequest, "api_key" | "jwt_type" | "password">,
		jwtToken?: string
	): Promise<GetDownlineResponse> {
		const data: GetDownlineRequest = {
			...body,
			api_key: this.apiKey,
			jwt_type: this.jwtType,
			password: this.password,
		};
		const response = await this.makeRequest<GetDownlineResponse>(
			"/api/getDownline",
			"POST",
			data,
			jwtToken
		);
		return response as unknown as GetDownlineResponse;
	}

	/** BONUS-RELATED API SERVICES */
	async getBonusRate(jwtToken?: string): Promise<GetBonusRateResponse> {
		const data = {
			api_key: this.apiKey,
		};
		return this.makeRequest<GetBonusRateResponse>(
			"/api/getBonusRate",
			"POST",
			data,
			jwtToken
		) as unknown as GetBonusRateResponse;
	}

	async getMemberBonus(
		body: GetMemberBonusRequest,
		jwtToken?: string
	): Promise<GetMemberBonusResponse> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetMemberBonusResponse>(
			"/api/getMemberBonus",
			"POST",
			data,
			jwtToken
		) as unknown as GetMemberBonusResponse;
	}

	async claimMemberBonus(
		body: ClaimMemberBonusRequest,
		jwtToken?: string
	): Promise<ClaimMemberBonusResponse> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<ClaimMemberBonusResponse>(
			"/api/claimMemberBonus",
			"POST",
			data,
			jwtToken
		) as unknown as ClaimMemberBonusResponse;
	}

	async getMemberBonusDetail(
		body: GetMemberBonusDetailRequest,
		jwtToken?: string
	): Promise<GetMemberBonusDetailResponse> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetMemberBonusDetailResponse>(
			"/api/getMemberBonusDetail",
			"POST",
			data,
			jwtToken
		) as unknown as GetMemberBonusDetailResponse;
	}

	async getMemberUnclaimedBonus(
		body: GetMemberUnclaimedBonusRequest,
		jwtToken?: string
	): Promise<GetMemberUnclaimedBonusResponse> {
		const data = { ...body, api_key: this.apiKey, jwt_type: "dyn" };
		return this.makeRequest<GetMemberUnclaimedBonusResponse>(
			"/api/getMemberUnclaimedBonus",
			"POST",
			data,
			jwtToken
		) as unknown as GetMemberUnclaimedBonusResponse;
	}

	/** CHAT-RELATED API SERVICES */
	/**
	 * Get chat history messages.
	 */
	async getChatHistory(): Promise<ChatHistoryApiResponse> {
		const data: ChatHistoryRequest = {
			api_key: this.chatHistoryApiKey,
			ws_key: this.wsKey,
		};

		try {
			const response = await this.makeRequest<
				ChatHistoryApiResponse["data"]
			>("/api/getHistoryChat", "POST", data);

			// The API returns data directly, but we need to match the expected format
			if (response.error) {
				return {
					error: true,
					data: [],
				};
			}

			// The API response structure should match { error: false, data: ChatHistoryApiMessage[] }
			// But our makeRequest wrapper might be adding another layer
			const actualData = response.data || response;

			return {
				error: false,
				data: Array.isArray(actualData) ? actualData : [],
			};
		} catch (error) {
			console.error("Error fetching chat history:", error);
			return {
				error: true,
				data: [],
			};
		}
	}
}

export default ApiService;
export type {
	ApiResponse,
	CheckTransactionStatusRequest,
	CheckTransactionStatusResponse,
};
