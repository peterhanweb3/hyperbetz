import { BetHistoryItem } from "@/types/games/betHistory.types";

export interface UserData {
	id: string;
	username: string;
	email: string;
	balance: number;
	vipLevel: string;
	isVerified: boolean;
	joinDate: string;
	totalWagered: number;
	totalWon: number;
	gamesPlayed: number;
	winRate: number;
	biggestWin: number;
	favoriteGame: string;
	referralId?: string; // Optional, only if the user has a referral ID
	achievements: Achievement[];
	bonuses: Bonus[];
	gameHistory: GameHistory[];
	favorites: number[];
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	progress?: number;
	maxProgress?: number;
	reward: string;
	unlockedAt?: string;
}

export interface Bonus {
	id: string;
	type: string;
	title: string;
	description: string;
	amount: number;
	claimed: boolean;
	expiresAt: string;
	claimedAt?: string;
}

export interface GameHistory {
	id: string;
	gameId: number;
	gameName: string;
	action: "won" | "lost";
	amount: number;
	timestamp: string;
}

export interface ChatMessage {
	id: string;
	user: string;
	message: string;
	timestamp: string;
	room: string;
	avatar: string;
	vip: boolean;
	isBot?: boolean;
}

// Bet History Cache Types
export interface BetHistoryCacheData {
	allBets: BetHistoryItem[];
	totalCount: number;
	lastFetched: number;
	timestamp: number;
	grandTotalBet?: number;
	grandTotalWinLose?: number;
}

class LocalStorageService {
	private static instance: LocalStorageService;

	// This is the key for your application's specific user data.
	private USER_DATA_KEY = "hyperbetz_userData";
	private CHAT_MESSAGES_KEY = "hyperbetz_chatMessages";

	// This is the key for the JWT provided by the Dynamic SDK.
	private DYNAMIC_AUTH_TOKEN_KEY = "dynamic_authentication_token";

	// This is the key for saving Bet History Transactions
	private BET_HISTORY_CACHE_KEY = "bet_history_cache";

	static getInstance(): LocalStorageService {
		if (!LocalStorageService.instance) {
			LocalStorageService.instance = new LocalStorageService();
			if (typeof window !== "undefined") {
				console.log("LocalStorageService initialized");
			}
		}
		return LocalStorageService.instance;
	}

	// Helper to ensure code runs only in the browser
	private isBrowser(): boolean {
		return (
			typeof window !== "undefined" && typeof localStorage !== "undefined"
		);
	}

	/**
	 * [NEW] Retrieves the raw JWT authentication token stored by the Dynamic SDK.
	 * @returns The token string, or null if it's not found.
	 */
	getAuthToken(): string | null {
		if (!this.isBrowser()) return null;
		try {
			const token = localStorage.getItem(this.DYNAMIC_AUTH_TOKEN_KEY);
			// The token is often stored as a JSON string (with quotes), so we parse it.
			return token ? JSON.parse(token) : null;
		} catch (error) {
			console.error(
				"Failed to get or parse auth token from localStorage:",
				error
			);
			// Fallback for cases where it might not be a JSON string
			return this.isBrowser()
				? localStorage.getItem(this.DYNAMIC_AUTH_TOKEN_KEY)
				: null;
		}
	}

	// User Data Management
	saveUserData(userData: UserData): void {
		if (!this.isBrowser()) return;
		localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
	}

	getUserData(): UserData | null {
		if (!this.isBrowser()) return null;
		const data = localStorage.getItem(this.USER_DATA_KEY);
		return data ? JSON.parse(data) : null;
	}

	updateBalance(newBalance: number): void {
		const userData = this.getUserData();
		if (userData) {
			userData.balance = newBalance;
			this.saveUserData(userData);
		}
	}

	// Chat Messages
	saveChatMessages(messages: ChatMessage[]): void {
		if (!this.isBrowser()) return;
		localStorage.setItem(this.CHAT_MESSAGES_KEY, JSON.stringify(messages));
	}

	getChatMessages(): ChatMessage[] {
		if (!this.isBrowser()) return [];
		const data = localStorage.getItem(this.CHAT_MESSAGES_KEY);
		return data ? JSON.parse(data) : [];
	}

	addChatMessage(message: ChatMessage): void {
		if (!this.isBrowser()) return;
		const messages = this.getChatMessages();
		messages.push(message);
		// Keep only last 100 messages per room
		const filteredMessages = messages.slice(-100);
		this.saveChatMessages(filteredMessages);
	}

