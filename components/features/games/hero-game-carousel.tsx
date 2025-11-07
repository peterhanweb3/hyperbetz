"use client";

import Image from "next/image";
import { Game } from "@/types/games/gameList.types";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
// import { Heart, Play } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPlay } from "@fortawesome/pro-light-svg-icons";
import { useEffect, useState } from "react";
import favoritesService from "@/services/favoritesService";

type HeroGameCarouselProps = {
	games: Game[];
	title?: string;
	subtitle?: string;
};

export default function HeroGameCarousel({
	games,
	title = "Recommended",
	subtitle = "Hand-picked games for you",
}: HeroGameCarouselProps) {
	const visible = games.slice(0, 12);

	return (
		<section className="w-full">
			<div className="mb-4">
				<h3 className="text-2xl md:text-3xl font-semibold">{title}</h3>
				{subtitle && (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
			<div className="relative">
				<Carousel
					className="w-full"
					opts={{ align: "start", loop: false, dragFree: true }}
				>
					<CarouselContent>
						{visible.map((g) => (
							<CarouselItem
								key={`${g.game_id}-${g.gp_id}`}
								className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
							>
								<HeroGameCard game={g} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="top-1/2 -left-6 md:-left-10 -translate-y-1/2 bg-background/80 backdrop-blur border" />
					<CarouselNext className="top-1/2 -right-6 md:-right-10 -translate-y-1/2 bg-background/80 backdrop-blur border" />
				</Carousel>
			</div>
		</section>
	);
}

function HeroGameCard({ game }: { game: Game }) {
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

	const openGame = () => {
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
		setFav(favoritesService.toggle(gameKey));
	};

	return (
		<div
			className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all cursor-pointer"
			onClick={openGame}
		>
			<div className="relative aspect-[4/3]">
				<Image
					src={game.full_url_game_image}
					alt={game.game_name}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<button
					onClick={toggleFav}
					aria-label={fav ? "Remove favorite" : "Add favorite"}
					className={`absolute top-3 right-3 rounded-full p-2 border ${
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
				<div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/80 via-background/40 to-transparent">
					<div className="font-semibold line-clamp-1">
						{game.game_name}
					</div>
					<div className="text-[11px] text-muted-foreground uppercase tracking-wide">
						{game.provider_name || game.category}
					</div>
				</div>
			</div>
			<div className="p-3">
				<Button className="w-full" size="sm">
					<FontAwesomeIcon icon={faPlay} className="w-4 h-4 mr-1" />{" "}
					Play
				</Button>
			</div>
		</div>
	);
}
