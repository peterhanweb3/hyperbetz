"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/store";
import { Game } from "@/types/games/gameList.types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Advanced username generation system
const USERNAME_PREFIXES = [
	"Crypto",
	"Lucky",
	"Golden",
	"Diamond",
	"Royal",
	"Mega",
	"Star",
	"Elite",
	"Master",
	"Winner",
	"Gold",
	"Silver",
	"Fortune",
	"Casino",
	"Jackpot",
	"High",
	"Vegas",
	"Slot",
	"Poker",
	"Dragon",
	"Tiger",
	"Phoenix",
	"Eagle",
	"Lion",
	"Wolf",
	"Bear",
	"Thunder",
	"Storm",
	"Fire",
	"Ice",
	"Shadow",
	"Ghost",
	"Ninja",
	"Samurai",
	"Warrior",
	"Knight",
	"King",
	"Queen",
	"Prince",
	"Emperor",
	"Lord",
];

const USERNAME_SUFFIXES = [
	"King",
	"Master",
	"Pro",
	"Ace",
	"Boss",
	"Lord",
	"Hunter",
	"Slayer",
	"Winner",
	"Legend",
	"Hero",
	"Gamer",
	"Bet",
	"Win",
	"Rush",
	"Strike",
	"Blast",
	"Force",
	"Power",
	"Storm",
	"Fire",
	"Ice",
	"Shadow",
	"Ghost",
	"Ninja",
	"Knight",
	"777",
	"888",
	"999",
	"123",
	"456",
	"789",
	"007",
	"911",
	"100",
	"200",
	"500",
	"1000",
	"2000",
	"5000",
	"X",
	"XX",
	"XXX",
	"Alpha",
	"Beta",
	"Gamma",
];

// Enhanced nickname generation with more authentic styles
function generateRealisticNickname(): string {
	const styles = [
		// Style 1: Masked names (most common for privacy)
		() => {
			const prefix =
				USERNAME_PREFIXES[
				Math.floor(Math.random() * USERNAME_PREFIXES.length)
				];
			const suffix =
				USERNAME_SUFFIXES[
				Math.floor(Math.random() * USERNAME_SUFFIXES.length)
				];
			const number = Math.floor(Math.random() * 99) + 1;

			let finalNickName = `${prefix}${suffix}${number}`;
			// now hide starting 3 characters
			if (finalNickName.length > 3) {
				finalNickName = `***${finalNickName.slice(3)}`;
			}
			return finalNickName;

		},

		// Style 2: Country code style
		() => {

			const prefix =
				USERNAME_PREFIXES[
				Math.floor(Math.random() * USERNAME_PREFIXES.length)
				];
			const number = Math.floor(Math.random() * 99) + 1;

			let finalNickName = `${prefix}${number}`;

			// now hide starting 3 characters from 
			if (finalNickName.length > 3) {
				finalNickName = `***${finalNickName.slice(3)}`;
			}
			return finalNickName;

		},


		// Style 4: Gaming tags
		() => {
			const prefix =
				USERNAME_PREFIXES[
				Math.floor(Math.random() * USERNAME_PREFIXES.length)
				];
			const suffix =
				USERNAME_SUFFIXES[
				Math.floor(Math.random() * USERNAME_SUFFIXES.length)
				];
			// return `${prefix}_${suffix}_${Math.floor(Math.random() * 999) + 1}`;

			let finalNickName = `${prefix}${suffix}${Math.floor(Math.random() * 99) + 1}`;

			// now hide starting 3 characters
			if (finalNickName.length > 3) {
				finalNickName = `***${finalNickName.slice(3)}`;
			}
			return finalNickName;

		},

	];

	const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
	return selectedStyle();
}

// Betting data interface
interface BettingRecord {
	id: string;
	gameName: string;
	time: string;
	provider: string;
	nickname: string;
	bet: number;
	multiplier: number | string;
	profit: number;
	status: "win" | "lose" | "processing";
	timestamp: number;
}

const MAX_TABLE_RECORDS = 36;
const INITIAL_RECORD_COUNT = 12;

