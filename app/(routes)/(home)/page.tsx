"use client";

import { useEffect, useCallback, useState } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useRouter } from "next/navigation";

// Import the UI Sections
import { HeroBannerSection } from "@/components/features/banners/hero/hero-banner-section";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useT } from "@/hooks/useI18n";
import { faTrophy } from "@fortawesome/pro-light-svg-icons";
import dynamic from "next/dynamic";
import { getLatestPostsAction } from "@/modules/blog/actions/home";
// import ExploreSection from "@/components/features/games/explore-section";
import { LiveBettingTableSkeleton } from "@/components/features/skeletons/betting/live-betting-table-skeleton";
import BlogCardsSliderSkeleton from "@/modules/blog/components/BlogCardsSliderSkeleton";
import ProviderCarouselSectionSkeleton from "@/components/features/skeletons/providers/provider-carousel-section-skeleton";
import DynamicGameCarouselListSkeleton from "@/components/features/skeletons/games/games-by-category-section-skeleton";

const LazyExploreSection = dynamic(
	() =>
		import("@/components/features/games/explore-section").then((mod) => ({
			default: mod.default,
		})),
	{
		ssr: false,
		loading: () => (
			<DynamicGameCarouselListSkeleton totalRows={3} totalColumns={5} />
		),
	}
);
const LazyGameCarouselList = dynamic(
	() =>
		import("@/components/features/games/games-by-category-section").then(
			(mod) => ({ default: mod.DynamicGameCarouselList })
		),
	{
		ssr: false,
		loading: () => (
			<DynamicGameCarouselListSkeleton totalRows={3} totalColumns={5} />
		),
	}
);

const LazyProviderCarousel = dynamic(
	() =>
		import(
			"@/components/features/providers/dynamic-provider-carousel"
		).then((mod) => ({ default: mod.DynamicProviderCarousel })),
	{
		ssr: false,
		loading: () => (
			<ProviderCarouselSectionSkeleton
				isSingleRow={false}
				totalItems={9}
			/>
		),
	}
);

const LazyLiveBettingTable = dynamic(
	() =>
		import("@/components/features/betting/live-betting-table").then(
			(mod) => ({ default: mod.LiveBettingTable })
		),
	{ ssr: false, loading: () => <LiveBettingTableSkeleton /> }
);

const LazyBlogCardsSlider = dynamic(
	() =>
		import("@/modules/blog/components/BlogCardsSlider").then((mod) => ({
			default: mod.BlogCardsSlider,
		})),
	{ ssr: false, loading: () => <BlogCardsSliderSkeleton /> }
);

export default function HomePage() {
	const t = useT();
	const router = useRouter();
	const [blogPosts, setBlogPosts] = useState<Record<string, unknown>[]>([]);

	// --- 1. Get Authentication and UI State ---
	const {
		isLoggedIn,
		login,
		isLoading: isAuthLoading,
		isAuthCheckComplete,
	} = useDynamicAuth();
	const { heroBanner, initializeHeroBanner, updateHeroBannerGames } =
		useAppStore((state) => state.uiDefinition.heroBanner);

	// Get game data and status. It's already being loaded by the RootLayout.
	const allGames = useAppStore((state) => state.game.list.games);
	const gameStatus = useAppStore((state) => state.game.list.status);

	// --- 2. Logic to Set the Default Hero Banner ---
	useEffect(() => {
		if (!heroBanner) {
			initializeHeroBanner({ isLoggedIn, login, allGames, router });
		}
	}, [heroBanner, initializeHeroBanner, isLoggedIn, login, allGames, router]);

	useEffect(() => {
		const isDataReady = gameStatus === "success" && allGames.length > 0;
		if (heroBanner && isDataReady) {
			updateHeroBannerGames({ isLoggedIn, login, allGames, router });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		gameStatus,
		allGames,
		isLoggedIn,
		login,
		router,
		updateHeroBannerGames,
		// heroBanner is intentionally omitted to avoid infinite loops
	]);

	const { primaryWallet } = useDynamicContext();
	const setDynamicLoaded = useAppStore((state) => state.setDynamicLoaded);

	useEffect(() => {
		if (primaryWallet !== null) {
			setDynamicLoaded(true);
		}
	}, [primaryWallet, setDynamicLoaded]);

	const [hasHandledLoginRedirect, setHasHandledLoginRedirect] =
		useState(false);

	const handleReferralRedirect = useCallback(() => {
		if (typeof window === "undefined") {
			return;
		}
		const params = new URLSearchParams(window.location.search);
		const referralParam =
			params.get("r") ||
			params.get("referrer") ||
			params.get("referralId");
		if (referralParam) {
			localStorage.setItem("referralId", referralParam);
		}
		router.replace("/lobby");
	}, [router]);

	// AUTO-REDIRECT: When user logs in on home page, redirect to lobby
	// Wait for auth to be fully initialized before making redirect decision
	useEffect(() => {
		// Wait for auth to complete initialization
		if (isAuthLoading || !isAuthCheckComplete) {
			return;
		}

		// Don't redirect if already handled
		if (hasHandledLoginRedirect) {
			return;
		}

		// If user is logged in, redirect to lobby
		if (isLoggedIn) {
			const authToken = localStorage.getItem(
				"dynamic_authentication_token"
			);

			if (authToken) {
				// Mark as handled BEFORE redirect to prevent race conditions
				setHasHandledLoginRedirect(true);
				handleReferralRedirect();
			}
		}
	}, [
		isAuthLoading,
		isAuthCheckComplete,
		isLoggedIn,
		hasHandledLoginRedirect,
		handleReferralRedirect,
	]);
	// --- 3. Assemble the Page ---
	const isLoading = gameStatus !== "success";
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const posts = await getLatestPostsAction();
				setBlogPosts(posts);
			} catch (error) {
				console.error("Failed to fetch blog posts:", error);
			}
		};
		fetchPosts();
	}, []);

	return (
		<>
			<div className="container mx-auto flex flex-1 flex-col gap-8 py-8">
				{heroBanner && (
					<HeroBannerSection {...heroBanner} isLoading={isLoading} />
				)}
				<LazyExploreSection isLoading={isLoading} />
				{/* These components now hydrate off the main thread to keep TBT low. */}
				<LazyGameCarouselList isLoading={isLoading} />
				<LazyProviderCarousel
					title={t("home.topProviders")}
					Icon={faTrophy}
					maxProviders={16}
					isLoading={isLoading}
				/>
				<LazyLiveBettingTable />
				<LazyBlogCardsSlider
					posts={blogPosts}
					isLoading={blogPosts.length > 0 ? false : true}
				/>
			</div>
		</>
	);
}
