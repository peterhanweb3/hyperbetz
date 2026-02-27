import type { ReactNode } from "react";
import { Game } from "@/types/games/gameList.types";

// --- Data Shape Definitions ---
export interface HeroSlideData {
	backgroundImageUrl: string;
	title: ReactNode;
	subtitle: string;
	buttonText: string;
	onButtonClick: () => void;
	game?: Game;
	/** Optional key to render localized content for known slides */
	i18nKey?: "guest" | "welcome" | "jackpot";
}

export interface InfoCardData {
	icon: ReactNode;
	title: string;
	badgeText: string;
	badgeColor?: "primary" | "secondary" | "destructive";
	description: string;
	linkText: string;
	href: string;
	/** Optional key to render localized content for known cards */
	i18nKey?: "casino" | "slots" | "sports" | "crypto";
	backgroundImage?: string;
}

// --- New types for Layout8 ---
export interface MainPromoData {
	title: string;
	subtitle: string;
	link: string;
	buttonText: string;
	bgImage: string;
	onButtonClick: () => void;
}

export interface SidePromoData {
	title: string;
	subtitle: string;
	buttonText: string;
	bgImage: string;
	onButtonClick: () => void;
}

export interface CasinoCategoryData {
	imageUrl: string;
	title: string;
	subtitle: string;
	bgClass: string;
	onClick: () => void;
} // --- Discriminated Union for Component Props ---

/**
 * Defines the props required specifically for Layout1.
 */
interface Layout1Props {
	layout: "layout1";
	slides: HeroSlideData[];
	cards: InfoCardData[];
}

/**
 * Defines the props required specifically for Layout2.
 */
interface Layout2Props {
	layout: "layout2";
	slides: HeroSlideData[];
	featuredGame: Game;
	cards: InfoCardData[];
}

/**
 * Defines the props required specifically for Layout3.
 */
interface Layout3Props {
	layout: "layout3";
	mainGame: Game;
	sideGames: Game[];
}

/**
 * Defines the props required specifically for Layout4.
 */
interface Layout4Props {
	layout: "layout4";
	featuredSlide: HeroSlideData;
	cards: InfoCardData[];
}

/**
 * Defines the props required specifically for Layout6.
 */
interface Layout6Props {
	layout: "layout6";
	slides: HeroSlideData[];
	featuredGame: Game;
	mainGame: Game;
	sideGames: Game[];
}

/**
 * Defines the props required specifically for Layout7.
 */
interface Layout7Props {
	layout: "layout7";
	slides: HeroSlideData[];
	cards?: InfoCardData[];
	featuredSlide: HeroSlideData;
	mainGame: Game;
	sideGames: Game[];
	featuredGame?: Game;
}

/**
 * Defines the props required specifically for Layout8.
 * This layout uses a casino-themed design with promotional banners and game categories.
 */
interface Layout8Props {
	layout: "layout8";
	mainPromo: MainPromoData;
	sidePromos: SidePromoData[];
	categories: CasinoCategoryData[];
}

/**
 * This is the main, public-facing props type for the HeroBannerSection component.
 * It is a union of all possible layout props. TypeScript will enforce that
 * if `layout` is "layout8", then `mainPromo`, `sidePromos`, and `categories` must be provided.
 */
export type HeroBannerSectionProps = (
	| Layout1Props
	| Layout2Props
	| Layout3Props
	| Layout4Props
	| Layout6Props
	| Layout7Props
	| Layout8Props
) & {
	isLoading?: boolean;
};