// Enhanced bet amounts with NO 0.00 bets - only real money bets for motivation
const BASE_BET_AMOUNTS = [
	{ value: 0.2, weight: 12 },
	{ value: 0.5, weight: 15 },
	{ value: 1.0, weight: 18 },
	{ value: 2.0, weight: 15 },
	{ value: 5.0, weight: 12 },
	{ value: 10.0, weight: 10 },
	{ value: 20.0, weight: 8 },
	{ value: 50.0, weight: 5 },
	{ value: 100.0, weight: 3 },
	{ value: 200.0, weight: 1.5 },
	{ value: 500.0, weight: 0.8 },
	{ value: 1000.0, weight: 0.3 },
];

// Enhanced multiplier options with BETTER big win ratios for motivation
const MULTIPLIER_OPTIONS: Array<{
	value: number | "FreeSpin";
	weight: number;
}> = [
		{ value: 0.0, weight: 20 }, // Reduced losses
		{ value: 0.2, weight: 12 },
		{ value: 0.4, weight: 10 },
		{ value: 0.6, weight: 8 },
		{ value: 0.8, weight: 6 },
		{ value: 1.2, weight: 15 }, // More small wins
		{ value: 1.5, weight: 12 },
		{ value: 2.0, weight: 10 },
		{ value: 2.5, weight: 8 },
		{ value: 3.0, weight: 6 },
		{ value: 5.0, weight: 5 }, // Medium wins
		{ value: 10.0, weight: 4 }, // Big wins - increased frequency
		{ value: 15.0, weight: 3 },
		{ value: 25.0, weight: 2.5 },
		{ value: 50.0, weight: 2 }, // Huge wins - more frequent
		{ value: 100.0, weight: 1.5 },
		{ value: 250.0, weight: 1 }, // Mega wins - better chances
		{ value: 500.0, weight: 0.8 },
		{ value: 1000.0, weight: 0.5 }, // Jackpot level - improved
		{ value: 2500.0, weight: 0.2 }, // Super jackpot
		{ value: "FreeSpin", weight: 10 }, // More free spins
	];

// Enhanced bet amount distribution based on time of day and patterns
function getTimeBasedBetDistribution(): Array<{
	value: number;
	weight: number;
}> {
	const hour = new Date().getHours();

	// Different betting patterns for different times - NO 0.00 bets anywhere
	if (hour >= 22 || hour <= 2) {
		// Late night - higher stakes, whale activity
		return [
			{ value: 0.5, weight: 5 },
			{ value: 1.0, weight: 8 },
			{ value: 2.0, weight: 10 },
			{ value: 5.0, weight: 12 },
			{ value: 10.0, weight: 15 },
			{ value: 20.0, weight: 12 },
			{ value: 50.0, weight: 10 },
			{ value: 100.0, weight: 8 },
			{ value: 200.0, weight: 5 },
			{ value: 500.0, weight: 3 },
			{ value: 1000.0, weight: 2 },
		];
	} else if (hour >= 9 && hour <= 17) {
		// Business hours - moderate betting
		return [
			{ value: 0.2, weight: 15 },
			{ value: 0.5, weight: 18 },
			{ value: 1.0, weight: 20 },
			{ value: 2.0, weight: 15 },
			{ value: 5.0, weight: 12 },
			{ value: 10.0, weight: 8 },
			{ value: 20.0, weight: 5 },
			{ value: 50.0, weight: 3 },
			{ value: 100.0, weight: 2 },
			{ value: 200.0, weight: 1 },
			{ value: 500.0, weight: 0.5 },
		];
	} else {
		// Evening - peak activity, balanced distribution
		return BASE_BET_AMOUNTS;
	}
}

// Enhanced player behavior patterns for more realistic betting
function getPlayerBehaviorMultiplier(): number {
	const behaviors = [
		{ type: "conservative", multiplier: 0.7, weight: 25 }, // Careful players
		{ type: "normal", multiplier: 1.0, weight: 50 }, // Standard play
		{ type: "aggressive", multiplier: 1.8, weight: 20 }, // Risk takers
		{ type: "whale", multiplier: 4.0, weight: 5 }, // High rollers
	];

	const totalWeight = behaviors.reduce((sum, b) => sum + b.weight, 0);
	let random = Math.random() * totalWeight;

	for (const behavior of behaviors) {
		random -= behavior.weight;
		if (random <= 0) {
			return behavior.multiplier;
		}
	}

	return 1.0;
}

