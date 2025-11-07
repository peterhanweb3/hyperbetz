"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
	MainPromoData,
	SidePromoData,
	CasinoCategoryData,
} from "@/types/features/hero-banner-section.types";
import Image from "next/image";
import { Game } from "@/types/games/gameList.types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useTranslations } from "@/lib/locale-provider";
import { Play } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCards, faSlotMachine } from "@fortawesome/pro-light-svg-icons";
import { useAppStore } from "@/store/store";
import { getGamesByCategory } from "@/lib/utils/games/games.utils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

// --- Layout8 Skeleton Component ---
const Layout8Skeleton = () => (
	<div className="space-y-4">
		{/* Top row skeleton */}
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<Skeleton className="h-64 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Skeleton className="h-64 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20" />
				<Skeleton className="h-64 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20" />
			</div>
		</div>
		{/* Categories row skeleton */}
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{[1, 2, 3, 4].map((i) => (
				<Skeleton
					key={i}
					className="h-20 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20"
				/>
			))}
		</div>
	</div>
);

// --- Category Card with Image on Right ---
interface CasinoCategoryProps {
	imageUrl: string;
	title: string;
	subtitle: string;
	onClick: () => void;
}

const CasinoCategory = ({
	imageUrl,
	title,
	subtitle,
	onClick,
}: CasinoCategoryProps) => (
	<div
		className="relative h-20 cursor-pointer transition-all duration-300 hover:scale-105"
		onClick={onClick}
	>
		<div className="h-full w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl px-4 border border-border/50 shadow-xl backdrop-blur-sm overflow-hidden relative flex items-center justify-between">
			<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl -translate-y-10 translate-x-10" />
			<div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-xl translate-y-8 -translate-x-8" />
			<div className="relative z-10 flex-1 text-white">
				<h3 className="font-bold text-lg">{title}</h3>
				<p className="text-xs opacity-90">{subtitle}</p>
			</div>
			<div className="relative z-10 w-16 h-16 ml-3 rounded-lg overflow-hidden">
				<Image
					src={imageUrl}
					alt={title}
					fill
					className="object-cover"
					sizes="64px"
					loading="lazy"
					quality={70}
				/>
			</div>
		</div>
	</div>
);
interface PromoBannerProps {
	title: string;
	subtitle: string;
	buttonText: string;
	link: string;
	bgImage: string;
	onButtonClick: () => void;
}

const PromoBanner = ({
	title,
	subtitle,
	link,
	buttonText,
	bgImage,
	onButtonClick,
}: PromoBannerProps) => (
	<div className="rounded-2xl relative overflow-hidden h-64 flex items-start p-6 group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300">
		<div className="absolute inset-0">
			<Image
				src={bgImage}
				alt={title}
				fill
				className="object-cover transition-transform duration-700 group-hover:scale-110"
				sizes="(max-width: 1024px) 100vw, 50vw"
				priority
				quality={72}
				fetchPriority="high"
			/>
		</div>
		<div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 rounded-2xl" />
		<div className="relative z-10 text-white max-w-md">
			<h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">
				{title}
			</h2>
			<p className="text-lg mb-4 opacity-90">{subtitle}</p>
			<Link href={link} className="inline-block">
				<Button
					onClick={(event) => {
						event.stopPropagation();
						onButtonClick();
					}}
					className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
				>
					{buttonText}
				</Button>
			</Link>
		</div>
	</div>
);

interface SidePromoProps {
	title: string;
	subtitle: string;
	buttonText: string;
	bgImage: string;
	onButtonClick: () => void;
}

const SidePromo = ({
	title,
	subtitle,
	buttonText,
	bgImage,
	onButtonClick,
}: SidePromoProps) => (
	<div
		className="rounded-2xl p-4 h-64 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
		onClick={onButtonClick}
	>
		<div className="absolute inset-0">
			<Image
				src={bgImage}
				alt={title}
				fill
				className="object-cover transition-transform duration-700 group-hover:scale-110"
				sizes="(max-width: 1024px) 100vw, 25vw"
				loading="lazy"
				quality={70}
			/>
		</div>
		<div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
		<div className="relative z-10 text-white">
			<h3 className="font-bold text-xl leading-tight">{title}</h3>
			<p className="text-sm opacity-90 mt-1">{subtitle}</p>
		</div>
		<Button
			size="sm"
			className="relative z-10 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-4 py-1 text-xs rounded-full self-start transition-all duration-300 hover:scale-105"
		>
			{buttonText}
		</Button>
	</div>
);

