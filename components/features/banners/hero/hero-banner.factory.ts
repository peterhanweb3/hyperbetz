import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Game } from "@/types/games/gameList.types";
import {
	convertGamesToHeroSlides,
	getNewestGames,
	getPopularGames,
} from "@/lib/utils/games/games.utils";
import { mockHeroSlides, mockInfoCards, guestSlides } from "@/data/mock-data";
import { HeroBannerSectionProps } from "@/types/features/hero-banner-section.types";

/**
 * Defines all the raw data dependencies that our factory functions might need.
 * By passing this single object, we keep our function signatures clean.
 */
interface HeroPropsFactoryDependencies {
	isLoggedIn: boolean;
	login: () => void;
	allGames: Game[];
	router: AppRouterInstance;
}

// A type for the functions that build our props.
type PropBuilder = (
	deps: HeroPropsFactoryDependencies
) => HeroBannerSectionProps;

/**
 * This factory object is the single source of truth for creating the props for each layout.
 * To add a new layout, you only need to add a new entry here.
 */
export const heroBannerPropsFactory: Record<
	| "layout1"
	| "layout2"
	| "layout3"
	| "layout4"
	| "layout6"
	| "layout7"
	| "layout8",
	PropBuilder
> = {
	/**
	 * Builder for Layout 1.
	 * This layout uses static promotional content.
	 */

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	layout1: (_deps: HeroPropsFactoryDependencies): HeroBannerSectionProps => {
		// Note: This file is not a React component, so we cannot call hooks here.
		// We keep raw data in mock-data but the actual components will render localized strings.
		return {
			layout: "layout1",
			slides: mockHeroSlides,
			cards: mockInfoCards,
		};
	},

	// eslint-enable-next-line @typescript-eslint/no-unused-vars
	/**
	 * Builder for Layout 2.
	 * This layout's content changes based on the user's authentication state.
	 */
	layout2: (deps: HeroPropsFactoryDependencies): HeroBannerSectionProps => {
		const { isLoggedIn, login, allGames, router } = deps;

		// The logic to build the correct slides based on login state is now centralized here.
		const loggedInSlides = convertGamesToHeroSlides(
			getPopularGames(allGames, 4),
			router
		);
		guestSlides[0].onButtonClick = login; // Dynamically assign the login function

		const dynamicGuestSlides = guestSlides.map((slide, index) => {
			if (index === 0) {
				return {
					...slide,
					onButtonClick: login,
				};
			}
			return slide;
		});

		return {
			layout: "layout2",
			slides: isLoggedIn ? loggedInSlides : dynamicGuestSlides,
			featuredGame: getPopularGames(allGames, 500)[
				Math.floor(Math.random() * 500)
			],
			cards: mockInfoCards.slice(0, 3), // Layout 2 uses 3 info cards
		};
	},

	/**
	 * Builder for Layout 3.
	 */
	layout3: (deps): HeroBannerSectionProps => {
		const { allGames } = deps;
		return {
			layout: "layout3",
			mainGame: getPopularGames(allGames, 2)[0],
			sideGames: getNewestGames(allGames, 6),
		};
	},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	layout4: (_deps): HeroBannerSectionProps => {
		return {
			layout: "layout4",
			featuredSlide: mockHeroSlides[1], // Use the "Mega Jackpot" slide for example
			cards: mockInfoCards.slice(0, 4),
		};
	},

	layout6: (deps: HeroPropsFactoryDependencies): HeroBannerSectionProps => {
		const { allGames } = deps;

		const featuredGame = getPopularGames(allGames, 500)[
			Math.floor(Math.random() * 500)
		];

		const mainGame = getPopularGames(allGames, 4)[0]; // Main game for featured slider
		const sideGames = getNewestGames(allGames, 8); // Side games for both sliders

		return {
			layout: "layout6",
			slides: mockHeroSlides,
			featuredGame,
			mainGame,
			sideGames,
		};
	},

	layout7: (deps: HeroPropsFactoryDependencies): HeroBannerSectionProps => {
		const { allGames } = deps;

		const mainGame = getPopularGames(allGames, 500)[
			Math.floor(Math.random() * 500)
		]; // Random featured
		const sideGames = getNewestGames(allGames, 6); // Side slider

		return {
			layout: "layout7",
			slides: mockHeroSlides,
			cards: mockInfoCards.slice(0, 3), // Keep exactly 3 cards for bottom section
			featuredSlide: mockHeroSlides[0],
			mainGame,
			sideGames,
		};
	},

	layout8: (deps: HeroPropsFactoryDependencies): HeroBannerSectionProps => {
		const { isLoggedIn, login, router } = deps;

		return {
			layout: "layout8",
			mainPromo: {
				title: "Refer friends & earn rewards – Join LUCKY DRIVE today!",
				subtitle: "",
				link: "/affiliate",
				buttonText: "Reffer Now!",
				bgImage: "/Untitled design (28).png",
				onButtonClick: () => "",
			},
			sidePromos: [
				{
					title: "Cashback up to 30% on casinos",
					subtitle: " Get 50 free spins",
					buttonText: "Go to casino",
					bgImage: "/Untitled design (29).png",
					onButtonClick: () => {
						// Navigate to Providers page filtered to Live Casino
						router.push("/providers?category=LIVE+CASINO");
					},
				},
				{
					title: "Bonus +500%",
					subtitle: "Double your winnings",
					buttonText: "Registration",
					bgImage: "/_ (17) (1).jpeg",
					onButtonClick: () => {
						// If wallet not connected, show auth flow; otherwise open deposit tab in lobby
						if (!isLoggedIn) {
							login(); // Triggers setShowAuthFlow(true)
						} else {
							router.push("/lobby?tab=deposit");
						}
					},
				},
			],
			categories: [
				{
					imageUrl: "/Untitled design (31).png",
					title: "Slots",
					subtitle: "Over 5000 games",
					bgClass: "bg-[#0B1320]", // dark navy
					onClick: () => {
						router.push("/providers?category=SLOT");
					},
				},
				{
					imageUrl: "/Untitled design (24).png",
					title: "Live Casino",
					subtitle: "Over 500 games",
					bgClass: "bg-[#101A2E]", // slightly lighter dark
					onClick: () => {
						router.push("/providers?category=LIVE+CASINO");
					},
				},
				{
					imageUrl: "/Untitled design (32).png",
					title: "Lottery",
					subtitle: " Instant result",
					bgClass: "bg-[#0E1627]", // another variation
					onClick: () => {
						router.push("/games?q=lottery");
					},
				},
				{
					imageUrl: "/Untitled design (30).png",
					title: "Poker",
					subtitle: "Tournaments",
					bgClass: "bg-[#141F36]", // bluish dark
					onClick: () => {
						router.push("/games?q=poker");
					},
				},
			],
		};
	},
};
