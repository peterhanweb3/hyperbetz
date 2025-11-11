/**
 * Defines the possible bet statuses.
 */
export type BetStatus =
	| "OUTSTANDING"
	| "DRAW"
	| "WIN"
	| "LOSE"
	| "VOID"
	| "B WIN";

/**
 * Defines the possible game types for bet history.
 */
export type BetGameType =
	| "Live Casino"
	| "Slot"
	| "Sport Book"
	| "RNG"
	| "Sports";

/**
 * Defines the possible order options for bet history.
 */
export type BetOrderType = "nickname" | "";

/**
 * Defines the structure for a single bet history item.
 */
export interface BetHistoryItem {
	/**
	 * The nickname of the player who placed the bet.
	 */
	nickname: string;

	/**
	 * The type of game where the bet was placed.
	 */
	game_type: BetGameType;

	/**
	 * The date and time when the bet was placed.
	 * Format: "YYYY-MM-DD HH:mm:ss"
	 */
	bet_date: string;

	/**
	 * The vendor name (lowercase).
	 */
	vendor_name: string;

	/**
	 * The provider name (formatted).
	 */
	provider_name: string;

	/**
	 * The unique identifier for the bet.
	 */
	bet_id: string;

	/**
	 * The name of the game where the bet was placed.
	 */
	game_name: string;

	/**
	 * The status of the bet.
	 */
	status: BetStatus;

	/**
	 * The amount that was bet (as string to preserve decimal precision).
	 */
	bet_amount: string;

	/**
	 * The amount that was won (as string to preserve decimal precision).
	 */
	win_amount: string;

	/**
	 * The date and time when the bet was last updated.
	 * Format: "YYYY-MM-DD HH:mm:ss"
	 */
	update_date: string;
}

/**
 * Defines the request body for the getBetHistory API endpoint.
 */
export interface GetBetHistoryRequest {
	/**
	 * The API key for authentication.
	 */
	api_key: string;

	/**
	 * The username for the bet history query.
	 */
	username: string;

	/**
	 * The password for authentication.
	 */
	password: string;

	/**
	 * The start date for the bet history query.
	 * Format: "YYYY-MM-DD"
	 */
	from_date: string;

	/**
	 * The end date for the bet history query.
	 * Format: "YYYY-MM-DD"
	 */
	to_date: string;

	/**
	 * The vendor name to filter by. Can be empty string for all vendors.
	 * Use provider_name or provider_name_rename from getProvider endpoint.
	 */
	vendor_name: string;

	/**
	 * The number of records per page.
	 */
	limit: number;

	/**
	 * The page number to retrieve.
	 */
	page_number: number;

	/**
	 * The order field. Use "nickname" or empty string for order by bet date DESC.
	 */
	order: BetOrderType;

	/**
	 * The bet status to filter by. Can be empty string for all statuses.
	 */
	status: BetStatus | "";

	/**
	 * The JWT type for authentication.
	 */
	jwt_type: string;
}

/**
 * Defines the response structure for the getBetHistory API endpoint.
 */
export interface GetBetHistoryResponse {
	/**
	 * Indicates if there was an error in the request.
	 */
	error: boolean;

	/**
	 * The response message.
	 */
	message: string;

	/**
	 * The total number of bet records found.
	 */
	total_data: number;

	/**
	 * The pagination information.
	 * Format: "X of Y" where X is current page and Y is total pages.
	 */
	page: string;

	/**
	 * The subtotal of bet amounts for the current page.
	 */
	sub_total_bet: number;

	/**
	 * The subtotal of win/lose amounts for the current page.
	 */
	sub_total_winlose: number;

	/**
	 * The grand total of all bet amounts.
	 */
	grand_total_bet: number;

	/**
	 * The grand total of all win/lose amounts.
	 */
	grand_total_winlose: number;

	/**
	 * The array of bet history items.
	 */
	data: BetHistoryItem[];
}

/**
 * Type for the request body without api_key, password, and jwt_type
 * (these will be added by the API service).
 */
export type GetBetHistoryRequestBody = Omit<
	GetBetHistoryRequest,
	"api_key" | "password" | "jwt_type"
>;
