/**
 * Defines the structure for a last bet item from the getLastBet API.
 */
export interface LastBetItem {
	/**
	 * The nickname of the player who placed the bet.
	 */
	nickname: string;

	/**
	 * The country code of the player.
	 */
	country: string;

	/**
	 * The type of game where the bet was placed.
	 */
	game_type: string;

	/**
	 * The date and time when the bet was placed.
	 * Format: "YYYY-MM-DD HH:mm:ss"
	 */
	bet_date: string;

	/**
	 * The vendor name.
	 */
	vendor_name: string;

	/**
	 * The provider name.
	 */
	provider_name: string;

	/**
	 * The unique bet identifier.
	 */
	bet_id: string;

	/**
	 * The name of the game.
	 */
	game_name: string;

	/**
	 * The status of the bet (Win, Lose, etc.). Optional - may not be present in API response.
	 */
	status?: string;

	/**
	 * The bet amount as a string.
	 */
	bet_amount: string;

	/**
	 * The win amount as a string.
	 */
	win_amount: string;

	/**
	 * The date and time when the bet was updated.
	 * Format: "YYYY-MM-DD HH:mm:ss"
	 */
	update_date: string;
}

/**
 * Defines the response structure for the getLastBet API.
 */
export interface GetLastBetResponse {
	error: boolean;
	message: string;
	data: LastBetItem[];
}
