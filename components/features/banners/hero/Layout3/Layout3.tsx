// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { Game } from "@/types/games/gameList.types";
// import { Skeleton } from "@/components/ui/skeleton";
// import { GameCard } from "../../../games/game-carousel-card";
// import { Card } from "@/components/ui/card";
// import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
// import Autoplay from "embla-carousel-autoplay";
// import { useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useDynamicAuth } from "@/hooks/useDynamicAuth";

// // --- Skeleton: A Visual Echo of the Final Layout ---
// const Layout3Skeleton = () => (
//   <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-auto lg:h-[500px]">
//     {/* Main Card Skeleton */}
//     <div className="lg:col-span-2 h-full">
//       <Skeleton className="w-full h-full rounded-2xl bg-muted animate-pulse" />
//     </div>

//     {/* Side List Skeletons */}
//     <div className="lg:col-span-3 h-full">
//       <Skeleton className="w-full h-full rounded-2xl bg-muted animate-pulse" />
//     </div>
//   </div>
// );

// // --- SideGameItem: The Re-imagined List Item ---
// const SideGameItem = ({ game }: { game: Game }) => {
//   const router = useRouter();
//   const { isLoggedIn, login } = useDynamicAuth();

//   const queryParams = new URLSearchParams({
//     vendor: game.vendor_name,
//     gameType: game.category,
//     gpId: String(game.gp_id),
//   }).toString();
//   const gameUrl = `/play/${game.game_id}?${queryParams}`;

//   const handleCardClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (isLoggedIn) {
//       router.push(gameUrl);
//     } else {
//       login();
//     }
//   };

//   return (
//     <Link
//       target="_blank"
//       onClick={handleCardClick}
//       href={gameUrl}
//       className="group flex w-full items-center gap-4 p-4 rounded-lg
//                  bg-background/80 hover:bg-accent/80 backdrop-blur-sm
//                  border border-border/50 hover:border-primary/50
//                  transition-all duration-300 ease-in-out
//                  hover:shadow-lg hover:shadow-primary/10
//                  transform hover:scale-[1.02]">
//       <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md shadow-md">
//         <Image src={game.full_url_game_image || ""} alt={game.game_name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
//       </div>
//       <div className="flex-1 overflow-hidden">
//         <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">{game.game_name}</p>
//         <p className="text-sm text-muted-foreground">{game.provider_name}</p>
//       </div>
//     </Link>
//   );
// };

// // --- The Main `Layout3` Component ---
// interface Layout3Props {
//   mainGame: Game;
//   sideGames: Game[];
//   isLoading?: boolean;
// }

// export const Layout3 = ({ mainGame, sideGames, isLoading = false }: Layout3Props) => {
//   const plugin = useRef(Autoplay({ delay: 200, stopOnInteraction: false, stopOnMouseEnter: true }));

//   if (isLoading) return <Layout3Skeleton />;
//   if (!mainGame || !sideGames || sideGames.length < 4) return null;

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-20 ">
//       {/* --- Main Featured Game Column --- */}
//       <div className="lg:col-span-2 h-full">
//         <h2 className="text-2xl font-semibold mb-6 tracking-tight text-foreground">Featured Game</h2>
//         <GameCard game={mainGame} />
//         {/* </div> */}
//       </div>

//       {/* --- Side Vertical Auto-Scrolling Column --- */}
//       <div className="lg:col-span-3 h-full">
//         <h2 className="text-2xl font-semibold mb-6 tracking-tight text-foreground">More To Explore</h2>
//         <Card className="h-[calc(100%-3.5rem)] p-0 overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-xl relative">
//           {/* Gradient overlays */}
//           <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
//           <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />

//           <Carousel
//             plugins={[plugin.current]}
//             // className="w-full h-full"
//             orientation="vertical"
//             opts={{
//               align: "start",
//               loop: true,
//               axis: "y",
//             }}>
//             <CarouselContent>
//               {sideGames.map((game, index) => (
//                 <CarouselItem key={`${game.game_id}-${index}`}>
//                   <div className="px-6  h-full flex items-center">
//                     <SideGameItem game={game} />
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//           </Carousel>
//         </Card>
//       </div>
//     </div>
//   );
// };

// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { Game } from "@/types/games/gameList.types";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Card, CardContent } from "@/components/ui/card";
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import Autoplay from "embla-carousel-autoplay";
// import { useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useDynamicAuth } from "@/hooks/useDynamicAuth";
// import { Play, Star, ChevronRight } from "lucide-react";

// // --- Skeleton: A Visual Echo of the Final Layout ---
// const Layout3Skeleton = () => (
//   <div className="w-full space-y-8">
//     {/* Header */}
//     <div className="text-center space-y-2">
//       <Skeleton className="h-8 w-64 mx-auto bg-muted animate-pulse" />
//       <Skeleton className="h-4 w-96 mx-auto bg-muted animate-pulse" />
//     </div>

//     {/* Sliders Container */}
//     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//       {/* Slider 1 Skeleton */}
//       <div className="space-y-4">
//         <Skeleton className="h-6 w-48 bg-muted animate-pulse" />
//         <Skeleton className="h-80 w-full rounded-xl bg-muted animate-pulse" />
//       </div>

//       {/* Slider 2 Skeleton */}
//       <div className="space-y-4">
//         <Skeleton className="h-6 w-48 bg-muted animate-pulse" />
//         <Skeleton className="h-80 w-full rounded-xl bg-muted animate-pulse" />
//       </div>
//     </div>
//   </div>
// );

// // --- Enhanced Game Card for Main Slider ---
// const FeaturedGameCard = ({ game }: { game: Game }) => {
//   const router = useRouter();
//   const { isLoggedIn, login } = useDynamicAuth();

//   const queryParams = new URLSearchParams({
//     vendor: game.vendor_name,
//     gameType: game.category,
//     gpId: String(game.gp_id),
//   }).toString();
//   const gameUrl = `/play/${game.game_id}?${queryParams}`;

//   const handleCardClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (isLoggedIn) {
//       router.push(gameUrl);
//     } else {
//       login();
//     }
//   };

//   return (
//     <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-card to-secondary/5 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 h-[400px]">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 opacity-[0.02]">
//         <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
//                            radial-gradient(circle at 75% 75%, hsl(var(--secondary)) 2px, transparent 2px)`,
//             backgroundSize: "60px 60px",
//           }}
//         />
//       </div>

//       <div className="relative h-[280px] p-6 flex items-center justify-center">
//         {/* Decorative Background Circle */}
//         <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl" />

//         {/* Game Image Container */}
//         <div className="relative w-full h-full flex items-center justify-center">
//           <div className="relative w-[200px] h-[180px] rounded-xl overflow-hidden shadow-xl border border-border/20">
//             <Image src={game.full_url_game_image || ""} alt={game.game_name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
//           </div>
//         </div>

//         {/* Floating Play Button */}
//         <div className="absolute top-6 right-6">
//           <Button size="icon" onClick={handleCardClick} className="rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-110">
//             <Play className="h-5 w-5 text-foreground" />
//           </Button>
//         </div>

//         {/* Provider Badge */}
//         <div className="absolute top-6 left-6">
//           <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground backdrop-blur-sm border border-secondary/30 shadow-md">
//             {game.provider_name}
//           </Badge>
//         </div>
//       </div>

//       {/* Game Info Section */}
//       <CardContent className="p-6 h-[120px] flex flex-col justify-center bg-gradient-to-t from-card/50 to-transparent">
//         <div className="space-y-3 text-center">
//           <h3 className="text-xl font-semibold truncate group-hover:text-primary transition-colors duration-300">{game.game_name}</h3>
//           <div className="flex items-center justify-center gap-2">
//             <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
//             <span className="text-sm text-muted-foreground font-medium">Featured Game</span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // --- Compact Game Card for Side Slider ---
// const CompactGameCard = ({ game }: { game: Game }) => {
//   const router = useRouter();
//   const { isLoggedIn, login } = useDynamicAuth();

