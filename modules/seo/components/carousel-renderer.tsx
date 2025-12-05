"use client";

import { DynamicProviderCarousel } from "@/components/features/providers/dynamic-provider-carousel";
import {
	faCards,
	faFutbol,
	faSlotMachine,
	faTrophy,
} from "@fortawesome/pro-light-svg-icons";
import { GameCarouselSection } from "../../../components/features/games/game-carousel-section";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getUniqueValuesByKey,
	getGamesByCategory,
} from "@/lib/utils/games/games.utils";
import { useAppStore } from "@/store/store";
import { useTranslations } from "next-intl";
import { useMemo, useEffect, useState } from "react";
import { Game, GameType } from "@/types/games/gameList.types";

export const SpecificCategoryCarousel = ({
	type,
	searchKeyword,
	customTitle,
}: {
	type: "SLOT" | "LIVE CASINO" | "SPORTS";
	searchKeyword?: string;
	customTitle?: string;
}) => {
	const allGames = useAppStore((state) => state.game.list.games);
	const status = useAppStore((state) => state.game.list.status);
	const t = useTranslations("games");
	const [isClient, setIsClient] = useState(false);

	useEffect(() => setIsClient(true), []);

	// Determine category configuration
	const categoryConfig = useMemo(() => {
		let categoryKey = type as string;
		let title = "";
		let icon = faFutbol;

		if (type === "SLOT") {
			title = t("slots");
			icon = faSlotMachine;
		} else if (type === "LIVE CASINO") {
			title = t("liveCasino");
			icon = faCards;
		} else if (type === "SPORTS") {
			const gameCategories = getUniqueValuesByKey(allGames, "category");
			const sportsKey = gameCategories.find(
				(cat) => cat === "SPORTSBOOK" || cat === "SPORT BOOK"
			);
			if (sportsKey) categoryKey = sportsKey;
			title = "Sports";
			icon = faFutbol;
		}

		return { categoryKey, title, icon };
	}, [type, t, allGames]);

	// Filter games by category and search keyword - only on client
	const { filteredGames, totalCount } = useMemo(() => {
		if (!isClient) return { filteredGames: [], totalCount: 0 };

		const categoryGames = getGamesByCategory(
			allGames,
			categoryConfig.categoryKey as GameType,
			searchKeyword ? 5000 : 50
		);

		if (!searchKeyword?.trim()) {
			return {
				filteredGames: categoryGames.slice(0, 50),
				totalCount: categoryGames.length,
			};
		}

		const keyword = searchKeyword.toLowerCase();
		const filtered = (categoryGames as Game[]).filter((game) =>
			game.game_name.toLowerCase().includes(keyword)
		);

		return {
			filteredGames: filtered.slice(0, 50),
			totalCount: filtered.length,
		};
	}, [allGames, categoryConfig.categoryKey, searchKeyword, isClient]);

	if (status === "loading" || status === "idle" || !isClient) {
		return (
			<div className="w-full">
				<Skeleton className="h-8 w-48 mb-4" />
				<div className="flex space-x-4">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			</div>
		);
	}

	if (status === "error") return null;

	if (totalCount === 0 && searchKeyword) {
		return (
			<div className="w-full p-8 text-center">
				<p className="text-muted-foreground">
					No games found for &ldquo;{searchKeyword}&rdquo; in{" "}
					{categoryConfig.title}
				</p>
			</div>
		);
	}

	if (totalCount === 0) return null;

	return (
		<GameCarouselSection
			category={categoryConfig.categoryKey as GameType}
			games={filteredGames}
			title={
				customTitle
					? customTitle
					: searchKeyword
					? `${searchKeyword.toUpperCase()} Games`
					: categoryConfig.title
			}
			icon={categoryConfig.icon}
			itemsPerCarousel={{
				md: 3,
				lg: 5,
				xl: 5,
				"2xl": 6,
				"3xl": 7,
				"4xl": 7,
			}}
			maxVisibleGames={totalCount}
		/>
	);
};

interface CarouselConfig {
	enabled: boolean;
	position: "top" | "bottom";
	searchKeyword?: string;
	customTitle?: string;
}

interface CarouselsState {
	liveCasino: CarouselConfig;
	slots: CarouselConfig;
	sports: CarouselConfig;
	providers: CarouselConfig;
}

interface CarouselRendererProps {
	config: CarouselsState;
	position: "top" | "bottom";
}

export const CarouselRenderer = ({
	config,
	position,
}: CarouselRendererProps) => {
	if (!config) return null;

	return (
		<div className="flex flex-col gap-12 my-12 w-full">
			{config.liveCasino?.enabled &&
				config.liveCasino.position === position && (
					<SpecificCategoryCarousel
						type="LIVE CASINO"
						searchKeyword={config.liveCasino.searchKeyword}
						customTitle={config.liveCasino.customTitle}
					/>
				)}
			{config.slots?.enabled && config.slots.position === position && (
				<SpecificCategoryCarousel
					type="SLOT"
					searchKeyword={config.slots.searchKeyword}
					customTitle={config.slots.customTitle}
				/>
			)}
			{config.sports?.enabled && config.sports.position === position && (
				<SpecificCategoryCarousel
					type="SPORTS"
					searchKeyword={config.sports.searchKeyword}
					customTitle={config.sports.customTitle}
				/>
			)}
			{config.providers?.enabled &&
				config.providers.position === position && (
					<DynamicProviderCarousel
						title="Top Providers"
						Icon={faTrophy}
						maxProviders={16}
						customTitle={config.providers.customTitle}
						searchKeyword={config.providers.searchKeyword}
					/>
				)}
		</div>
	);
};
