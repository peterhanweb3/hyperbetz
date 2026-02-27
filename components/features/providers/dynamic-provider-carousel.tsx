"use client";

import { useAppStore } from "@/store/store";
import { ProviderCarouselSection } from "./provider-carousel-section";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useMemo } from "react";
import { selectAllProviders } from "@/store/selectors/query/query.selectors";
import ProviderCarouselSectionSkeleton from "../skeletons/providers/provider-carousel-section-skeleton";

interface DynamicProviderCarouselProps {
	title: string;
	Icon: IconDefinition;
	maxProviders: number;
	searchKeyword?: string;
	customTitle?: string;
	isLoading?: boolean;
	firstRowFilter?: string;
	secondRowFilter?: string;
}

export const DynamicProviderCarousel = ({
	title,
	Icon,
	maxProviders = 16,
	searchKeyword,
	customTitle,
	isLoading,
	firstRowFilter = "live casino",
	secondRowFilter = "slot",
}: DynamicProviderCarouselProps) => {
	// Check loading status for the store data
	const status = useAppStore((state) => state.game.list.status);
	const allProviders = useAppStore(selectAllProviders);

	const filteredProviders = useMemo(() => {
		if (!searchKeyword?.trim()) return undefined;
		const keyword = searchKeyword.toLowerCase();
		return allProviders
			.filter((provider) => provider.name.toLowerCase().includes(keyword))
			.slice(0, maxProviders);
	}, [allProviders, searchKeyword, maxProviders]);

	// Handle loading state (optional, but good practice)

	if (typeof isLoading !== "undefined") {
		if (isLoading) {
			return (
				<ProviderCarouselSectionSkeleton
					isSingleRow={Boolean(searchKeyword?.trim())}
					totalItems={9}
				/>
			);
		}
	}

	if (
		typeof isLoading === "undefined" &&
		(status === "loading" || status === "idle")
	) {
		// Fallback to Zustand status only if isLoading is absent
		return (
			<ProviderCarouselSectionSkeleton
				isSingleRow={Boolean(searchKeyword?.trim())}
				totalItems={9}
			/>
		);
	}

	if (typeof isLoading === "undefined" && status === "error") {
		return (
			<p className="text-center p-10 text-destructive">
				Cannot load the providers, please try again later.
			</p>
		);
	}

	return (
		<ProviderCarouselSection
			title={
				customTitle
					? customTitle
					: searchKeyword
					? `${searchKeyword.toUpperCase()} Providers`
					: title
			}
			viewAllUrl="/providers"
			maxProviders={maxProviders}
			Icon={Icon}
			firstRowFilter={firstRowFilter}
			secondRowFilter={secondRowFilter}
			providers={filteredProviders}
			isSingleRow={Boolean(searchKeyword?.trim())}
		/>
	);
};
