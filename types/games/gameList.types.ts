/**
 * Defines the set of possible vendor names.
 */
export type VendorName = "EVOLUTION" | "SBO";

/**
 * Defines the possible types of games.
 * Note: The API provides inconsistent casing ("LIVE CASINO" vs "Live Casino").
 */
export type GameType =
	| "LIVE CASINO"
	| "SPORT BOOK"
	| "SLOT"
	| "RNG"
	| "Live Casino"
	| "SPORTSBOOK"
	| "SPORTS"
	| "-";

/**
 * Defines the COMPLETE set of all 54 possible game provider names.
 */
export type ProviderName =
	| "5G Games"
	| "568Win"
	| "93 Connect"
	| "Advant"
	| "AFB Casino"
	| "Allbet"
	| "Asia Gaming"
	| "Aviatrix"
	| "Big Gaming"
	| "Booongo"
	| "BTG"
	| "ClotPlay"
	| "CQ9"
	| "Dragoon Soft"
	| "Dream Gaming"
	| "Evolution"
	| "Fa Chai"
	| "Fastspin"
	| "Funky"
	| "GamePlay"
	| "GD88"
	| "Habanero"
	| "ION Club"
	| "JDB"
	| "Jili"
	| "Joker"
	| "KA GAMING"
	| "King Midas"
	| "Lambda"
	| "Live22"
	| "Microgaming"
	| "MT"
	| "NetEnt"
	| "No Limit"
	| "Pegasus"
	| "PG Soft"
	| "Phoenix 7"
	| "PlayStar"
	| "Playtech"
	| "Poggi Play"
	| "Pragmatic Live"
	| "Pragmatic Play"
	| "Red Tiger"
	| "Relax"
	| "Rich88"
	| "SA Gaming"
	| "Sexy Baccarat"
	| "Tom Horn"
	| "Via Casino"
	| "W Casino"
	| "WE Entertain."
	| "World Match"
	| "Yggdrasil"
	| "YGR"
	| "SBO";
/**
 * Defines the structure for a single game object in the data array.
 */
export interface Game {
	own_game_image: string;
	game_name: string;
	vendor_name: VendorName;
	own_game_type: GameType;
	category: Exclude<GameType, "Live Casino">;
	/**
	 * The full URL to the game image.
	 */
	full_url_game_image: string;
	/**
	 * The API provides this as both a string and a number.
	 */
	game_id: string | number;
	provider_name: ProviderName;
	/**
	 * The API provides this as both a string ("-") and a number.
	 */
	gp_id: string | number;
}

/**
 * Defines the root structure of the entire API response.
 */
export type GameListApiResponse = Game[];
