// 1. Updated HeroBannerSection.tsx
import {
	HeroBannerSectionProps,
	InfoCardData,
} from "@/types/features/hero-banner-section.types";
import { Layout1 } from "./Layout1/Layout1";
import { Layout2 } from "./Layout2/Layout2";
import { Layout3 } from "./Layout3/Layout3";
import { Layout4 } from "./Layout4/Layout4";
import { Layout6 } from "./Layout6/Layout6";
import { Layout7 } from "./Layout7/Layout7";
import { Layout8 } from "./Layout8/Layout8";
/**
 * The main HeroBannerSection component.
 * Its props are a discriminated union, making it fully type-safe and scalable.
 */
export const HeroBannerSection = (props: HeroBannerSectionProps) => {
	// Pass down the `isLoading` prop to all layouts.
	const { isLoading = false } = props;

	switch (props.layout) {
		case "layout1":
			// Inside this case, TypeScript KNOWS that `props` has `slides` and `cards`.
			// No optional chaining or type assertions are needed. It's perfectly safe.
			return (
				<Layout1
					slides={props.slides}
					cards={props.cards}
					isLoading={isLoading}
				/>
			);

		case "layout2":
			return (
				<Layout2
					slides={props.slides}
					featuredGame={props.featuredGame}
					cards={props.cards}
					isLoading={isLoading}
				/>
			);

		case "layout3": // <-- NEW CASE
			return (
				<Layout3
					mainGame={props.mainGame}
					sideGames={props.sideGames}
					isLoading={isLoading}
				/>
			);

		case "layout4": // <-- NEW CASE
			return (
				<Layout4
					featuredSlide={props.featuredSlide}
					cards={props.cards}
					isLoading={isLoading}
				/>
			);

		case "layout6":
			return (
				<Layout6
					slides={props.slides}
					featuredGame={props.featuredGame}
					mainGame={props.mainGame}
					sideGames={props.sideGames}
					isLoading={isLoading}
				/>
			);

		case "layout7":
			return (
				<Layout7
					slides={props.slides}
					cards={props.cards as InfoCardData[]}
					mainGame={props.mainGame}
					sideGames={props.sideGames}
					featuredSlide={props.featuredSlide}
					isLoading={isLoading}
				/>
			);

		case "layout8":
			return (
				<Layout8
					mainPromo={props.mainPromo}
					sidePromos={props.sidePromos}
					categories={props.categories}
					isLoading={isLoading}
				/>
			);

		default:
			return null;
	}
};
