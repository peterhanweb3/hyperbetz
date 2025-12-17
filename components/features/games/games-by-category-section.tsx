"use client";

import { useAppStore } from "@/store/store";
import { useTranslations } from "@/lib/locale-provider";
import {
	getGamesByCategory,
	getUniqueValuesByKey,
} from "@/lib/utils/games/games.utils";
import { GameCarouselSection } from "./game-carousel-section"; // Still using the dumb component for rendering
// import { Crown, Gamepad2, Spade } from "lucide-react";
import {
	faCards,
	faFutbol,
	faSlotMachine,
} from "@fortawesome/pro-light-svg-icons";
import DynamicGameCarouselListSkeleton from "../skeletons/games/games-by-category-section-skeleton";

/**
 * This "smart" component is the new, truly modular "Lego brick".
 * It contains all the logic necessary to fetch, categorize, and display
 * the entire list of game carousels.
 *
 * It can now be dropped onto any page (home, promotions, etc.) and will "just work".
 */
interface DynamicGameCarouselListProps {
	isLoading?: boolean;
}
export const DynamicGameCarouselList = ({
	isLoading,
}: DynamicGameCarouselListProps) => {
	// 1. All data fetching and state access happens HERE.
	const allGames = useAppStore((state) => state.game.list.games);
	const status = useAppStore((state) => state.game.list.status);

	const t = useTranslations("games");
	// 2. It handles its own loading and error states.
	if (typeof isLoading !== "undefined") {
		if (isLoading) {
			return (
				<DynamicGameCarouselListSkeleton
					totalRows={3}
					totalColumns={5}
				/>
			);
		}
	}

	// Priority 2 → fallback to Zustand status only if isLoading is absent
	if (
		typeof isLoading === "undefined" &&
		(status === "loading" || status === "idle")
	) {
		return (
			<DynamicGameCarouselListSkeleton totalRows={3} totalColumns={5} />
		);
	}
	if (typeof isLoading === "undefined" && status === "error") {
		return (
			<p className="text-center p-10 text-destructive">
				{t("errorLoading")}
			</p>
		);
	}

	// 3. All data transformation logic is encapsulated HERE.
	const gameCategories = getUniqueValuesByKey(allGames, "category");

	// Reorder categories: Slots, Live Casino, Sports, then rest
	const orderedCategories = gameCategories.filter((cat) => cat !== "-");
	const slots = orderedCategories.filter((cat) => cat === "SLOT");
	const liveCasino = orderedCategories.filter((cat) => cat === "LIVE CASINO");
	const sports = orderedCategories.filter(
		(cat) => cat === "SPORTSBOOK" || cat === "SPORT BOOK"
	);
	const others = orderedCategories.filter(
		(cat) =>
			cat !== "SLOT" &&
			cat !== "LIVE CASINO" &&
			cat !== "SPORTSBOOK" &&
			cat !== "SPORT BOOK"
	);
	const finalCategories = [...slots, ...liveCasino, ...sports, ...others];

	return (
		<>
			{/* Add Explore Section */}

			{finalCategories.map((category) => {
				const gamesForCategory = getGamesByCategory(
					allGames,
					category,
					12
				);

				const categoryName = (() => {
					if (category === "SLOT") return t("slots");
					if (category === "LIVE CASINO") return t("liveCasino");
					if (category === "SPORTS" || category === "SPORT BOOK")
						return t("sports");
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
				if (category === "SPORTSBOOK" || category === "SPORT BOOK") {
					return (
						<GameCarouselSection
							key={category}
							category={category}
							games={gamesForCategory}
							title="Sports"
							icon={faFutbol}
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
