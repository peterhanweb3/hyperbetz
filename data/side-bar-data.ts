import {
	faGift,
	faBullseye,
	faDice,
	faBolt,
	faSlotMachine,
	faCards,
	faFutbol,
	faHome,
	faSpade,
	faTicket,
	faChartLine,
	faArrowsRotate,
	faVrCardboard,
	faUsers,
} from "@fortawesome/pro-solid-svg-icons";
// } from "@fortawesome/pro-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// --- HELPER FUNCTIONS ---

/**
 * A helper to map known category names to specific FontAwesome icons.
 * This keeps the icon logic clean and centralized.
 * @param categoryName - The name of the game category (e.g., "SLOT").
 * @returns A FontAwesome icon definition.
 */
const getCategoryIcon = (categoryName: string): IconDefinition => {
	switch (categoryName.toUpperCase()) {
		case "SLOT":
			return faSlotMachine;
		case "LIVE CASINO":
			return faCards;
		case "SPORT BOOK":
			return faFutbol;
		// Add more specific icons as needed
		default:
			return faFutbol; // A sensible default icon
	}
};

/**
 * Checks if the current path is the home page.
 * @param pathname - The current pathname from usePathname()
 * @returns True if the current path is "/", false otherwise.
 */
// const isHomeActive = (pathname: string) => {
// 	return pathname === "/";
// };

/**
 * Checks if the current path is the lobby page.
 * @param pathname - The current pathname from usePathname()
 * @returns True if the current path is "/lobby", false otherwise.
 */
const isLobbyActive = (pathname: string) => {
	return pathname === "/lobby";
};

/**
 * Checks if the current path is the promotions page.
 * @param pathname - The current pathname from usePathname()
 * @returns True if the current path is "/promotions", false otherwise.
 */
// const isPromotionsActive = (pathname: string) => {
// 	return pathname === "/promotions";
// };
/**
 * Checks if the current path is the promotions page.
 * @param pathname - The current pathname from usePathname()
 * @returns True if the current path is "/promotions", false otherwise.
 */
const isAffiliateActive = (pathname: string) => {
	return pathname === "/affiliate";
};
/**
 * Checks if the current path is the promotions page.
 * @param pathname - The current pathname from usePathname()
 * @returns True if the current path is "/promotions", false otherwise.
 */
const isBonusActive = (pathname: string) => {
	return pathname === "/bonus";
};

/**
 * Create SEO-friendly URL for games filtered by provider
 * @param providerName - The provider name (e.g., "PG Soft")
 * @returns A URL string like "/games/pg-soft"
 */
const createGamesLink = (filterType: string, filterValue: string) => {
	if (filterType === "provider_name") {
		// Convert provider name to SEO-friendly slug
		const slug = filterValue
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/\./g, "");
		return `/games/${slug}`;
	}
	// Fallback for other filter types
	const params = new URLSearchParams();
	params.set(filterType, filterValue);
	return `/games?${params.toString()}`;
};

/**
 * Create SEO-friendly URL for providers filtered by category
 * @param category - The category name (e.g., "SLOT", "LIVE CASINO")
 * @returns A URL string like "/providers/slot" or "/providers/live-casino"
 */
const createProvidersLink = (filterType: string, filterValue: string) => {
	if (filterType === "category") {
		// Special case for Sports
		if (filterValue === "SPORTS") {
			return `/games/sbo`;
		}
		// Convert category to SEO-friendly slug
		const slug = filterValue.toLowerCase().trim().replace(/\s+/g, "-");
		return `/providers/${slug}`;
	}
	// Fallback
	const params = new URLSearchParams();
	params.set(filterType, filterValue);
	return `/providers?${params.toString()}`;
};

// --- MAIN DATA ASSEMBLER ---

/**
 * Defines the shape of the dynamically generated data required by this function.
 * This data should be pre-calculated by a selector.
 */
interface NavDataArgs {
	categories: { name: string; count: number }[];
	providers: { name: string; count: number }[];
	pathname: string; // Add pathname to the interface
	isLoggedIn: boolean;
}

/**
 * Assembles the complete sidebar navigation data structure.
 * This is now a "dumb" function that receives dynamically generated data
 * for categories and providers, and combines it with static navigation links.
 * @param pathname - The current pathname from usePathname() hook
 */
