"use client";

import { useAppStore } from "@/store/store";
import { ProviderCarouselSection } from "./provider-carousel-section";
import { Skeleton } from "@/components/ui/skeleton";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useMemo } from "react";
import { selectAllProviders } from "@/store/selectors/query/query.selectors";

interface DynamicProviderCarouselProps {
	title: string;
	Icon: IconDefinition;
	maxProviders: number;
	searchKeyword?: string;
	customTitle?: string;
}

export const DynamicProviderCarousel = ({
	title,
	Icon,
	maxProviders = 16,
	searchKeyword,
	customTitle,
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
	if (status === "loading" || status === "idle") {
		return (
			<div className="w-full space-y-4">
				<Skeleton className="h-8 w-48" />
				<div className="flex space-x-4">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-24 w-1/6" />
					))}
				</div>
			</div>
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
			firstRowFilter="live casino"
			secondRowFilter="slot"
			providers={filteredProviders}
			isSingleRow={Boolean(searchKeyword?.trim())}
		/>
	);
};