// Updated Live Casino and Slots Section Component
const LiveCasinoAndSlotsSection = () => {
	const allGames = useAppStore((state) => state.game.list.games);
	const status = useAppStore((state) => state.game.list.status);
	const tGames = useTranslations("games");
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	// Full pools for each section
	const liveCasinoPool = useMemo(
		() => getGamesByCategory(allGames, "LIVE CASINO"),
		[allGames]
	);
	const slotPool = useMemo(
		() => getGamesByCategory(allGames, "SLOT"),
		[allGames]
	);

	// Visible samples that we will shuffle periodically
	const [liveCasinoGames, setLiveCasinoGames] = useState<Game[]>([]);
	const [slotGames, setSlotGames] = useState<Game[]>([]);

	// Helper: sample unique random games from a pool
	const sampleGames = useCallback((pool: Game[], count: number): Game[] => {
		if (!pool || pool.length === 0) return [];
		if (pool.length <= count) return pool.slice(0, count);
		const indices = new Set<number>();
		while (indices.size < Math.min(count, pool.length)) {
			indices.add(Math.floor(Math.random() * pool.length));
		}
		return Array.from(indices).map((i) => pool[i]);
	}, []);

	// Initialize visible lists when data is ready or pools change
	useEffect(() => {
		if (status === "success") {
			setLiveCasinoGames(sampleGames(liveCasinoPool, 4));
			setSlotGames(sampleGames(slotPool, 4));
		}
	}, [sampleGames, status, liveCasinoPool, slotPool]);

	// Periodically reshuffle visible games
	useEffect(() => {
		if (status !== "success") return;
		const intervalMs = 12000;
		const id = setInterval(() => {
			// Avoid updating when tab is hidden to save resources
			if (typeof document !== "undefined" && document.hidden) return;
			setLiveCasinoGames(sampleGames(liveCasinoPool, 4));
			setSlotGames(sampleGames(slotPool, 4));
		}, intervalMs);
		return () => clearInterval(id);
	}, [sampleGames, status, liveCasinoPool, slotPool]);

	if (status === "loading" || status === "idle") {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
				{/* Live Casino Skeleton */}
				<div className="bg-gradient-to-br from-purple/10 via-background to-purple/5 rounded-2xl p-6 border border-border/30 shadow-lg backdrop-blur-sm space-y-4">
					<Skeleton className="h-8 w-40 bg-muted/60 animate-pulse rounded-lg" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{[...Array(4)].map((_, i) => (
							<Skeleton
								key={i}
								className="h-32 w-full rounded-xl bg-muted/40 animate-pulse"
							/>
						))}
					</div>
				</div>

				{/* Slots Skeleton */}
				<div className="bg-gradient-to-br from-blue/10 via-background to-cyan/5 rounded-2xl p-6 border border-border/30 shadow-lg backdrop-blur-sm space-y-4">
					<Skeleton className="h-8 w-32 bg-muted/60 animate-pulse rounded-lg" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
						sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
						loading="lazy"
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

		onViewMoreClick,
	}: {
		title: string;
		icon: IconProp;
		onViewMoreClick: () => void;
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
				</div>
			</div>

			<Badge
				variant="outline"
				className="bg-primary/5 text-primary border-primary/30 px-3 py-1 rounded-full font-medium cursor-pointer hover:bg-primary hover:text-white transition-all duration-300"
				onClick={onViewMoreClick}
			>
				View More
			</Badge>
		</div>
	);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
			{/* Live Casino Section */}
			{liveCasinoGames.length > 0 && (
				<div className="bg-gradient-to-br from-purple/10 via-background to-purple/5 rounded-2xl p-6 border border-border/30 shadow-lg backdrop-blur-sm overflow-hidden relative">
					<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple/30 to-pink/20 rounded-full blur-2xl -translate-y-10 translate-x-10" />
					<div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple/20 to-primary/20 rounded-full blur-xl translate-y-8 -translate-x-8" />

					<div className="relative z-10 space-y-6">
						<SectionTitle
							title={tGames("liveCasino")}
							icon={faCards}
							onViewMoreClick={() =>
								router.push("/games?category=LIVE CASINO")
							}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{liveCasinoGames.map((game, index) => (
								<StylishGameCard
									key={`live-casino-${game.game_id}-${index}`}
									game={game}
								/>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Slots Section */}
			{slotGames.length > 0 && (
				<div className="bg-gradient-to-br from-blue/10 via-background to-cyan/5 rounded-2xl p-6 border border-border/30 shadow-lg backdrop-blur-sm overflow-hidden relative">
					<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue/30 to-cyan/20 rounded-full blur-2xl -translate-y-10 translate-x-10" />
					<div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-cyan/20 to-accent/20 rounded-full blur-xl translate-y-8 -translate-x-8" />

					<div className="relative z-10 space-y-6">
						<SectionTitle
							title={tGames("slots")}
							icon={faSlotMachine}
							onViewMoreClick={() =>
								router.push("/games?category=SLOT")
							}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{slotGames.map((game, index) => (
								<StylishGameCard
									key={`slots-${game.game_id}-${index}`}
									game={game}
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// --- Main Layout8 ---
interface Layout8Props {
	mainPromo: MainPromoData;
	sidePromos: SidePromoData[];
	categories: CasinoCategoryData[];
	isLoading?: boolean;
}

export const Layout8 = ({
	mainPromo,
	sidePromos,
	categories,
	isLoading = false,
}: Layout8Props) => {
	if (isLoading) {
		return <Layout8Skeleton />;
	}

	if (!mainPromo || !sidePromos?.length || !categories?.length) {
		console.warn("Layout8 received insufficient data.");
		return null;
	}

	return (
		<div className="space-y-4">
			{/* Top row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<PromoBanner
					title={mainPromo.title}
					subtitle={mainPromo.subtitle}
					buttonText={mainPromo.buttonText}
					link={mainPromo.link}
					bgImage={mainPromo.bgImage}
					onButtonClick={mainPromo.onButtonClick}
				/>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{sidePromos.slice(0, 2).map((promo, index) => (
						<SidePromo
							key={index}
							title={promo.title}
							subtitle={promo.subtitle}
							buttonText={promo.buttonText}
							bgImage={promo.bgImage || "/placeholder.jpg"}
							onButtonClick={promo.onButtonClick}
						/>
					))}
				</div>
			</div>

			{/* Categories row */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				{categories.slice(0, 4).map((category, index) => (
					<CasinoCategory
						key={index}
						imageUrl={category.imageUrl || "/placeholder.jpg"}
						title={category.title}
						subtitle={category.subtitle}
						onClick={category.onClick}
					/>
				))}
			</div>

			{/* LiveCasinoAndSlotsSection */}
			<div className="relative">
				<div className="relative z-10">
					<LiveCasinoAndSlotsSection />
				</div>
			</div>
		</div>
	);
};
