"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/common/banners/hero/GameCard";
import { InfoCard } from "@/components/common/banners/hero/info-card";
import { Game } from "@/types/games/gameList.types";
import {
	HeroSlideData,
	InfoCardData,
} from "@/types/features/hero-banner-section.types";
import HeroSlider from "@/components/common/banners/hero/hero-banner-slider";

// --- Enhanced Skeleton Component for Layout2 ---
const Layout2Skeleton = () => (
	<div className="space-y-6">
		{/* First Row - Slider (60%) + Game Card (40%) */}
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<div className="lg:col-span-3 relative">
				<Skeleton className="w-full h-64 md:h-80 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30" />
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse" />
			</div>
			<div className="lg:col-span-2 relative">
				<Skeleton className="w-full h-64 md:h-80 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20" />
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-accent/5 animate-pulse" />
			</div>
		</div>

		{/* Second Row - Three Equal Cards */}
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{[1, 2, 3].map((i) => (
				<Skeleton
					key={i}
					className="w-full h-48 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20"
				/>
			))}
		</div>
	</div>
);

// --- Main Layout2 Component ---
interface Layout2Props {
	slides: HeroSlideData[];
	featuredGame: Game;
	cards: InfoCardData[];
	isLoading?: boolean;
}

export const Layout2 = ({
	slides,
	featuredGame,
	cards,
	isLoading = false,
}: Layout2Props) => {
	if (isLoading) {
		return <Layout2Skeleton />;
	}

	if (
		!slides?.length ||
		!featuredGame ||
		!cards?.length ||
		cards.length < 3
	) {
		console.warn("Layout2 received insufficient data.");
		return null;
	}

	const [card1, card2, card3] = cards;
	// console.log("Layout2 Cards:", { card1, card2, card3 });

	return (
		<div className="space-y-6">
			{/* First Row - Slider (60%) + Game Card (40%) */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				<div className="lg:col-span-3">
					<HeroSlider slides={slides} />
				</div>
				<div className="lg:col-span-2">
					<GameCard game={featuredGame} />
				</div>
			</div>

			{/* Second Row - Three Equal Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<InfoCard data={card1} />
				<InfoCard data={card2} />
				<InfoCard data={card3} />
			</div>
		</div>
	);
};