// Weighted random selection function
function getWeightedRandom<T>(options: Array<{ value: T; weight: number }>): T {
	const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
	let random = Math.random() * totalWeight;

	for (const option of options) {
		random -= option.weight;
		if (random <= 0) {
			return option.value;
		}
	}

	return options[options.length - 1].value;
}

// Enhanced big win simulation - make wins more exciting and motivating
function simulateBigWinEvent(): {
	shouldTrigger: boolean;
	multiplierBonus: number;
} {
	const hour = new Date().getHours();
	const minute = new Date().getMinutes();

	// Higher chances during peak hours
	let baseChance = 0.08; // 8% base chance

	// Bonus chances during peak times
	if (hour >= 20 && hour <= 23) baseChance += 0.04; // Evening bonus
	if (hour >= 0 && hour <= 2) baseChance += 0.06; // Late night bonus
	if (minute >= 55 || minute <= 5) baseChance += 0.03; // Hour transition bonus

	const shouldTrigger = Math.random() < baseChance;
	const multiplierBonus = shouldTrigger ? 1.5 + Math.random() * 2 : 1; // 1.5x to 3.5x bonus

	return { shouldTrigger, multiplierBonus };
}

// Generate random betting record with enhanced win rates and real game data
function generateBettingRecord(availableGames: Game[]): BettingRecord {
	const now = new Date();

	// Use time-based betting patterns and player behavior
	const timeBasedBets = getTimeBasedBetDistribution();
	const baseBet = getWeightedRandom(timeBasedBets);
	const behaviorMultiplier = getPlayerBehaviorMultiplier();
	const bet = parseFloat((baseBet * behaviorMultiplier).toFixed(2));

	// Check for big win events
	const bigWinEvent = simulateBigWinEvent();

	// Enhanced multiplier selection with big win bonus
	let multiplierOptions = MULTIPLIER_OPTIONS;
	if (bigWinEvent.shouldTrigger) {
		// Boost higher multipliers during big win events
		multiplierOptions = MULTIPLIER_OPTIONS.map((option) => {
			if (typeof option.value === "number" && option.value >= 10) {
				return {
					...option,
					weight: option.weight * bigWinEvent.multiplierBonus,
				};
			}
			return option;
		});
	}

	const multiplier = getWeightedRandom(multiplierOptions);

	// Use real game data if available, fallback to default names
	let gameName = "Slot Game";
	let provider = "Casino";

	if (availableGames.length > 0) {
		const randomGame =
			availableGames[Math.floor(Math.random() * availableGames.length)];
		gameName = randomGame.game_name;
		provider = randomGame.provider_name;
	}

	let profit = 0;
	let status: "win" | "lose" | "processing" = "lose";

	if (multiplier === "FreeSpin") {
		// Enhanced FreeSpin outcomes: 75% chance of win, higher payouts
		const freeSpinWin = Math.random() > 0.25; // Improved from 0.3
		if (freeSpinWin) {
			// More generous free spin wins
			const multiplierRange = [
				8, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200,
			];
			const winMultiplier =
				multiplierRange[
				Math.floor(Math.random() * multiplierRange.length)
				];
			profit = parseFloat((bet * winMultiplier).toFixed(2));
			status = "win";
		} else {
			profit = 0;
			status = "lose";
		}
	} else if (typeof multiplier === "number") {
		if (multiplier === 0) {
			profit = 0;
			status = "lose";
		} else {
			profit = parseFloat((bet * multiplier - bet).toFixed(2));
			status = profit > 0 ? "win" : "lose";

			// Apply big win event bonus to the profit
			if (bigWinEvent.shouldTrigger && profit > 0) {
				profit = parseFloat(
					(profit * (1 + Math.random() * 0.5)).toFixed(2)
				); // Up to 50% bonus
			}
		}
	}

	// Reduced processing status frequency (1% instead of 2%)
	if (Math.random() < 0.01) {
		status = "processing";
		profit = 0;
	}

	return {
		id: Math.random().toString(36).substr(2, 9),
		gameName,
		time: now.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}),
		provider,
		nickname: generateRealisticNickname(),
		bet,
		multiplier,
		profit,
		status,
		timestamp: now.getTime(),
	};
}

// Local storage keys for betting table preferences
const BETTING_TABLE_PREFERENCES = "hyperbetz_betting_table_prefs";
const BETTING_HISTORY_CACHE = "hyperbetz_betting_history";

