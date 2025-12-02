import {
	HeroSlideData,
	InfoCardData,
} from "@/types/features/hero-banner-section.types";
// import { Crown, Flame, Gamepad2, Gift, Spade } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCards,
	faFutbolBall,
	faSlotMachine,
} from "@fortawesome/pro-light-svg-icons";
// Use a public path string instead of importing the asset to avoid sharp/module resolution issues in Turbopack

export const guestSlides: HeroSlideData[] = [
	{
		backgroundImageUrl: "/assets/banners/hero/slide-2.webp",
		i18nKey: "guest",
		title: <span className="text-destructive">Join the Action</span>,
		subtitle: "Sign up now and get an exclusive welcome bonus!",
		buttonText: "Register Now",
		onButtonClick: () => {}, // This will be replaced dynamically.
	},
];

export const mockHeroSlides: HeroSlideData[] = [
	{
		backgroundImageUrl:
			"https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=1200&h=600&fit=crop&auto=format",
		i18nKey: "welcome",
		title: (
			<>
				<span className="text-destructive">Welcome Bonus</span>
				<br />
				Up to 590%
			</>
		),
		subtitle: "+ 225 Free Spins",
		buttonText: "Deposit & Get",
		onButtonClick: () => alert("Deposit Button Clicked!"),
	},
	{
		backgroundImageUrl:
			"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop&auto=format",
		i18nKey: "jackpot",
		title: (
			<>
				<span className="text-primary">Mega Jackpot</span>
				<br />
				$1,000,000
			</>
		),
		subtitle: "Play Now & Win Big",
		buttonText: "Play Now",
		onButtonClick: () => alert("Play Now Button Clicked!"),
	},
	{
		backgroundImageUrl:
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&auto=format",
		title: (
			<>
				<span className="text-yellow-400">VIP Rewards</span>
				<br />
				Exclusive Benefits
			</>
		),
		subtitle: "Join our VIP program and unlock premium rewards",
		buttonText: "Become VIP",
		onButtonClick: () => alert("VIP Button Clicked!"),
	},
	{
		backgroundImageUrl:
			"https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&h=600&fit=crop&auto=format",
		title: (
			<>
				<span className="text-green-400">Daily Tournaments</span>
				<br />
				Win Big Prizes
			</>
		),
		subtitle: "Compete with players worldwide for amazing rewards",
		buttonText: "Join Tournament",
		onButtonClick: () => alert("Tournament Button Clicked!"),
	},
	{
		backgroundImageUrl:
			"https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=600&fit=crop&auto=format",
		title: (
			<>
				<span className="text-purple-400">Crypto Casino</span>
				<br />
				Fast & Secure
			</>
		),
		subtitle: "Play with Bitcoin, Ethereum and other cryptocurrencies",
		buttonText: "Play with Crypto",
		onButtonClick: () => alert("Crypto Button Clicked!"),
	},
	{
		backgroundImageUrl:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop&auto=format",
		title: (
			<>
				<span className="text-orange-400">Live Casino</span>
				<br />
				Real Dealers
			</>
		),
		subtitle: "Experience authentic casino gaming with live dealers",
		buttonText: "Go Live",
		onButtonClick: () => alert("Live Casino Button Clicked!"),
	},
];

export const mockInfoCards: InfoCardData[] = [
	{
		icon: <FontAwesomeIcon icon={faCards} fontSize={22} />,
		i18nKey: "casino",
		title: "Casino",
		badgeText: "590+ GAMES",
		badgeColor: "destructive",
		description:
			"Enjoy Hyperbetz Originals and other casino games from top providers.",
		linkText: "Go to Casino",
		href: "/providers/live-casino",
		// backgroundImage: "/assets/banners/hero/casino.png", // Example PNG image
		backgroundImage: "/assets/banners/hero/casino_gif.webm", // Example PNG image
	},
	{
		icon: <FontAwesomeIcon icon={faSlotMachine} fontSize={22} />,
		i18nKey: "slots",
		title: "Slots",
		badgeText: "TOP SLOTS",
		badgeColor: "primary",
		description:
			"Spin the reels and hit massive jackpots with our premium slot collection.",
		linkText: "Go to Slots",
		href: "/providers/slot",
		backgroundImage: "/assets/banners/hero/slot_gif.webm", // Example PNG image
	},
	{
		icon: <FontAwesomeIcon icon={faFutbolBall} fontSize={22} />,
		i18nKey: "sports",
		title: "Sports",
		badgeText: "FREE BETS",
		description:
			"Bet on your favorite teams and sports events with competitive odds.",
		linkText: "Go to Sports",
		href: "/games/sbo",
		backgroundImage: "/assets/banners/hero/sports_gif.webm", // Example PNG image
	},
];