	// Game History
	addGameHistory(entry: GameHistory): void {
		const userData = this.getUserData();
		if (userData) {
			userData.gameHistory.unshift(entry);
			userData.gameHistory = userData.gameHistory.slice(0, 50); // Keep last 50 games

			// Update stats
			userData.gamesPlayed++;
			userData.totalWagered += Math.abs(entry.amount);
			if (entry.action === "won") {
				userData.totalWon += entry.amount;
				if (entry.amount > userData.biggestWin) {
					userData.biggestWin = entry.amount;
				}
			}
			userData.winRate =
				(userData.totalWon / userData.totalWagered) * 100;

			this.saveUserData(userData);
			this.checkAchievements(userData);
		}
	}

	// Achievements System
	checkAchievements(userData: UserData): void {
		const achievements = userData.achievements;

		// First Win Achievement
		const firstWin = achievements.find((a) => a.id === "first_win");
		if (firstWin && !firstWin.completed && userData.totalWon > 0) {
			firstWin.completed = true;
			firstWin.unlockedAt = new Date().toISOString();
		}

		// High Roller Achievement
		const highRoller = achievements.find((a) => a.id === "high_roller");
		if (
			highRoller &&
			!highRoller.completed &&
			userData.biggestWin >= 1000
		) {
			highRoller.completed = true;
			highRoller.unlockedAt = new Date().toISOString();
		}

		// Lucky Seven Achievement
		const luckySeven = achievements.find((a) => a.id === "lucky_seven");
		if (luckySeven && !luckySeven.completed) {
			const recentWins = userData.gameHistory
				.slice(0, 7)
				.filter((g) => g.action === "won");
			luckySeven.progress = recentWins.length;
			if (recentWins.length === 7) {
				luckySeven.completed = true;
				luckySeven.unlockedAt = new Date().toISOString();
			}
		}

		this.saveUserData(userData);
	}

	// Bonus Management
	claimBonus(bonusId: string): boolean {
		const userData = this.getUserData();
		if (userData) {
			const bonus = userData.bonuses.find((b) => b.id === bonusId);
			if (
				bonus &&
				!bonus.claimed &&
				new Date() < new Date(bonus.expiresAt)
			) {
				bonus.claimed = true;
				bonus.claimedAt = new Date().toISOString();
				userData.balance += bonus.amount;
				this.saveUserData(userData);
				return true;
			}
		}
		return false;
	}

	// Favorites Management
	toggleFavorite(gameId: number): boolean {
		const userData = this.getUserData();
		if (userData) {
			const index = userData.favorites.indexOf(gameId);
			if (index > -1) {
				userData.favorites.splice(index, 1);
				this.saveUserData(userData);
				return false;
			} else {
				userData.favorites.push(gameId);
				this.saveUserData(userData);
				return true;
			}
		}
		return false;
	}

	isFavorite(gameId: number): boolean {
		const userData = this.getUserData();
		return userData ? userData.favorites.includes(gameId) : false;
	}

	// Initialize default user data
	initializeUserData(username: string, email: string): UserData {
		const userData: UserData = {
			id: Date.now().toString(),
			username,
			email,
			balance: 1000, // Starting bonus
			vipLevel: "Bronze",
			isVerified: false,
			joinDate: new Date().toISOString(),
			totalWagered: 0,
			totalWon: 0,
			gamesPlayed: 0,
			winRate: 0,
			biggestWin: 0,
			favoriteGame: "None",
			achievements: [
				{
					id: "first_win",
					title: "First Win",
					description: "Win your first game",
					completed: false,
					reward: "$10",
				},
				{
					id: "high_roller",
					title: "High Roller",
					description: "Win over $1000 in a single game",
					completed: false,
					reward: "50 Free Spins",
				},
				{
					id: "lucky_seven",
					title: "Lucky Seven",
					description: "Win 7 games in a row",
					completed: false,
					progress: 0,
					maxProgress: 7,
					reward: "$100 Bonus",
				},
				{
					id: "vip_status",
					title: "VIP Status",
					description: "Reach VIP level 5",
					completed: false,
					progress: 1,
					maxProgress: 5,
					reward: "VIP Lounge Access",
				},
			],
			bonuses: [
				{
					id: "welcome_bonus",
					type: "deposit",
					title: "Welcome Bonus",
					description: "200% up to $500",
					amount: 500,
					claimed: false,
					expiresAt: new Date(
						Date.now() + 7 * 24 * 60 * 60 * 1000
					).toISOString(),
				},
				{
					id: "free_spins",
					type: "spins",
					title: "Free Spins",
					description: "25 free spins on slots",
					amount: 25,
					claimed: false,
					expiresAt: new Date(
						Date.now() + 3 * 24 * 60 * 60 * 1000
					).toISOString(),
				},
				{
					id: "daily_bonus",
					type: "daily",
					title: "Daily Bonus",
					description: "Daily login bonus",
					amount: 50,
					claimed: false,
					expiresAt: new Date(
						Date.now() + 24 * 60 * 60 * 1000
					).toISOString(),
				},
			],
			gameHistory: [],
			favorites: [],
		};

		this.saveUserData(userData);
		return userData;
	}

