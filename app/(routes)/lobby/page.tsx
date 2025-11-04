"use client";

import { useAppStore } from "@/store/store";
import { TransactionModal } from "@/components/features/walletProvider/transaction-modal";
import { ProfileInfoCard } from "@/components/features/profile/profile-info-card";
import { ProfileInfoCardSkeleton } from "@/components/features/profile/profile-info-card-skeleton";
import { GameCarouselSection } from "@/components/features/games/game-carousel-section";
import { GameCarouselSkeleton } from "@/components/features/games/game-carousel-skeleton";
import { ExploreSection } from "@/components/features/games/explore-section";
import { LiveBettingTable } from "@/components/features/betting/live-betting-table";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
// import {
// 	CastleIcon,
// 	DollarSign,
// 	FlameIcon,
// 	Goal,
// 	Heart,
// 	Tv,
// } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import favoritesService from "@/services/favoritesService";
import type { Game } from "@/types/games/gameList.types";
import { DynamicProviderCarousel } from "@/components/features/providers/dynamic-provider-carousel";
import { useT } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";
import {
	faFireFlameCurved,
	faSlotMachine,
	faTv,
} from "@fortawesome/pro-light-svg-icons";
import { LobbySlider } from "@/components/common/banners/slider/lobby-slider";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";

// Mock data for hero banner
const heroImages = [
	"/assets/banners/lobby/deposit-2.png",
	"/assets/banners/lobby/refer-2.png",
];

const heroReferralLinks = ["deposit", "affiliate"];

