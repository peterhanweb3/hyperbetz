"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
	HeroSlideData,
	InfoCardData,
} from "@/types/features/hero-banner-section.types";
import { Game } from "@/types/games/gameList.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useTranslations } from "@/lib/locale-provider";
import { Play, Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCards,
	faSlotMachine,
	faBuilding,
} from "@fortawesome/pro-light-svg-icons";
import Image from "next/image";
import { ExploreSection } from "@/components/features/games/explore-section";
// import { DynamicProviderCarousel } from "@/components/features/providers/dynamic-provider-carousel";
import { ProviderGridCard } from "@/components/features/query-display/provider-grid-card";
import { useAppStore } from "@/store/store";
import { getGamesByCategory } from "@/lib/utils/games/games.utils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { selectAllProviders } from "@/store/selectors/query/query.selectors";
import Link from "next/link";

const Layout7Skeleton = () => (
	<div className="space-y-6">
		{/* Hero Slider Skeleton */}
		<div className="relative">
			<Skeleton className="w-full h-64 md:h-80 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30" />
			<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse" />
		</div>

		{/* Featured Games Section Skeleton */}
		<div className="grid grid-cols-12 gap-8">
			<div className="col-span-4 space-y-4">
				<Skeleton className="h-6 w-48 bg-muted animate-pulse" />
				<Skeleton className="h-[500px] w-full rounded-xl bg-muted animate-pulse" />
			</div>
			<div className="col-span-8 space-y-4">
				<Skeleton className="h-6 w-48 bg-muted animate-pulse" />
				<Skeleton className="h-[500px] w-full rounded-xl bg-muted animate-pulse" />
			</div>
		</div>

		{/* Middle Section Skeleton */}
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Skeleton className="w-full h-64 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20" />
			<Skeleton className="w-full h-80 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20" />
		</div>
	</div>
);