	// Bet History Management
	saveBetHistoryCache(
		filterKey: string,
		data: Omit<BetHistoryCacheData, "timestamp">
	): void {
		if (!this.isBrowser()) return;
		const cacheKey = `${this.BET_HISTORY_CACHE_KEY}_${filterKey}`;
		try {
			localStorage.setItem(
				cacheKey,
				JSON.stringify({
					...data,
					timestamp: Date.now(),
				})
			);
		} catch (error) {
			console.warn("Failed to save bet history cache:", error);
		}
	}

	getBetHistoryCache(
		filterKey: string,
		ttlMinutes: number = 10
	): BetHistoryCacheData | null {
		if (!this.isBrowser()) return null;
		const cacheKey = `${this.BET_HISTORY_CACHE_KEY}_${filterKey}`;
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const parsedCache = JSON.parse(cached) as BetHistoryCacheData;
				const age = (Date.now() - parsedCache.timestamp) / 1000 / 60;

				if (age < ttlMinutes) {
					return parsedCache;
				} else {
					// Cache expired, remove it
					localStorage.removeItem(cacheKey);
				}
			}
		} catch (error) {
			console.warn("Failed to get bet history cache:", error);
		}
		return null;
	}

	clearBetHistoryCache(): void {
		if (!this.isBrowser()) return;

		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(`${this.BET_HISTORY_CACHE_KEY}_`)) {
				keysToRemove.push(key);
			}
		}

		keysToRemove.forEach((key) => {
			localStorage.removeItem(key);
			console.log("Cleared bet history cache key:", key);
		});
	}

	clearAllBetHistoryCaches(): void {
		// Alias for clearBetHistoryCache for clarity
		this.clearBetHistoryCache();
	}

	clearUserData(): void {
		if (!this.isBrowser()) return;

		// Clear main user data
		localStorage.removeItem(this.USER_DATA_KEY);
		localStorage.removeItem(this.CHAT_MESSAGES_KEY);

		// Also clear Dynamic SDK authentication token
		localStorage.removeItem(this.DYNAMIC_AUTH_TOKEN_KEY);

		// Clear transaction notifications
		localStorage.removeItem("app_transaction_notifications");

		// Clear bet history cache when user logs out
		this.clearBetHistoryCache();

		// Clear any other Dynamic SDK related keys and user-specific data
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (
				key &&
				(key.startsWith("dynamic_") ||
					key.startsWith("dyn_") ||
					key.includes("dynamic") ||
					key.startsWith("userBalance_") ||
					key.startsWith("hyperbetz_") ||
					key.includes("transaction") ||
					key.includes("wallet") ||
					key.startsWith(`${this.BET_HISTORY_CACHE_KEY}_`))
			) {
				keysToRemove.push(key);
			}
		}

		// Remove all identified keys
		keysToRemove.forEach((key) => localStorage.removeItem(key));
	}

	// --- Generic helpers (added) ---
	/**
	 * Store an arbitrary JSON-serializable value under a custom key.
	 */
	setItem<T>(key: string, value: T): void {
		if (!this.isBrowser()) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.warn("localStorage setItem failed", key, e);
		}
	}

	/**
	 * Retrieve an arbitrary JSON value previously stored. Returns null if missing or parse fails.
	 */
	getItem<T>(key: string): T | null {
		if (!this.isBrowser()) return null;
		try {
			const raw = localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as T) : null;
		} catch (e) {
			console.warn("localStorage getItem failed", key, e);
			return null;
		}
	}
}

export default LocalStorageService;
