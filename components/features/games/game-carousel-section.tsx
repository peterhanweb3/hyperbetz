"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Game } from "@/types/games/gameList.types";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { GameCard } from "./game-carousel-card";
// import { Flame } from "lucide-react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faFireFlameCurved } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Simple game interface for games-list-carousel functionality
interface SimpleGame {
	id: string;
	title: string;
	image: string;
	category: string;
	rating?: number;
	isNew?: boolean;
	isPopular?: boolean;
	href: string;
}

interface GameCarouselSectionProps {
	// Unified props - can accept either Game[] or SimpleGame[]
	category?: string;
	games?: Game[] | SimpleGame[];
	title?: string;
	showTitle?: boolean;
	showViewAll?: boolean;
	viewAllUrl?: string; // Optional manual override for view all URL
	icon?: IconDefinition;
	onViewAllClick?: () => void; // Optional callback when View All is clicked
}

export const GameCarouselSection = ({
	category,
	games = [],
	title = "Featured Games",
	showTitle = true,
	showViewAll = true,
	viewAllUrl, // New optional prop
	icon: Icon = faFireFlameCurved,
	onViewAllClick, // New callback prop
}: GameCarouselSectionProps) => {
	const tCommon = useTranslations("common");
	// Use title if provided, otherwise use category, fallback to default
	const displayTitle = title || category || "Featured Games";

	if (!games || games.length === 0) {
		return null;
	}

	// Create view all URL for original functionality or use manual override
	const getViewAllUrl = () => {
		// If viewAllUrl is manually provided, use it
		if (viewAllUrl) return viewAllUrl;

		if (!category) return "/games";
		const params = new URLSearchParams();
		params.set("category", category);
		return `/games?${params.toString()}`;
	};

	// Helper function to check if a game is SimpleGame
	const isSimpleGame = (game: Game | SimpleGame): game is SimpleGame => {
		return "id" in game && "title" in game;
	};

	// Helper function to convert SimpleGame to Game format for GameCard compatibility
	const normalizeGame = (game: Game | SimpleGame): Game => {
		if (isSimpleGame(game)) {
			return {
				game_id: game.id,
				game_name: game.title,
				own_game_image: game.image,
				full_url_game_image: game.image,
				own_game_type: game.category as Game["own_game_type"],
				vendor_name: "SIMPLE" as Game["vendor_name"],
				provider_name: "Mock Provider" as Game["provider_name"],
				gp_id: 0,
				category: game.category as Game["category"],
			};
		}
		return game as Game;
	};

	// Normalize all games to Game format
	const MAX_VISIBLE_GAMES = 12;
	const limitedGames = games.slice(0, MAX_VISIBLE_GAMES);
	const normalizedGames = limitedGames.map(normalizeGame);

	// Group games into batches of 4 for mobile 2x2 grid
	const groupGamesForMobile = (games: Game[]) => {
		const groups = [];
		for (let i = 0; i < games.length; i += 4) {
			groups.push(games.slice(i, i + 4));
		}
		return groups;
	};

	const mobileGameGroups = groupGamesForMobile(normalizedGames);
	const finalViewAllUrl = getViewAllUrl();

	return (
		<div className="w-full mb-6 mt-2">
			{/* Mobile Carousel: 2x2 grid layout */}
			<div className="sm:hidden">
				<Carousel
					opts={{
						align: "start",
						loop: true,
					}}
					className="w-full"
				>
					{/* SECTION HEADER WITH CONTROLS */}
					<div className="flex items-center justify-between mb-4">
						{showTitle && (
							<div className="flex items-center gap-3">
								{/* <Icon className="h-6 w-6 text-primary" /> */}
								<FontAwesomeIcon
									icon={Icon}
									className="h-6 w-6 text-primary"
								/>
								<h2 className="text-2xl font-semibold tracking-tight capitalize">
									{displayTitle.toLowerCase()}
								</h2>
							</div>
						)}
						{!showTitle && <div />}{" "}
						{/* Spacer when title is hidden */}
						<div className="flex items-center gap-2">
							<CarouselPrevious className="relative top-0 left-0 right-0 h-9 w-9 translate-y-0" />
							<CarouselNext className="relative top-0 left-0 right-0 h-9 w-9 translate-y-0" />
							{showViewAll && (
								<Button asChild variant="outline">
									<Link
										href={finalViewAllUrl}
										onClick={() => onViewAllClick?.()}
									>
										{tCommon("viewAll")}
									</Link>
								</Button>
							)}
						</div>
					</div>

					<CarouselContent className="-ml-2">
						{mobileGameGroups.map((group, groupIndex) => (
							<CarouselItem
								key={`group-${groupIndex}`}
								className="pl-2 basis-full"
							>
								<div className="grid grid-cols-2 gap-4">
									{group.map((game, idx) => (
										<div
											key={`${game.game_id}-${game.game_name}-${idx}`}
										>
											<GameCard game={game} />
										</div>
									))}
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			{/* Desktop Carousel: Original horizontal layout */}
			<div className="hidden sm:block">
				<Carousel
					opts={{
						align: "start",
						loop: true,
					}}
					className="w-full"
				>
					{/* SECTION HEADER WITH CONTROLS */}
					<div className="flex items-center justify-between mb-4">
						{showTitle && (
							<div className="flex items-center gap-3">
								<FontAwesomeIcon
									icon={Icon}
									fontSize={24}
									className="text-primary"
								/>
								<h2 className="text-2xl font-semibold tracking-tight capitalize">
									{displayTitle.toLowerCase()}
								</h2>
							</div>
						)}
						{!showTitle && <div />}{" "}
						{/* Spacer when title is hidden */}
						<div className="flex items-center gap-2">
							<CarouselPrevious className="relative top-0 left-0 right-0 h-9 w-9 translate-y-0" />
							<CarouselNext className="relative top-0 left-0 right-0 h-9 w-9 translate-y-0" />
							{showViewAll && (
								<Button asChild variant="outline">
									<Link
										href={finalViewAllUrl}
										onClick={() => onViewAllClick?.()}
									>
										{tCommon("viewAll")}
									</Link>
								</Button>
							)}
						</div>
					</div>

					<CarouselContent className="-ml-4">
						{normalizedGames.map((game, idx) => (
							<CarouselItem
								key={`${game.game_id}-${game.game_name}-${idx}`}
								className="pl-4 basis-1/2 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 3xl:basis-1/8"
							>
								<GameCard game={game} />
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		</div>
	);
};