// Save/load user preferences
function saveBettingPreferences(prefs: { isLive: boolean; activeTab: string }) {
	try {
		localStorage.setItem(BETTING_TABLE_PREFERENCES, JSON.stringify(prefs));
	} catch (error) {
		console.warn("Could not save betting preferences:", error);
	}
}

function loadBettingPreferences(): {
	isLive: boolean;
	activeTab: string;
} | null {
	try {
		const saved = localStorage.getItem(BETTING_TABLE_PREFERENCES);
		return saved ? JSON.parse(saved) : null;
	} catch (error) {
		console.warn("Could not load betting preferences:", error);
		return null;
	}
}

// Cache recent betting data for performance
function cacheBettingData(data: BettingRecord[]) {
	try {
		const cacheData = {
			data: data.slice(0, 20),
			timestamp: Date.now(),
		};
		localStorage.setItem(BETTING_HISTORY_CACHE, JSON.stringify(cacheData));
	} catch (error) {
		console.warn("Could not cache betting data:", error);
	}
}

function loadCachedBettingData(): BettingRecord[] {
	try {
		const cached = localStorage.getItem(BETTING_HISTORY_CACHE);
		if (cached) {
			const { data, timestamp } = JSON.parse(cached);
			const ageMinutes = (Date.now() - timestamp) / 1000 / 60;

			if (ageMinutes < 5) {
				return data;
			}
		}
	} catch (error) {
		console.warn("Could not load cached betting data:", error);
	}
	return [];
}

interface LiveBettingTableProps {
	className?: string;
}

