"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useRouter } from "next/navigation";

// Import the UI Sections
import { HeroBannerSection } from "@/components/features/banners/hero/hero-banner-section";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useT } from "@/hooks/useI18n";
import { faTrophy } from "@fortawesome/pro-light-svg-icons";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeferredRender } from "@/hooks/use-deferred-render";

const LazyGameCarouselList = dynamic(
	() =>
		import("@/components/features/games/games-by-category-section").then(
			(mod) => ({ default: mod.DynamicGameCarouselList })
		),
	{ ssr: false }
);

const LazyProviderCarousel = dynamic(
	() =>
		import(
			"@/components/features/providers/dynamic-provider-carousel"
		).then((mod) => ({ default: mod.DynamicProviderCarousel })),
	{ ssr: false }
);

const LazyLiveBettingTable = dynamic(
	() =>
		import("@/components/features/betting/live-betting-table").then(
			(mod) => ({ default: mod.LiveBettingTable })
		),
	{ ssr: false }
);

const SectionSkeleton = ({ rows = 1 }: { rows?: number }) => (
	<div className="space-y-6">
		{Array.from({ length: rows }).map((_, index) => (
			<div key={index} className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
					{Array.from({ length: 6 }).map((__, cardIndex) => (
						<Skeleton
							key={cardIndex}
							className="h-32 w-full rounded-xl"
						/>
					))}
				</div>
			</div>
		))}
	</div>
);

const BettingSkeleton = () => (
	<div className="space-y-4">
		<Skeleton className="h-8 w-56" />
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{Array.from({ length: 4 }).map((_, index) => (
				<Skeleton key={index} className="h-20 w-full rounded-xl" />
			))}
		</div>
		<div className="space-y-2">
			{Array.from({ length: 6 }).map((_, index) => (
				<Skeleton key={index} className="h-12 w-full rounded-lg" />
			))}
		</div>
	</div>
);

export default function HomePage() {
	const t = useT();
	const router = useRouter();

	// --- 1. Get Authentication and UI State ---
	const { isLoggedIn, login } = useDynamicAuth();
	const { heroBanner, initializeHeroBanner } = useAppStore(
		(state) => state.uiDefinition.heroBanner
	);

	// Get game data and status. It's already being loaded by the RootLayout.
	const allGames = useAppStore((state) => state.game.list.games);
	const gameStatus = useAppStore((state) => state.game.list.status);

	// --- 2. Logic to Set the Default Hero Banner ---
	// This effect runs when data is ready and sets the hero banner state if it's not already set.
	useEffect(() => {
		const isDataReady = gameStatus === "success" && allGames.length > 0;

		// Only initialize if data is ready AND if the banner state hasn't been set by user interaction yet.
		if (isDataReady && !heroBanner) {
			initializeHeroBanner({ isLoggedIn, login, allGames, router });
		}
	}, [
		gameStatus,
		allGames,
		isLoggedIn,
		login,
		router,
		initializeHeroBanner,
		heroBanner,
	]);

	const { primaryWallet } = useDynamicContext();
	const setDynamicLoaded = useAppStore((state) => state.setDynamicLoaded);

	useEffect(() => {
		if (primaryWallet !== null) {
			setDynamicLoaded(true);
		}
	}, [primaryWallet, setDynamicLoaded]);

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

	useEffect(() => {
		if (!isLoggedIn) {
			return;
		}
		handleReferralRedirect();
	}, [handleReferralRedirect, isLoggedIn]);

	// --- 3. Assemble the Page ---
	const isLoading = gameStatus !== "success";
	const [isClient, setIsClient] = useState(false);
	const deferredSecondary = useDeferredRender({ delay: 250, timeout: 1400 });

	useEffect(() => setIsClient(true), []);

	const shouldRenderSecondary = useMemo(
		() => isClient && deferredSecondary,
		[deferredSecondary, isClient]
	);

	return (
		<>
			{/* 
        The HeroBannerSection renders based on the global state from the uiDefinition slice.
        The spread operator `{...heroBanner}` cleanly passes all the correct, pre-built props.
      */}
			{heroBanner && (
				<HeroBannerSection {...heroBanner} isLoading={isLoading} />
			)}

			<div className="container mx-auto flex flex-1 flex-col gap-8 py-8">
				{/* These components now hydrate off the main thread to keep TBT low. */}
				{shouldRenderSecondary ? (
					<LazyGameCarouselList />
				) : (
					<SectionSkeleton rows={2} />
				)}
				{shouldRenderSecondary ? (
					<LazyProviderCarousel
						title={t("home.topProviders")}
						Icon={faTrophy}
						maxProviders={16}
					/>
				) : (
					<SectionSkeleton rows={1} />
				)}
				<section className="w-full">
					{shouldRenderSecondary ? (
						<LazyLiveBettingTable />
					) : (
						<BettingSkeleton />
					)}
				</section>
			</div>
		</>
	);
}
