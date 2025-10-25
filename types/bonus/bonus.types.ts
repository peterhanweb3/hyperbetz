/**
 * @file Defines the TypeScript types for bonus-related API endpoints.
 * @licence QbitronLabs
 */

/**
 * Represents the structure of a failed API response.
 * This is a generic type used for union types in API responses.
 */
export interface FailedResponse {
	error: true;
	message: string;
}

// =================================================================================
// 1. Types for /api/getBonusRate
// =================================================================================

/**
 * Represents the bonus rate details for a specific level.
 */
export interface BonusRate {
	lottery_percent: string | null;
	sport_percent: string;
	lc_percent: string;
	slot_percent: string;
	level: string;
	min_to: string;
	max_to: string;
}

/**
 * Represents a successful response from the /api/getBonusRate endpoint.
 */
export interface GetBonusRateSuccessResponse {
	error: false;
	data: BonusRate[];
}

/**
 * Represents the complete response type for /api/getBonusRate, which can be either a success or a failure.
 */
export type GetBonusRateResponse = GetBonusRateSuccessResponse | FailedResponse;

// =================================================================================
// 2. Types for /api/getMemberBonus
// =================================================================================

/**
 * Represents the bonus data for a member.
 */
export interface MemberBonusData {
	available_bonus: number;
	pending_bonus: number;
	total_bonus: number;
}

/**
 * Represents the request body for the /api/getMemberBonus endpoint.
 */
export interface GetMemberBonusRequest {
	username: string;
}

/**
 * Represents a successful response from the /api/getMemberBonus endpoint.
 */
export interface GetMemberBonusSuccessResponse {
	error: false;
	last_claim: number;
	last_claim_date: string;
	last_month_total_wager: string;
	status: boolean;
	data: MemberBonusData;
}

/**
 * Represents the complete response type for /api/getMemberBonus, which can be either a success or a failure.
 */
export type GetMemberBonusResponse =
	| GetMemberBonusSuccessResponse
	| FailedResponse;

// =================================================================================
// 3. Types for /api/claimMemberBonus
// =================================================================================

/**
 * Represents the request body for the /api/claimMemberBonus endpoint.
 */
export interface ClaimMemberBonusRequest {
	username: string;
}

/**
 * Represents a successful response from the /api/claimMemberBonus endpoint.
 */
export interface ClaimMemberBonusSuccessResponse {
	error: false;
	message: string;
	amount_claimed: number;
	last_balance: number;
	final_balance: number;
}

/**
 * Represents the complete response type for /api/claimMemberBonus, which can be either a success or a failure.
 */
export type ClaimMemberBonusResponse =
	| ClaimMemberBonusSuccessResponse
	| FailedResponse;

// =================================================================================
// 4. Types for /api/getMemberBonusDetail
// =================================================================================

/**
 * Represents the request body for the /api/getMemberBonusDetail endpoint.
 */
export interface GetMemberBonusDetailRequest {
	username: string;
}

/**
 * Represents a successful response from the /api/getMemberBonusDetail endpoint.
 */
export interface GetMemberBonusDetailSuccessResponse {
	error: false;
	data: MemberBonusData;
}

/**
 * Represents the complete response type for /api/getMemberBonusDetail, which can be either a success or a failure.
 */
export type GetMemberBonusDetailResponse =
	| GetMemberBonusDetailSuccessResponse
	| FailedResponse;

// =================================================================================
// 5. Types for /api/getMemberUnclaimedBonus
// =================================================================================

/**
 * Represents the request body for the /api/getMemberUnclaimedBonus endpoint.
 */
export interface GetMemberUnclaimedBonusRequest {
	username: string;
	page_number: number;
	limit: number;
}

/**
 * Represents the structure of an unclaimed bonus item.
 * The structure is currently unknown, so it allows any properties.
 */
export interface UnclaimedBonus {
	// Define structure based on expected data if available, using any for now
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

/**
 * Represents a successful response from the /api/getMemberUnclaimedBonus endpoint.
 */
export interface GetMemberUnclaimedBonusSuccessResponse {
	error: false;
	data?: UnclaimedBonus[];
}

/**
 * Represents the complete response type for /api/getMemberUnclaimedBonus, which can be either a success or a failure.
 */
export type GetMemberUnclaimedBonusResponse =
	| GetMemberUnclaimedBonusSuccessResponse
	| FailedResponse;