export const getNavData = ({
	categories = [],
	providers = [],
	pathname,
	isLoggedIn,
}: NavDataArgs) => {
	let HomeLobbyTitle = "navigation.home";
	let HomeLobbyPath = "/";

	if (isLoggedIn) {
		HomeLobbyTitle = "navigation.lobby";
		HomeLobbyPath = "/lobby";
	}

	return {
		// --- Static User Section ---
		user: {
			name: "Crypto Player",
			email: "player@hyperbetz.com",
			avatar: "/avatars/player.jpg",
		},
		// hell;o

		// --- Static Main Navigation ---
		navMain: [
			// {
			// 	title: "Home",
			// 	url: "/",
			// 	icon: Home,
			// 	isActive: isHomeActive(pathname),
			// },
			{
				title: HomeLobbyTitle,
				url: HomeLobbyPath,
				icon: faHome,
				isActive: isLobbyActive(pathname),
			},
			// {
			// 	title: "navigation.promotions",
			// 	url: "/promotions",
			// 	icon: faGift,
			// 	badge: "Hot",
			// 	badgeVariant: "destructive" as const,
			// 	isActive: isPromotionsActive(pathname),
			// },
			{
				title: "navigation.affiliate",
				url: "/affiliate",
				icon: faUsers,
				// badge: "Hot",
				// badgeVariant: "destructive" as const,
				isActive: isAffiliateActive(pathname),
			},
			{
				title: "navigation.bonus",
				url: "/bonus",
				icon: faGift,
				// badge: "Hot",
				// badgeVariant: "destructive" as const,
				isActive: isBonusActive(pathname),
			},
		],

		// --- Static Quick Actions ---
		quickActions: [
			{
				title: "QUEST",
				url: "/quest",
				icon: faBullseye,
				variant: "secondary" as const,
				description: "Complete challenges",
			},
			{
				title: "SPIN",
				url: "/spin",
				icon: faDice,
				variant: "destructive" as const,
				description: "Try your luck",
			},
		],

		// --- Static Crypto Section ---
		cryptoSection: {
			title: "BUY CRYPTO",
			items: [
				{ title: "BAHT", symbol: "฿", url: "/buy/baht" },
				{ title: "SHEKEL", symbol: "₪", url: "/buy/shekel" },
				{ title: "LIRA", symbol: "₺", url: "/buy/lira" },
			],
		},

		// --- Static Telegram Section ---
		telegram: {
			title: "sidebar.playOnTelegram",
			url: "/telegram",
			icon: faBolt,
		},

		// --- DYNAMICALLY GENERATED Game Categories ---
		// It maps over the data provided by the selector.
		// If the API returns a new category, it will automatically appear here.
		gameCategories: categories.map((category) => ({
			title: category.name,
			url: createProvidersLink("category", category.name),
			icon: getCategoryIcon(category.name),
			count: category.count, // Use the real, calculated count
		})),

		// --- STATIC Game Categories ---
		// These are always available regardless of API data
		staticGameCategories: [
			// {
			// 	title: "games.sports",
			// 	url: "/providers?category=SPORT+BOOK",
			// 	icon: faFutbol,
			// },
			{
				title: "games.poker",
				url: "/games?q=poker",
				icon: faSpade,
				count: 696969,
				isnewTab: false,
			},
			{
				title: "games.lottery",
				url: "/games?q=lottery",
				icon: faTicket,
				count: 696969,
				isnewTab: false,
			},
			{
				title: "games.futures",
				url: "#", // Will launch Stock Market game directly
				icon: faChartLine,
				count: 696969,
				isnewTab: true,
			},
			{
				title: "games.vr",
				url: "#", // Will launch Gonzo's Treasure Map game directly
				icon: faVrCardboard,
				count: 696969,
				isnewTab: true,
			},
			{
				title: "games.swap",
				url: "?tab=swap", // This will be handled by modal with URL sync
				icon: faArrowsRotate,
				isnewTab: false,
				// count: 0,
			},
		],

		// This section includes other static game-related links.
		// It is merged with the dynamic categories.
		// otherGameLinks: [
		//   {
		//     title: "DeFi",
		//     url: "/defi",
		//     icon: ChartLine,
		//     badge: "New",
		//     badgeVariant: "secondary" as const,
		//   },
		//   {
		//     title: "Lottery",
		//     url: "/lottery",
		//     icon: Ticket,
		//   },
		//   {
		//     title: "Futures",
		//     url: "/futures",
		//     icon: TrendingUp,
		//   },
		//   {
		//     title: "Tournament",
		//     url: "/tournament",
		//     icon: Users,
		//   },
		// ],

		// --- DYNAMICALLY GENERATED Game Providers ---
		// It maps over the provider data from the selector.
		// We still slice it to keep the sidebar from becoming too long.
		providers: providers.map((provider) => ({
			title: provider.name,
			url: createGamesLink("provider_name", provider.name),
			count: provider.count, // Use the real, calculated count
		})),

		// --- About Section ---
		// aboutSection: {
		// 	title: "navigation.about",
		// 	url: "/about",
		// 	icon: faUsers,
		// 	isActive: pathname === "/about",
		// },

		// --- Static Daily Bonus Section ---
		dailyBonus: {
			title: "sidebar.dailyBonus",
			url: "/bonus",
			icon: faGift,
			variant: "default" as const,
		},
	};
};