//   const queryParams = new URLSearchParams({
//     vendor: game.vendor_name,
//     gameType: game.category,
//     gpId: String(game.gp_id),
//   }).toString();
//   const gameUrl = `/play/${game.game_id}?${queryParams}`;

//   const handleCardClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (isLoggedIn) {
//       router.push(gameUrl);
//     } else {
//       login();
//     }
//   };

//   return (
//     <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-accent/20 via-card to-muted/10 backdrop-blur-sm hover:bg-gradient-to-br hover:from-accent/30 hover:via-card hover:to-muted/20 transition-all duration-300 cursor-pointer h-[400px]">
//       {/* Background Decorative Elements */}
//       <div className="absolute inset-0 opacity-[0.03]">
//         <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary blur-3xl" />
//         <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr from-accent to-primary blur-2xl" />
//       </div>

//       <div className="relative h-[280px] p-4 flex items-center justify-center">
//         {/* Game Image with Enhanced Container */}
//         <div className="relative w-[160px] h-[140px] rounded-lg overflow-hidden shadow-lg border border-border/30 bg-gradient-to-br from-background to-muted/20">
//           <Image src={game.full_url_game_image || ""} alt={game.game_name} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />

//           {/* Play Button Overlay */}
//           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[1px]">
//             <Button size="icon" onClick={handleCardClick} className="rounded-full bg-primary hover:bg-primary/90 shadow-lg scale-90 hover:scale-100 transition-transform duration-200">
//               <Play className="h-4 w-4 text-foreground" />
//             </Button>
//           </div>
//         </div>

//         {/* Floating Provider Badge */}
//         <div className="absolute top-4 right-4">
//           <Badge variant="outline" className="bg-background/80 text-foreground backdrop-blur-sm border-border/50 text-xs">
//             {game.provider_name}
//           </Badge>
//         </div>
//       </div>

//       <CardContent className="p-4 h-[120px] flex flex-col justify-between bg-gradient-to-t from-card/80 to-transparent">
//         <div className="space-y-2 text-center">
//           <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300 text-base">{game.game_name}</h4>
//           <p className="text-xs text-muted-foreground opacity-80">{game.provider_name}</p>
//         </div>

//         <div className="flex justify-center mt-3">
//           <Link
//             href={gameUrl}
//             onClick={handleCardClick}
//             className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors duration-200 font-medium px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20">
//             Play Now
//             <ChevronRight className="h-3 w-3" />
//           </Link>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // --- The Main `Layout3` Component ---
// interface Layout3Props {
//   mainGame: Game;
//   sideGames: Game[];
//   isLoading?: boolean;
// }

// export const Layout3 = ({ mainGame, sideGames, isLoading = false }: Layout3Props) => {
//   const featuredPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }));
//   const explorePlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }));

//   if (isLoading) return <Layout3Skeleton />;
//   if (!mainGame || !sideGames || sideGames.length < 4) return null;

//   // Create featured games array (main game + first 3 side games)
//   const featuredGames = [mainGame, ...sideGames.slice(0, 3)];

//   return (
//     <div className="w-full space-y-8 py-8">
//       {/* Header Section */}
//       <div className="text-center space-y-3">
//         <h1 className="text-4xl font-semibold tracking-tight text-foreground">Game Spotlight</h1>
//         <p className="text-muted-foreground max-w-2xl mx-auto">Discover amazing games and explore new adventures in our curated collection</p>
//       </div>

//       {/* Dual Slider Layout */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//         {/* Slider 1: Featured Games */}
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-semibold text-foreground">Featured Games</h2>
//             <Badge variant="outline" className="text-primary border-primary/30">
//               Staff Picks
//             </Badge>
//           </div>

