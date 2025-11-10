"use client";

import { useAppStore } from "@/store/store";
import { useTranslations } from "@/lib/locale-provider";
import {
	getGamesByCategory,
	getUniqueValuesByKey,
} from "@/lib/utils/games/games.utils";
import { GameCarouselSection } from "./game-carousel-section"; // Still using the dumb component for rendering
import { ExploreSection } from "./explore-section"; // New Explore section component
import { Skeleton } from "@/components/ui/skeleton"; // Using ShadCN Skeleton for a better loading state
// import { Crown, Gamepad2, Spade } from "lucide-react";
import {
	faCards,
	faFutbol,
	faSlotMachine,
} from "@fortawesome/pro-light-svg-icons";

/**
 * This "smart" component is the new, truly modular "Lego brick".
 * It contains all the logic necessary to fetch, categorize, and display
 * the entire list of game carousels.
 *
 * It can now be dropped onto any page (home, promotions, etc.) and will "just work".
 */
export const DynamicGameCarouselList = () => {
	// 1. All data fetching and state access happens HERE.
	const allGames = useAppStore((state) => state.game.list.games);
	const status = useAppStore((state) => state.game.list.status);

	const t = useTranslations("games");
	// 2. It handles its own loading and error states.
	if (status === "loading" || status === "idle") {
		// A better UX using skeletons. Render 3 placeholder sections.
		return (
			<div className="space-y-12">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="w-full">
						<Skeleton className="h-8 w-48 mb-4" />
						<div className="flex space-x-4">
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (status === "error") {
		return (
			<p className="text-center p-10 text-destructive">
				{t("errorLoading")}
			</p>
		);
	}

	// 3. All data transformation logic is encapsulated HERE.
	const gameCategories = getUniqueValuesByKey(allGames, "category");

	// Filter out sports categories to replace with Explore section
	const filteredCategories = gameCategories.filter(
		(category) => category !== "SPORTSBOOK" && category !== "SPORT BOOK"
	);

	return (
		<>
			{/* Add Explore Section */}
			<ExploreSection />

			{filteredCategories.map((category) => {
				//if name = "-" then skip
				if (category === "-") return null;
				const gamesForCategory = getGamesByCategory(
					allGames,
					category,
					12
				);
				const categoryName = (() => {
					if (category === "SLOT") return t("slots");
					if (category === "LIVE CASINO") return t("liveCasino");
					return category.charAt(0).toUpperCase() + category.slice(1);
				})();
				if (category === "SLOT") {
					return (
						<GameCarouselSection
							key={category}
							category={category}
							games={gamesForCategory}
							title={t("slots")}
							icon={faSlotMachine}
						/>
					);
				}
				if (category === "LIVE CASINO") {
					return (
						<GameCarouselSection
							key={category}
							category={category}
							games={gamesForCategory}
							title={t("liveCasino")}
							icon={faCards}
						/>
					);
				}
				return (
					<GameCarouselSection
						key={category}
						category={category}
						games={gamesForCategory}
						title={categoryName}
						icon={faFutbol}
					/>
				);
			})}
		</>
	);
};
