"use client";
import { Game } from "@/types/games/gameList.types";
// import { Play, Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faHeart } from "@fortawesome/pro-light-svg-icons";
import { faHeart as heartAlt } from "@fortawesome/pro-solid-svg-icons";
import favoritesService from "@/services/favoritesService";
import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";

interface GameCardProps {
	game: Game;
	showProvider?: boolean; // Optional prop to control provider display
	showCategory?: boolean; // Optional prop to control category display
}

/**
 * Enhanced play button with smooth animations
 */
const PlayButton = () => {
	return (
		<div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out">
			{/* Pulsating shadow layers */}
			<div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>
			<div className="absolute inset-0 rounded-full bg-primary animate-pulse opacity-50 scale-110"></div>
			<div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-25 scale-125 animation-delay-150"></div>

			{/* Main button */}
			<Button
				variant="default"
				size="icon"
				className="h-12 w-12 cursor-pointer rounded-full relative z-10 shadow-lg shadow-primary/50"
			>
				<FontAwesomeIcon
					icon={faPlay}
					className="h-6 w-6 fill-current"
				/>
			</Button>
		</div>
	);
};

const GameCardComponent = ({
	game,
	showProvider = false,
	showCategory = false,
}: GameCardProps) => {
	const { isLoggedIn } = useDynamicAuth();
	const { setShowAuthFlow } = useDynamicContext();
	const [fav, setFav] = useState(false);
	useEffect(() => {
		const gameKey = `${game.game_id}_${game.game_name}`;
		setFav(favoritesService.isFavorite(gameKey));
		const off = favoritesService.onChange(() =>
			setFav(favoritesService.isFavorite(gameKey))
		);
		return off;
	}, [game.game_id, game.game_name]);
	// Construct the URL for the middleware page. Pass game details via query params.
	const queryParams = new URLSearchParams({
		vendor: game.vendor_name,
		gameType: game.own_game_type,
		gpId: String(game.gp_id),
	}).toString();

	const gameUrl = `/play/${game.game_id}?${queryParams}`;

	// Click handler for game card
	const handleCardClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();

			if (!isLoggedIn) {
				setShowAuthFlow(true);
				return;
			}
			window.open(gameUrl, "_blank", "noopener,noreferrer");
		},
		[isLoggedIn, setShowAuthFlow, gameUrl]
	);

	const toggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const gameKey = `${game.game_id}_${game.game_name}`;
		const next = favoritesService.toggle(gameKey);
		setFav(next);
	};

	return (
		<div className="group w-full h-full">
			{/* Modern card container with fixed height */}
			<div
				className="relative overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-border h-full flex flex-col"
				onClick={handleCardClick}
			>
				{/* Image container with modern aspect ratio */}
				<div className="relative aspect-[5/4.5] overflow-hidden flex-shrink-0">
					<Image
						src={`${game.full_url_game_image}`}
						alt={game.game_name}
						fill
						className="transition-transform duration-700 ease-out group-hover:scale-110"
						sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, (max-width: 1280px) 18vw, 240px"
						loading="lazy"
						quality={70}
					/>

					{/* Gradient overlay for better text readability */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

					{/* Play button overlay */}
					<PlayButton />

					{/* LIVE indicator */}
					{game.category == "LIVE CASINO" && (
						<div
							className={`absolute ${
								game.category == "LIVE CASINO" && showProvider
									? "bottom-3"
									: "top-3"
							} left-3`}
						>
							<div className="bg-red-600 rounded-lg px-2 py-1 shadow-lg flex items-center gap-1.5">
								<div className="w-1.5 h-1.5 bg-white rounded-full animate-play-pulse-alt " />
								<span className="text-xs font-semibold text-white uppercase tracking-wider">
									LIVE
								</span>
							</div>
						</div>
					)}

					{/* Provider badge - floating */}
					{showProvider && (
						<div className={"absolute top-3 left-3"}>
							<div className="bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-border/50">
								<span className="text-xs font-medium text-card-foreground uppercase tracking-wide">
									{game.provider_name}
								</span>
							</div>
						</div>
					)}
					{!showProvider && showCategory && (
						<div className="absolute top-3 left-20">
							<div className="bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-border/50">
								<span className="text-xs font-medium text-card-foreground uppercase tracking-wide">
									{game.category}
								</span>
							</div>
						</div>
					)}
					{/* Favorite toggle */}
					<button
						aria-label={fav ? "Remove favorite" : "Add favorite"}
						onClick={toggleFavorite}
						className={`absolute cursor-pointer top-3 right-3 rounded-full px-2 py-1 transition-colors border ${
							fav
								? "bg-primary text-foreground border-primary"
								: "bg-card/90 text-foreground border-border/50"
						}`}
					>
						{fav ? (
							<FontAwesomeIcon icon={heartAlt} />
						) : (
							<FontAwesomeIcon icon={faHeart} />
						)}
					</button>
				</div>

				{/* Enhanced Game info section with fixed height */}
				<div className="p-2 pt-3 bg-card/95 backdrop-blur-sm flex-1 flex flex-col justify-between ">
					{/* Game name with advanced styling */}
					<div className="flex-1 flex flex-col justify-center space-y-2">
						<div className="text-center">
							<h3 className="font-semibold text-base text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300  min-h-[2.5rem] flex items-center justify-center">
								{game.game_name}
							</h3>

							{/* Game category/type badge */}
							{/* {showCategory && (
								<div className="inline-flex items-center justify-center">
									<span className="text-xs text-muted-foreground font-medium uppercase tracking-widest px-2 py-1 mb-2 bg-muted/50 rounded-full border border-border/30">
										{game.category || "Casino"}
									</span>
								</div>
							)} */}
						</div>

						{/* Advanced bottom animation section */}
						<div className="flex items-center justify-center gap-2 pt-0">
							{/* Left decorative line */}
							<div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-right" />

							{/* Center diamond indicator */}
							<div className="w-2 h-2 bg-primary rotate-45 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-150 transform scale-0 group-hover:scale-100" />

							{/* Right decorative line */}
							<div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const GameCard = memo(
	GameCardComponent,
	(prev, next) =>
		prev.game.game_id === next.game.game_id &&
		prev.showProvider === next.showProvider &&
		prev.showCategory === next.showCategory
);
GameCard.displayName = "GameCard";