//           <div className="relative">
//             <Carousel
//               plugins={[featuredPlugin.current]}
//               className="w-full"
//               opts={{
//                 align: "start",
//                 loop: true,
//                 slidesToScroll: 1,
//               }}>
//               <CarouselContent>
//                 {featuredGames.map((game, index) => (
//                   <CarouselItem key={`featured-${game.game_id}-${index}`}>
//                     <FeaturedGameCard game={game} />
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-border/50" />
//               <CarouselNext className="right-4 bg-background/80 hover:bg-background border-border/50" />
//             </Carousel>
//           </div>
//         </div>

//         {/* Slider 2: More to Explore */}
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-semibold text-foreground">More to Explore</h2>
//             <Badge variant="outline" className="text-secondary-foreground border-secondary/30">
//               Trending
//             </Badge>
//           </div>

//           <div className="relative">
//             <Carousel
//               plugins={[explorePlugin.current]}
//               className="w-full"
//               opts={{
//                 align: "start",
//                 loop: true,
//                 slidesToScroll: 1,
//               }}>
//               <CarouselContent>
//                 {sideGames.map((game, index) => (
//                   <CarouselItem key={`explore-${game.game_id}-${index}`} className="basis-full sm:basis-1/2">
//                     <CompactGameCard game={game} />
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-border/50" />
//               <CarouselNext className="right-4 bg-background/80 hover:bg-background border-border/50" />
//             </Carousel>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import Link from "next/link";
import Image from "next/image";
import { Game } from "@/types/games/gameList.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { Play, Star, ChevronRight } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";

// --- Skeleton: A Visual Echo of the Final Layout ---
const Layout3Skeleton = () => (
	<div className="w-full space-y-8">
		{/* Header */}
		<div className="text-center space-y-2">
			<Skeleton className="h-8 w-64 mx-auto bg-muted animate-pulse" />
			<Skeleton className="h-4 w-96 mx-auto bg-muted animate-pulse" />
		</div>

		{/* Sliders Container */}
		<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
			{/* Slider 1 Skeleton */}
			<div className="space-y-4">
				<Skeleton className="h-6 w-48 bg-muted animate-pulse" />
				<Skeleton className="h-80 w-full rounded-xl bg-muted animate-pulse" />
			</div>

			{/* Slider 2 Skeleton */}
			<div className="space-y-4">
				<Skeleton className="h-6 w-48 bg-muted animate-pulse" />
				<Skeleton className="h-80 w-full rounded-xl bg-muted animate-pulse" />
			</div>
		</div>
	</div>
);

// --- Enhanced Game Card for Main Slider ---
const FeaturedGameCard = ({ game }: { game: Game }) => {
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	const tHero = useTranslations("hero");

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
		<Card className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 h-[400px] cursor-pointer">
			{/* Full Background Image */}
			<div className="absolute inset-0">
				<Image
					src={game.full_url_game_image || ""}
					alt={game.game_name}
					fill
					className=" transition-transform duration-700 group-hover:scale-110"
				/>
			</div>

			{/* Semi-transparent Gray Overlay */}
			<div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

			{/* Content Overlay */}
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

					<h3 className="text-2xl font-semibold text-white group-hover:text-primary transition-colors duration-300 leading-tight">
						{game.game_name}
					</h3>
				</div>
			</div>
		</Card>
	);
};