export function LiveBettingTable({ className }: LiveBettingTableProps) {
	const t = useTranslations("betting.live");
	const [bettingData, setBettingData] = useState<BettingRecord[]>([]);
	const [activeTab, setActiveTab] = useState<"all" | "win" | "lose">("all");
	const [isLive, setIsLive] = useState(false);

	// Load preferences on mount
	useEffect(() => {
		const prefs = loadBettingPreferences();
		if (prefs) {
			setIsLive(Boolean(prefs.isLive));
			setActiveTab(prefs.activeTab as "all" | "win" | "lose");
		}

		const cachedData = loadCachedBettingData();
		if (cachedData.length > 0) {
			setBettingData(cachedData);
		}
	}, []);

	// Save preferences when they change
	useEffect(() => {
		saveBettingPreferences({ isLive, activeTab });
	}, [isLive, activeTab]);

	// Cache data periodically
	useEffect(() => {
		if (bettingData.length > 0) {
			const cacheInterval = setInterval(() => {
				cacheBettingData(bettingData);
			}, 60000);

			return () => clearInterval(cacheInterval);
		}
	}, [bettingData]);

	// Get real game data from store
	const gamesList = useAppStore((state) => state.game.list.games);
	const gamesStatus = useAppStore((state) => state.game.list.status);
	const initializeGameList = useAppStore(
		(state) => state.game.list.initializeGameList
	);

	// Initialize game data if not loaded
	useEffect(() => {
		if (gamesStatus === "idle") {
			initializeGameList();
		}
	}, [gamesStatus, initializeGameList]);

	// Enhanced statistics with motivation focus
	const [stats, setStats] = useState({
		totalBets: 0,
		totalWinAmount: 0,
		totalLossAmount: 0,
		winRate: 0,
		avgBet: 0,
		biggestWin: 0,
		recentWins: 0,
		bigWinsToday: 0,
		totalPayout: 0,
	});

	// Update statistics when data changes
	useEffect(() => {
		if (bettingData.length === 0) return;

		const recentData = bettingData.slice(0, 100);
		const wins = recentData.filter((r) => r.status === "win");
		const losses = recentData.filter((r) => r.status === "lose");
		const bigWins = wins.filter((w) => w.profit >= 100);

		const totalWinAmount = wins.reduce((sum, r) => sum + r.profit, 0);
		const totalLossAmount = Math.abs(
			losses.reduce((sum, r) => sum + Math.abs(r.bet), 0)
		);
		const totalBetAmount = recentData.reduce((sum, r) => sum + r.bet, 0);
		const winRate =
			recentData.length > 0 ? (wins.length / recentData.length) * 100 : 0;
		const avgBet =
			recentData.length > 0 ? totalBetAmount / recentData.length : 0;
		const biggestWin = Math.max(...wins.map((r) => r.profit), 0);
		const recentWins = bettingData
			.slice(0, 10)
			.filter((r) => r.status === "win").length;
		const totalPayout = totalWinAmount;

		setStats({
			totalBets: recentData.length,
			totalWinAmount,
			totalLossAmount,
			winRate,
			avgBet,
			biggestWin,
			recentWins,
			bigWinsToday: bigWins.length,
			totalPayout,
		});
	}, [bettingData]);

	// Initialize with some data
	useEffect(() => {
		const initialData = Array.from({ length: INITIAL_RECORD_COUNT }, () =>
			generateBettingRecord(gamesList)
		).sort((a, b) => b.timestamp - a.timestamp);
		setBettingData(initialData);
	}, [gamesList]);

	// Enhanced live data generation with burst activity and big win events
	useEffect(() => {
		if (!isLive) return;

		const getUpdateInterval = () => {
			const hour = new Date().getHours();
			if (hour >= 22 || hour <= 2) return 1600; // Faster during late night
			if (hour >= 18 && hour <= 21) return 1800; // Evening peak
			if (hour >= 9 && hour <= 17) return 2200; // Business hours
			return 2000;
		};

		const interval = setInterval(() => {
			const burstChance = Math.random();
			let recordsToAdd = 1;

			if (burstChance < 0.05) recordsToAdd = 3;
			else if (burstChance < 0.15) recordsToAdd = 2;

			const newRecords = Array.from({ length: recordsToAdd }, () =>
				generateBettingRecord(gamesList)
			);

			setBettingData((prev) => {
				const updated = [...newRecords, ...prev];
				return updated.slice(0, MAX_TABLE_RECORDS);
			});
		}, getUpdateInterval());

		return () => clearInterval(interval);
	}, [isLive, gamesList]);

	// Filter data based on active tab
	const filteredData = useMemo(() => {
		switch (activeTab) {
			case "win":
				return bettingData.filter((record) => record.status === "win");
			case "lose":
				return bettingData.filter((record) => record.status === "lose");
			default:
				return bettingData;
		}
	}, [bettingData, activeTab]);

	// Enhanced status badge with more celebration for big wins
	const getStatusBadge = useCallback(
		(status: BettingRecord["status"], profit: number) => {
			const baseClasses =
				"font-semibold text-xs px-2 py-1 transition-all duration-300";

			switch (status) {
				case "win":
					const isBigWin = profit >= 50; // Lowered threshold
					const isMegaWin = profit >= 200; // Lowered threshold
					const isJackpot = profit >= 500; // Lowered threshold
					const isSuperJackpot = profit >= 1000;

					return (
						<Badge
							className={cn(
								baseClasses,
								"bg-green-500/20 text-green-400 border-green-500/30",
								"hover:bg-green-500/30 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20",
								isBigWin &&
								"bg-yellow-500/25 text-yellow-300 border-yellow-500/40 animate-pulse",
								isMegaWin &&
								"bg-orange-500/25 text-orange-300 border-orange-500/40 animate-pulse shadow-lg shadow-orange-500/30",
								isJackpot &&
								"bg-red-500/25 text-red-300 border-red-500/40 animate-pulse shadow-lg shadow-red-500/50",
								isSuperJackpot &&
								"bg-purple-500/25 text-purple-300 border-purple-500/40 animate-pulse shadow-xl shadow-purple-500/60"
							)}
						>
							<span className="flex items-center gap-1">
								{isSuperJackpot && (
									<span className="text-purple-200 animate-bounce">
										💎
									</span>
								)}
								{isJackpot && !isSuperJackpot && (
									<span className="text-red-200 animate-bounce">
										🎰
									</span>
								)}
								{isMegaWin && !isJackpot && (
									<span className="text-orange-200">💰</span>
								)}
								{isBigWin && !isMegaWin && (
									<span className="text-yellow-200">⭐</span>
								)}
								<span className="text-green-300">+</span>
								{profit.toFixed(2)}
								{isSuperJackpot && (
									<span className="text-purple-200 animate-ping">
										✨
									</span>
								)}
								{isJackpot && !isSuperJackpot && (
									<span className="text-red-200 animate-bounce">
										🔥
									</span>
								)}
							</span>
						</Badge>
					);
				case "lose":
					return (
						<Badge
							className={cn(
								baseClasses,
								"bg-red-500/20 text-red-400 border-red-500/30",
								"hover:bg-red-500/30"
							)}
						>
							<span className="flex items-center gap-1">
								<span className="text-red-300">0.00</span>
							</span>
						</Badge>
					);
				case "processing":
					return (
						<Badge
							className={cn(
								baseClasses,
								"bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse",
								"hover:bg-yellow-500/30"
							)}
						>
							<span className="flex items-center gap-1">
								<div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" />
								<div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce animation-delay-150" />
								<div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce animation-delay-300" />
								<span className="ml-1">Processing</span>
							</span>
						</Badge>
					);
				default:
					return null;
			}
		},
		[]
	);

	// Enhanced multiplier display
	const getMultiplierDisplay = useCallback(
		(multiplier: number | string, status: BettingRecord["status"]) => {
			if (multiplier === "FreeSpin") {
				return (
					<Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-semibold hover:bg-purple-500/30 transition-all duration-300 hover:scale-105">
						<span className="flex items-center gap-1">
							<div className="w-1 h-1 bg-purple-400 rounded-full animate-ping" />
							FreeSpin
						</span>
					</Badge>
				);
			}

			const isHighMultiplier =
				typeof multiplier === "number" && multiplier >= 5;
			const isMegaMultiplier =
				typeof multiplier === "number" && multiplier >= 50;
			const isWinning = typeof multiplier === "number" && multiplier > 1;

			const colorClass = isWinning
				? isMegaMultiplier
					? "text-purple-400 font-semibold animate-pulse"
					: isHighMultiplier
						? "text-yellow-400 font-semibold"
						: "text-green-400 font-semibold"
				: status === "processing"
					? "text-yellow-400"
					: "text-red-400";

			return (
				<span
					className={cn(
						"font-mono transition-all duration-300",
						colorClass,
						isHighMultiplier && "shadow-lg",
						isMegaMultiplier && "shadow-xl shadow-purple-500/50"
					)}
				>
					{typeof multiplier === "number"
						? `${multiplier.toFixed(2)}x`
						: multiplier}
				</span>
			);
		},
		[]
	);

	return (
		<div className={cn("w-full space-y-4", className)}>
			{/* Enhanced Stats Cards with motivational metrics */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-3">
					<div className="text-xs text-muted-foreground">
						{t("winRate")}
					</div>
					<div
						className={cn(
							"text-lg font-semibold",
							stats.winRate >= 40
								? "text-green-400"
								: stats.winRate >= 30
									? "text-yellow-400"
									: "text-red-400"
						)}
					>
						{stats.winRate.toFixed(1)}%
					</div>
				</div>
				<div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-3">
					<div className="text-xs text-muted-foreground">
						{t("biggestWin")}
					</div>
					<div className="text-lg font-semibold text-yellow-400">
						+{stats.biggestWin.toFixed(2)}
						{stats.biggestWin >= 1000 && (
							<span className="text-purple-400 ml-1">💎</span>
						)}
						{stats.biggestWin >= 500 && stats.biggestWin < 1000 && (
							<span className="text-red-400 ml-1">🔥</span>
						)}
					</div>
				</div>
				<div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-3">
					<div className="text-xs text-muted-foreground">
						{t("bigWins50")}
					</div>
					<div className="text-lg font-semibold text-orange-400">
						{stats.bigWinsToday}
					</div>
				</div>
				<div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-3">
					<div className="text-xs text-muted-foreground">
						{t("recentWins")}
					</div>
					<div className="text-lg font-semibold text-green-400">
						{stats.recentWins}/10
					</div>
				</div>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						{t("header.title")}
					</h2>
					<p className="text-muted-foreground text-sm">
						{t("header.subtitle", { count: gamesList.length })}
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"w-2 h-2 rounded-full animate-pulse",
								isLive ? "bg-green-500" : "bg-red-500"
							)}
						/>
						<span className="text-sm font-medium">
							{isLive ? t("status.live") : t("status.paused")}
						</span>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsLive(!isLive)}
						className="text-xs"
					>
						{isLive ? t("actions.pause") : t("actions.resume")}
					</Button>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={(value) =>
					setActiveTab(value as typeof activeTab)
				}
			>
				<TabsList className="grid w-full grid-cols-3 max-w-md">
					<TabsTrigger value="all" className="text-xs">
						{t("tabs.all")} ({bettingData.length})
					</TabsTrigger>
					<TabsTrigger value="win" className="text-xs">
						{t("tabs.wins")} (
						{bettingData.filter((r) => r.status === "win").length})
					</TabsTrigger>
					<TabsTrigger value="lose" className="text-xs">
						{t("tabs.losses")} (
						{bettingData.filter((r) => r.status === "lose").length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="mt-4">
					{/* Table Container with Glass Effect */}
					<div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

						{/* Table */}
						<div className="relative max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
							<Table>
								<TableHeader className="sticky top-0 bg-background/80 backdrop-blur-md z-10">
									<TableRow className="border-border/50">
										<TableHead className="font-semibold text-foreground">
											{t("table.game")}
										</TableHead>
										<TableHead className="font-semibold text-foreground">
											{t("table.time")}
										</TableHead>
										<TableHead className="font-semibold text-foreground">
											{t("table.provider")}
										</TableHead>
										<TableHead className="font-semibold text-foreground">
											{t("table.nickname")}
										</TableHead>
										<TableHead className="font-semibold text-foreground text-right">
											{t("table.bet")}
										</TableHead>
										<TableHead className="font-semibold text-foreground text-center">
											{t("table.multiplier")}
										</TableHead>
										<TableHead className="font-semibold text-foreground text-right">
											{t("table.profit")}
										</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{filteredData.map((record, index) => (
										<TableRow
											key={record.id}
											className={cn(
												"hover:bg-primary/5 transition-all duration-300 border-border/30",
												index === 0 &&
												isLive &&
												"animate-pulse bg-primary/10 shadow-md",
												record.status === "win" &&
												record.profit >= 50 &&
												"bg-gradient-to-r from-green-500/10 to-yellow-500/10",
												record.status === "win" &&
												record.profit < 50 &&
												"bg-green-500/5 hover:bg-green-500/10",
												record.status === "lose" &&
												"bg-red-500/5 hover:bg-red-500/10",
												record.status ===
												"processing" &&
												"bg-yellow-500/5 hover:bg-yellow-500/10 animate-pulse"
											)}
											style={{
												animationDelay: `${index * 50
													}ms`,
											}}
										>
											<TableCell className="font-medium">
												<span className="text-foreground">
													{record.gameName}
												</span>
											</TableCell>

											<TableCell>
												<div className="flex items-center gap-2">
													<span className="font-mono text-sm text-muted-foreground">
														{record.time}
													</span>
													{index === 0 && isLive && (
														<div className="flex items-center gap-1">
															<div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
															<span className="text-xs text-green-500 font-medium">
																{t(
																	"status.live"
																)}
															</span>
														</div>
													)}
												</div>
											</TableCell>

											<TableCell>
												<Badge
													variant="secondary"
													className="text-xs transition-all duration-300 hover:scale-105 hover:shadow-md"
												>
													{record.provider}
												</Badge>
											</TableCell>

											<TableCell>
												<span className="text-muted-foreground font-medium hover:text-foreground transition-colors duration-300">
													{record.nickname}
												</span>
											</TableCell>

											<TableCell className="text-right">
												<span
													className={cn(
														"font-mono font-semibold transition-all duration-300",
														record.bet >= 50 &&
														"text-yellow-400 font-semibold",
														record.bet >= 200 &&
														"text-orange-400 font-semibold",
														record.bet >= 500 &&
														"text-red-400 font-semibold animate-pulse",
														record.bet >= 1000 &&
														"text-purple-400 font-semibold animate-pulse shadow-lg shadow-purple-400/30"
													)}
												>
													{record.bet >= 1000 && (
														<span className="inline-flex items-center gap-1">
															<span className="w-1 h-1 bg-purple-400 rounded-full animate-ping" />
															🐋
															<span className="ml-1">
																{record.bet.toFixed(
																	2
																)}
															</span>
														</span>
													)}
													{record.bet < 1000 &&
														record.bet.toFixed(2)}
												</span>
											</TableCell>

											<TableCell className="text-center">
												{getMultiplierDisplay(
													record.multiplier,
													record.status
												)}
											</TableCell>

											<TableCell className="text-right">
												{getStatusBadge(
													record.status,
													record.profit
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{filteredData.length === 0 && (
								<div className="flex items-center justify-center py-12">
									<p className="text-muted-foreground">
										{t("empty")}
									</p>
								</div>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
