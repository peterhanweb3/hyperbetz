"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
// import { Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/pro-light-svg-icons";
import { Game } from "@/types/games/gameList.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import favoritesService from "@/services/favoritesService";
import { nanoid } from "nanoid";

type GameGridProps = {
	games: Game[];
	onItemClick?: (game: Game) => void;
	dense?: boolean;
};

export function GameGrid({ games, onItemClick, dense = false }: GameGridProps) {
	return (
		<div
			className={
				dense
					? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
					: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
			}
		>
			{games.map((g) => (
				<GameGridItem
					key={`${g.game_id}-${g.gp_id}-${nanoid()}`}
					game={g}
					onClick={onItemClick}
				/>
			))}
		</div>
	);
}

function GameGridItem({
	game,
	onClick,
}: {
	game: Game;
	onClick?: (game: Game) => void;
}) {
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

	const handleOpen = () => {
		if (onClick) return onClick(game);
		const queryParams = new URLSearchParams({
			vendor: game.vendor_name,
			gameType: game.own_game_type,
			gpId: String(game.gp_id),
		}).toString();
		const href = `/play/${game.game_id}?${queryParams}`;
		if (!isLoggedIn) {
			setShowAuthFlow(true);
			return;
		}
		window.open(href, "_blank", "noopener,noreferrer");
	};

	const toggleFav = (e: React.MouseEvent) => {
		e.stopPropagation();
		const gameKey = `${game.game_id}_${game.game_name}`;
		const next = favoritesService.toggle(gameKey);
		setFav(next);
	};

	return (
		<div
			role="button"
			onClick={handleOpen}
			className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
		>
			<div className="relative aspect-[4/3]">
				<Image
					src={game.full_url_game_image}
					alt={game.game_name}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<button
					aria-label={fav ? "Remove favorite" : "Add favorite"}
					onClick={toggleFav}
					className={`absolute top-2 right-2 rounded-full p-2 border ${
						fav
							? "bg-primary text-foreground border-primary"
							: "bg-background/70 text-foreground border-border/50"
					}`}
				>
					<FontAwesomeIcon
						icon={faHeart}
						className={`w-4 h-4 ${fav ? "fill-current" : ""}`}
					/>
				</button>
			</div>
			<div className="p-3 space-y-1">
				<div className="text-sm font-semibold leading-tight line-clamp-2">
					{game.game_name}
				</div>
				<div className="text-[11px] text-muted-foreground uppercase tracking-wide">
					{game.provider_name || game.category || "Casino"}
				</div>
				{/* <div className="pt-1">
          <Button size="sm" className="w-full">Play</Button>
        </div> */}
			</div>
		</div>
	);
}

export default GameGrid;