// --- Compact Game Card for Side Slider ---
const CompactGameCard = ({ game }: { game: Game }) => {
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	const tGames = useTranslations("games");

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
		<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-[400px]">
			{/* Full Background Image */}
			<div className="absolute inset-0">
				<Image
					src={game.full_url_game_image || ""}
					alt={game.game_name}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-110"
				/>
			</div>

			{/* Semi-transparent Gray Overlay */}
			<div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

			{/* Play Button Overlay - appears on hover */}
			<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
				<Button
					size="icon"
					onClick={handleCardClick}
					className="rounded-full bg-primary hover:bg-primary/90 shadow-lg scale-75 hover:scale-90 transition-transform duration-200"
				>
					<Play className="h-4 w-4 text-foreground" />
				</Button>
			</div>

			{/* Content Overlay */}
			<div className="relative h-full flex flex-col justify-between p-4 text-white">
				{/* Top Section - Provider Badge */}
				<div className="flex justify-end">
					<Badge
						variant="outline"
						className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs"
					>
						{game.provider_name}
					</Badge>
				</div>

				{/* Bottom Section - Game Info */}
				<div className="space-y-3">
					<h4 className="font-semibold text-white text-lg group-hover:text-foreground transition-colors duration-300 leading-tight">
						{game.game_name}
					</h4>

					<div className="flex items-center justify-between">
						<span className="text-xs text-white/80">
							{game.provider_name}
						</span>

						<Link
							href={gameUrl}
							onClick={handleCardClick}
							className="inline-flex items-center gap-1 text-xs text-white hover:text-foreground transition-colors duration-200 font-medium px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
						>
							{tGames("playNow")}
							<ChevronRight className="h-3 w-3" />
						</Link>
					</div>
				</div>
			</div>
		</Card>
	);
};

// --- The Main `Layout3` Component ---
interface Layout3Props {
	mainGame: Game;
	sideGames: Game[];
	isLoading?: boolean;
}

export const Layout3 = ({
	mainGame,
	sideGames,
	isLoading = false,
}: Layout3Props) => {
	const featuredPlugin = useRef(
		Autoplay({
			delay: 4000,
			stopOnInteraction: false,
			stopOnMouseEnter: true,
		})
	);
	const explorePlugin = useRef(
		Autoplay({
			delay: 3000,
			stopOnInteraction: false,
			stopOnMouseEnter: true,
		})
	);
	const tHero = useTranslations("hero");

	if (isLoading) return <Layout3Skeleton />;
	if (!mainGame || !sideGames || sideGames.length < 4) return null;

	// Create featured games array (main game + first 3 side games)
	const featuredGames = [mainGame, ...sideGames.slice(0, 3)];

	return (
		<div className="w-full space-y-8 py-8">
			{/* Header Section */}
			<div className="text-center space-y-3">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground">
					{tHero("layout3.headerTitle")}
				</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					{tHero("layout3.headerSubtitle")}
				</p>
			</div>

			{/* Dual Slider Layout */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
				{/* Slider 1: Featured Games */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold text-foreground">
							{tHero("layout3.slider1Title")}
						</h2>
						<Badge
							variant="outline"
							className="text-primary border-primary/30"
						>
							{tHero("layout3.slider1Badge")}
						</Badge>
					</div>

					<div className="relative">
						<Carousel
							plugins={[featuredPlugin.current]}
							className="w-full"
							opts={{
								align: "start",
								loop: true,
								slidesToScroll: 1,
							}}
						>
							<CarouselContent>
								{featuredGames.map((game, index) => (
									<CarouselItem
										key={`featured-${game.game_id}-${index}`}
									>
										<FeaturedGameCard game={game} />
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-border/50" />
							<CarouselNext className="right-4 bg-background/80 hover:bg-background border-border/50" />
						</Carousel>
					</div>
				</div>

				{/* Slider 2: More to Explore */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold text-foreground">
							{tHero("layout3.slider2Title")}
						</h2>
						<Badge
							variant="outline"
							className="text-secondary-foreground border-secondary/30"
						>
							{tHero("layout3.slider2Badge")}
						</Badge>
					</div>

					<div className="relative">
						<Carousel
							plugins={[explorePlugin.current]}
							className="w-full"
							opts={{
								align: "start",
								loop: true,
								slidesToScroll: 1,
							}}
						>
							<CarouselContent>
								{sideGames.map((game, index) => (
									<CarouselItem
										key={`explore-${game.game_id}-${index}`}
										className="basis-full sm:basis-1/2"
									>
										<CompactGameCard game={game} />
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-border/50" />
							<CarouselNext className="right-4 bg-background/80 hover:bg-background border-border/50" />
						</Carousel>
					</div>
				</div>
			</div>
		</div>
	);
};