export default function LobbyPage() {
	const t = useT();
	const router = useRouter();
	const { primaryWallet } = useDynamicContext();
	const {
		isLoggedIn,
		isLoading: isAuthLoading,
		isAuthCheckComplete,
	} = useDynamicAuth();

	const primaryWalletAddress = primaryWallet?.address || "";

	// Use ref to track if redirect is in progress to prevent multiple redirects
	const redirectInProgress = useRef(false);
	const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Redirect guests back to home once auth state is resolved
	// CRITICAL FIX: Wait for both auth loading AND auth check to complete
	// This prevents false redirects during rapid page refreshes
	useEffect(() => {
		// Cleanup timer on unmount
		return () => {
			if (redirectTimerRef.current) {
				clearTimeout(redirectTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		// Don't make any routing decisions until auth is fully initialized
		if (isAuthLoading || !isAuthCheckComplete) {
			// Clear any pending redirect if auth state changes
			if (redirectTimerRef.current) {
				clearTimeout(redirectTimerRef.current);
				redirectTimerRef.current = null;
			}
			return;
		}

		// If user is logged in, ensure redirect flag is cleared
		if (isLoggedIn) {
			redirectInProgress.current = false;
			if (redirectTimerRef.current) {
				clearTimeout(redirectTimerRef.current);
				redirectTimerRef.current = null;
			}
			return;
		}

		// Only redirect if user is definitively NOT logged in
		// AND we haven't already started a redirect
		if (!isLoggedIn && !redirectInProgress.current) {
			redirectInProgress.current = true;

			// Add small delay to ensure auth state is stable (prevents false positives during rapid refreshes)
			redirectTimerRef.current = setTimeout(() => {
				// Double-check auth state before actually redirecting
				if (!isLoggedIn) {
					router.replace("/");
				}
			}, 100);
		}
	}, [isAuthLoading, isAuthCheckComplete, isLoggedIn, router]);

	// Get game data from store
	const allGames = useAppStore((state) => state.game.list.games);
	const gameStatus = useAppStore((state) => state.game.list.status);

	// Use real game data instead of dummy data (memoized for stable deps)
	const simpleGames = useMemo(() => allGames || [], [allGames]);

	// Filter games by categories (memoized for stability)
	const casinoGames = useMemo(
		() =>
			simpleGames.filter(
				(game) =>
					game.own_game_type === "LIVE CASINO" ||
					game.own_game_type === "Live Casino" ||
					game.own_game_type === "RNG"
			),
		[simpleGames]
	);

	const slotGames = useMemo(
		() => simpleGames.filter((game) => game.own_game_type === "SLOT"),
		[simpleGames]
	);

	const sportsGames = useMemo(
		() => simpleGames.filter((game) => game.own_game_type === "SPORT BOOK"),
		[simpleGames]
	);

	// Favorite games - read from mw_favorite_games (localStorage) and map to real games
	const [favoriteIds, setFavoriteIds] = useState<Array<number | string>>([]);

	useEffect(() => {
		const load = () => setFavoriteIds(favoritesService.getAll());
		load();
		const off = favoritesService.onChange(load);
		return () => off();
	}, []);

	const favoriteGames = useMemo((): Game[] => {
		if (!favoriteIds?.length || !simpleGames?.length) return [] as Game[];
		// Extract games that match the stored favorite keys (gameId_gameName format)
		const favGameIds = favoriteIds
			.map((id) => {
				const idStr = String(id);
				// Find games that match the stored key format: gameId_gameName
				return simpleGames.find(
					(g) => idStr === `${g.game_id}_${g.game_name}`
				);
			})
			.filter(Boolean);
		return favGameIds as Game[];
	}, [favoriteIds, simpleGames]);

	// Popular games - stabilized using useMemo (shuffles only when inputs change)
	const popularGames = useMemo(() => {
		if (simpleGames.length === 0) return [] as Game[];

		const mixedGames = [
			...casinoGames.slice(0, 3),
			...slotGames.slice(0, 4),
			...sportsGames.slice(0, 2),
			...simpleGames
				.filter(
					(game) =>
						!casinoGames.includes(game) &&
						!slotGames.includes(game) &&
						!sportsGames.includes(game)
				)
				.slice(0, 1),
		];

		// Shuffle once and cap length; will remain stable until deps change
		return mixedGames
			.sort(() => Math.random() - 0.5)
			.slice(0, 10) as Game[];
	}, [simpleGames, casinoGames, slotGames, sportsGames]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Decorative background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/3 rounded-full blur-2xl"></div>
			</div>

			<div className="relative space-y-12 pb-8">
				{/* Welcome Section for logged in users */}
				{/* {primaryWalletAddress && (
					<div className="text-center py-8 px-4">
						<h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
							Welcome to the Casino
						</h1>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							Experience the thrill of gaming with our premium collection of casino games, slots, and sports betting.
						</p>
					</div>
				)} */}

				{/* Header Section - Only visible if user is logged in */}
				{primaryWalletAddress && (
					<div className="">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6  mx-auto">
							{/* Transaction Modal - 50% space in desktop */}
							<div className="w-full">
								<div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
									<TransactionModal
										displayType="tabbed-view"
										isLobbyPage
									/>
								</div>
							</div>

							{/* Profile Info Card - 50% space in desktop */}
							<div className="w-full">
								{primaryWalletAddress ? (
									<ProfileInfoCard />
								) : (
									<ProfileInfoCardSkeleton />
								)}
							</div>
						</div>
					</div>
				)}

				{/* Favorite Games Section */}
				<section>
					<div className=" mx-auto">
						{gameStatus === "loading" || gameStatus === "idle" ? (
							<GameCarouselSkeleton showTitle={true} />
						) : (
							<div className="space-y-6">
								<GameCarouselSection
									games={favoriteGames}
									title={t("lobby.yourFavorites")}
									showTitle={true}
									showViewAll={false}
									icon={faFireFlameCurved}
								/>
							</div>
						)}
					</div>
				</section>

				{/* Games Section */}
				<div className="space-y-16">
					{/* Featured Casino Games */}
					<section className="">
						<div className=" mx-auto">
							{gameStatus === "loading" ||
							gameStatus === "idle" ? (
								<GameCarouselSkeleton showTitle={true} />
							) : (
								<div className="space-y-6">
									<DynamicProviderCarousel
										Icon={faTv}
										title={t("lobby.featuredCasinoGames")}
										maxProviders={20}
									/>
									{/* <GameCarouselSection
                    games={casinoGames.slice(0, 8)}
                    title="Featured Casino Games"
                    showTitle={true}
                    showViewAll={false}
                    icon={CastleIcon}
                  /> */}
								</div>
							)}
						</div>
					</section>

					{/* Hero Banner Slider Section */}
					<section className="">
						<div className=" mx-auto">
							<div className="rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
								<LobbySlider
									imageUrls={heroImages}
									referralLinks={heroReferralLinks}
								/>
							</div>
						</div>
					</section>

					{/* Popular Games - Mixed Collection */}
					<section className="">
						<div className=" mx-auto">
							{gameStatus === "loading" ||
							gameStatus === "idle" ? (
								<GameCarouselSkeleton showTitle={true} />
							) : (
								popularGames.length > 0 && (
									<div className="space-y-6">
										<GameCarouselSection
											games={popularGames}
											title={t("lobby.hotPicks")}
											showTitle={true}
											showViewAll={false}
											icon={faFireFlameCurved}
										/>
									</div>
								)
							)}
						</div>
					</section>

					{/* Slot Games */}
					<section className="">
						<div className=" mx-auto">
							{gameStatus === "loading" ||
							gameStatus === "idle" ? (
								<GameCarouselSkeleton showTitle={true} />
							) : (
								slotGames.length > 0 && (
									<div className="space-y-6">
										<GameCarouselSection
											games={slotGames.slice(0, 10)}
											title={t("lobby.slots")}
											showTitle={true}
											showViewAll={false}
											icon={faSlotMachine}
										/>
									</div>
								)
							)}
						</div>
					</section>

					{/* Explore Games Section - Replaces Sports */}
					<section className="">
						<div className=" mx-auto">
							<ExploreSection />
						</div>
					</section>

					{/* Live Betting Activity */}
					<section className="">
						<div className=" mx-auto">
							<div className="text-left mb-6">
								<h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
									{t("lobby.realTimeScoreboard")}
								</h2>
								{/* <p className="text-muted-foreground">Real-time betting activity and recent wins</p> */}
							</div>
							<div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-lg">
								<LiveBettingTable />
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
