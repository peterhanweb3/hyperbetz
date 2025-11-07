"use client";

import { Game } from "@/types/games/gameList.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-provider";

interface Layout2GameCardProps {
	game: Game;
	className?: string;
}

export const GameCard = ({ game, className }: Layout2GameCardProps) => {
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	const t = useTranslations("games");

	const queryParams = new URLSearchParams({
		vendor: game.vendor_name,
		gameType: game.own_game_type,
		gpId: String(game.gp_id),
	}).toString();
	const gameUrl = `/play/${game.game_id}?${queryParams}`;

	const handleCardClick = (e: React.MouseEvent) => {
		e.preventDefault();
		if (isLoggedIn) {
			router.push(gameUrl);
		} else {
			login();
		}
	};

	return (
		// The CSS and JSX structure are preserved exactly from the original.
		// The data bindings are now mapped from our `Game` type.
		<a
			href={gameUrl}
			onClick={handleCardClick}
			className={cn(
				"group relative block w-full h-64 md:h-80 rounded-xl overflow-hidden bg-cover bg-center bg-no-repeat hover:scale-[1.02] transition-all duration-200 ease-out shadow-md hover:shadow-xl hover:shadow-primary/15 border border-gray-200/10 hover:border-primary/30",
				className
			)}
		>
			<Image
				src={game.full_url_game_image || ""}
				alt={game.game_name}
				fill
				className="object-contain group-hover:scale-105 transition-transform duration-200 ease-out"
			/>

			{/* Clean overlay */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
			<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

			{/* Category badge */}
			<div className="absolute top-3 right-3 z-20 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
				<span className="px-3 py-1 bg-black/60 text-white text-xs font-medium rounded-md backdrop-blur-sm border border-white/20">
					{game.category}
				</span>
			</div>

			{/* Content overlay */}
			<div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
				<div></div>

				{/* Bottom section */}
				<div className="space-y-3 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-200 ease-out">
					<div>
						{/* <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-200">
							<span className="px-3 py-1 bg-black/60 text-white text-xs font-medium rounded-md backdrop-blur-sm border border-white/20">
								{game.provider_name}
							</span>
						</div>
						<h3 className="text-white text-lg font-semibold line-clamp-1 drop-shadow-md">
							{game.game_name}
						</h3> */}
						<div>
							<span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-white/10 text-white/90 mb-2 text-[13px] font-medium border border-white/15">
								{/* <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" /> */}
								{game.provider_name}
							</span>
						</div>
						<h3 className="text-white text-lg font-semibold line-clamp-1 drop-shadow-md">
							{game.game_name}
						</h3>
					</div>

					{/* Buttons - hidden by default, show on hover */}
					<div className="flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-200 ease-out">
						<Button
							size="sm"
							className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-all duration-150 hover:scale-105 shadow-lg hover:shadow-primary/30"
						>
							<svg
								className="w-4 h-4 mr-1"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
							</svg>
							{t("playNow")}
						</Button>

						<Button
							size="sm"
							variant="outline"
							className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 font-medium px-3 py-2 rounded-lg transition-all duration-150 hover:scale-105 backdrop-blur-sm"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								router.push(
									`/games?category=${encodeURIComponent(
										game.category
									)}`
								);
							}}
						>
							<svg
								className="w-4 h-4 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
							More {game.category} Games
						</Button>
					</div>
				</div>
			</div>
			<div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/20 transition-colors duration-200 pointer-events-none" />
		</a>
	);
};