const FeaturedGameCard = ({ game }: { game: Game }) => {
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	const tHero = useTranslations("hero");

	const queryParams = new URLSearchParams({
		vendor: game.vendor_name,
		gameType: game.category,
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
		<Card className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 h-[500px] cursor-pointer">
			<div className="absolute inset-0 ">
				<Image
					src={game.full_url_game_image || ""}
					alt={game.game_name}
					fill
					className="object-cover transition-transform duration-700  group-hover:scale-110"
				/>
			</div>
			<div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
			<div className="relative h-full flex flex-col justify-between p-6 text-white">
				{/* Top Section - Badges and Play Button */}
				<div className="flex items-start justify-between">
					<Badge
						variant="secondary"
						className="bg-white/20 text-white backdrop-blur-sm border border-white/30 shadow-lg"
					>
						{game.provider_name}
					</Badge>

					<Button
						size="icon"
						onClick={handleCardClick}
						className="rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-110"
					>
						<Play className="h-5 w-5 text-foreground" />
					</Button>
				</div>

				{/* Bottom Section - Game Info */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
						<span className="text-sm text-white/80 font-medium">
							{tHero("layout3.featuredGameLabel")}
						</span>
					</div>

					<h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300 leading-tight">
						{game.game_name}
					</h3>
				</div>
			</div>
		</Card>
	);
};

// --- Updated Live Casino and Slots Section Component ---
const LiveCasinoAndSlotsSection = () => {
	const allGames = useAppStore((state) => state.game.list.games);
	const status = useAppStore((state) => state.game.list.status);
	const tGames = useTranslations("games");
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	const liveCasinoGames = getGamesByCategory(allGames, "LIVE CASINO", 4);
	const slotGames = getGamesByCategory(allGames, "SLOT", 4);

	if (status === "loading" || status === "idle") {
		return (
			<div className="space-y-8 p-2">
				<div className="space-y-4">
					<Skeleton className="h-8 w-40 bg-muted/60 animate-pulse rounded-lg" />
					<div className="grid grid-cols-2 gap-3">
						{[...Array(4)].map((_, i) => (
							<Skeleton
								key={i}
								className="h-32 w-full rounded-xl bg-muted/40 animate-pulse"
							/>
						))}
					</div>
				</div>
				<div className="space-y-4">
					<Skeleton className="h-8 w-32 bg-muted/60 animate-pulse rounded-lg" />
					<div className="grid grid-cols-2 gap-3">
						{[...Array(4)].map((_, i) => (
							<Skeleton
								key={i}
								className="h-32 w-full rounded-xl bg-muted/40 animate-pulse"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	const StylishGameCard = ({ game }: { game: Game }) => {
		const queryParams = new URLSearchParams({
			vendor: game.vendor_name,
			gameType: game.category,
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
			<div
				onClick={handleCardClick}
				className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
			>
				<div className="relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
					<Image
						src={game.full_url_game_image || ""}
						alt={game.game_name}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
				</div>
				<div className="absolute inset-0 flex flex-col justify-between p-4">
					<div className="flex justify-end">
						<Badge
							variant="secondary"
							className="bg-white/20 text-white backdrop-blur-md border border-white/30 text-xs px-2 py-1 shadow-lg"
						>
							{game.provider_name}
						</Badge>
					</div>
					<div className="space-y-2">
						<h4 className="font-bold text-white text-sm leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
							{game.game_name}
						</h4>
						<div className="flex items-center justify-between">
							<span className="text-xs text-white/70 font-medium">
								{game.category}
							</span>

							<Button
								size="sm"
								className="h-8 px-3 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg transform transition-all duration-200 hover:scale-105 opacity-0 group-hover:opacity-100"
							>
								<Play className="h-3 w-3 mr-1" />
								<span className="text-xs font-medium">
									Play
								</span>
							</Button>
						</div>
					</div>
				</div>
				<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
			</div>
		);
	};

	const SectionTitle = ({
		title,
		icon,
		count,
	}: {
		title: string;
		icon: IconProp;
		count: number;
	}) => (
		<div className="flex items-center justify-between mb-6">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
					<FontAwesomeIcon
						icon={icon}
						className="h-5 w-5 text-primary"
					/>
				</div>
				<div>
					<h3 className="text-xl font-bold text-foreground">
						{title}
					</h3>
					<p className="text-sm text-muted-foreground">
						{count} games available
					</p>
				</div>
			</div>

			<Badge
				variant="outline"
				className="bg-primary/5 text-primary border-primary/30 px-3 py-1 rounded-full font-medium"
			>
				Featured
			</Badge>
		</div>
	);

	return (
		<div className="space-y-10 p-2">
			{/* Live Casino Section */}
			{liveCasinoGames.length > 0 && (
				<div className="space-y-6">
					<SectionTitle
						title={tGames("liveCasino")}
						icon={faCards}
						count={liveCasinoGames.length}
					/>

					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{liveCasinoGames.map((game, index) => (
							<StylishGameCard
								key={`live-casino-${game.game_id}-${index}`}
								game={game}
							/>
						))}
					</div>
				</div>
			)}

			{/* Slots Section */}
			{slotGames.length > 0 && (
				<div className="space-y-6">
					<SectionTitle
						title={tGames("slots")}
						icon={faSlotMachine}
						count={slotGames.length}
					/>

					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{slotGames.map((game, index) => (
							<StylishGameCard
								key={`slots-${game.game_id}-${index}`}
								game={game}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// --- Top Providers Section for Layout7 ---
const TopProvidersSection = () => {
	const allProviders = useAppStore(selectAllProviders);
	const tCommon = useTranslations("common");

	// Get top 3 providers
	const topProviders = allProviders.slice(0, 3);

	if (topProviders.length === 0) {
		return null;
	}

	return (
		<div className="w-full">
			{/* SECTION HEADER */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
				<div className="flex items-center gap-3">
					<FontAwesomeIcon
						icon={faBuilding}
						fontSize={24}
						className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
					/>
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
						Top Providers
					</h2>
				</div>
				<div className="flex items-center gap-2">
					<Button
						asChild
						variant="outline"
						size="sm"
						className="text-xs sm:text-sm"
					>
						<Link href="/providers">{tCommon("viewAll")}</Link>
					</Button>
				</div>
			</div>

			{/* PROVIDERS GRID - 3 columns for 3 providers */}
			<div className="grid grid-cols-3 gap-4">
				{topProviders.map((provider, index) => (
					<ProviderGridCard
						key={`provider-${provider.name}-${index}`}
						name={provider.name}
						gameCount={provider.count}
						iconUrl={provider.icon_url}
					/>
				))}
			</div>
		</div>
	);
};

// --- Main Layout7 Component ---
interface Layout7Props {
	slides: HeroSlideData[];
	cards: InfoCardData[];
	featuredSlide?: HeroSlideData;
	mainGame?: Game;
	sideGames?: Game[];
	isLoading?: boolean;
}

export const Layout7 = ({
	slides,
	cards,
	mainGame,
	sideGames,
	isLoading = false,
}: Layout7Props) => {
	const featuredPlugin = useRef(
		Autoplay({
			delay: 4000,
			stopOnInteraction: false,
			stopOnMouseEnter: true,
		})
	);

	const tHero = useTranslations("hero");

	if (isLoading) {
		return <Layout7Skeleton />;
	}

	if (!slides?.length || !cards?.length || cards.length < 3) {
		console.warn("Layout7 received insufficient data.");
		return null;
	}

	// Create featured games array if games are provided
	const featuredGames =
		mainGame && sideGames && sideGames?.length >= 3
			? [mainGame, ...sideGames.slice(0, 3)]
			: [];

	return (
		<div className="space-y-6">
			{/* First Section: Featured Games Sliders */}
			{featuredGames.length > 0 && sideGames && (
				<div className="grid grid-cols-12 gap-8">
					{/* Left Side: Featured Games Slider */}
					<div className="col-span-12 xl:col-span-4">
						<div className="space-y-6 h-full flex flex-col">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-foreground">
									{tHero("layout3.slider1Title")}
								</h2>
								<Badge
									variant="outline"
									className="text-primary border-primary/30"
								>
									{tHero("layout3.slider1Badge")}
								</Badge>
							</div>

							<div className="relative flex-1">
								<Carousel
									plugins={[featuredPlugin.current]}
									className="w-full h-full"
									opts={{
										align: "start",
										loop: true,
										slidesToScroll: 1,
									}}
								>
									<CarouselContent className="h-full">
										{featuredGames.map((game, index) => (
											<CarouselItem
												key={`featured-${game.game_id}-${index}`}
												className="h-full"
											>
												<div className="h-full min-h-[500px]">
													<FeaturedGameCard
														game={game}
													/>
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
									<CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-border/50" />
									<CarouselNext className="right-4 bg-background/80 hover:bg-background border-border/50" />
								</Carousel>
							</div>
						</div>
					</div>

					{/* Right Side: Live Casino and Slots Section */}
					<div className="col-span-12 xl:col-span-8">
						<div className="space-y-6 h-full">
							<div className="h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-3xl p-6 border border-border/50 shadow-xl backdrop-blur-sm overflow-hidden relative min-h-[500px]">
								<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
								<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-2xl translate-y-12 -translate-x-12" />

								<div className="relative z-10 h-full">
									<LiveCasinoAndSlotsSection />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Second Section: ExploreSection (left) + DynamicProviderCarousel (right) */}
			<section className="relative">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
					{/* Left Side: ExploreSection with Fixed Height Container */}
					<div className="min-h-[300px]">
						<div className="h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-3xl px-6 border border-border/50 shadow-xl backdrop-blur-sm overflow-hidden relative">
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
							<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-2xl translate-y-12 -translate-x-12" />

							<div className="relative z-10 h-full">
								<ExploreSection />
							</div>
						</div>
					</div>

					{/* Right Side: DynamicProviderCarousel with Flexible Height */}
					<div className="min-h-[300px]">
						<div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-3xl px-6 border border-border/50 shadow-xl backdrop-blur-sm relative">
							<div className="relative z-10 mb-6 mt-6">
								<TopProvidersSection />
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};
