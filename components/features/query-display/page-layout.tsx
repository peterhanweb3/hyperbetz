"use client";

import { useAppStore } from "@/store/store";
import { useState, useMemo } from "react";
import { ViewMode } from "./grid-list-toggle";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// --- Import the UI "Lego Bricks" ---
// import { QuerySearchInput } from "./query-search-input";
import { QuerySortDropdown } from "./query-sort-dropdown";
import { GridListToggle } from "./grid-list-toggle";
import { ActiveFilterPills } from "./active-filter-pills";
import { QueryResultsGrid } from "./query-results-grid";
import { InfiniteScrollLoader } from "./infinite-scroll-loader";

// --- Import the "Engine" (Selectors) ---
import {
	selectVisibleGames,
	// selectAvailableFilters,
	selectFilteredAndSortedGames,
} from "@/store/selectors/query/query.selectors";
import { useQueryManager } from "@/hooks/use-query-manager";
import { QueryPageSkeleton } from "./query-page-skeleton";
// import { QueryFilterDropdownWithSearch } from "./query-filter-dropdown-with-search";
// import FilterSelectionPills from "./filter-selection-pills";
import { useTranslations } from "@/lib/locale-provider";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useSearchParams, usePathname } from "next/navigation";

export const QueryPageLayout = () => {
	// --- Connect to the "Brain" (Zustand Store) ---
	const {
		// searchQuery,
		activeFilters,
		sortBy,
	} = useAppStore((state) => state.query);
	const { showMoreItems } = useAppStore((state) => state.query);
	const {
		handleToggleFilter,
		handleClearFilters,
		// handleSearch,
		handleSort,
	} = useQueryManager();

	const searchParams = useSearchParams();
	const pathname = usePathname();

	// --- Connect to the "Engine" (Reselect Selectors) ---
	const visibleGames = useAppStore(selectVisibleGames);
	// const availableFilters = useAppStore(selectAvailableFilters);
	const totalFilteredCount = useAppStore(selectFilteredAndSortedGames).length;

	// Find the specific data for each new component
	// const categorySection = availableFilters.find((s) => s.id === "category");
	// const providerSection = availableFilters.find(
	// 	(s) => s.id === "provider_name"
	// );

	// --- NEW: Add translations and header configuration ---
	const tGames = useTranslations("games");
	const tNavigation = useTranslations("navigation");
	const query = searchParams.get("q") || "";
	// console.log("==-=-----=--=--=-=--=-=-=--=-=--=--=-=-=-=-=--=--=-=-=-=-",activeFilters)

	// Get current category filter for header
	const currentCategoryFilter = activeFilters["category"]?.[0] || "";

	// Generate breadcrumb from pathname
	const getBreadcrumbItems = useMemo(() => {
		const pathSegments = pathname.split("/").filter(Boolean);
		const breadcrumbItems = [
			{
				label: tNavigation("home"),
				href: "/",
				isActive: false,
			},
		];

		if (pathSegments.length > 0) {
			let currentPath = "";
			pathSegments.forEach((segment, index) => {
				currentPath += `/${segment}`;
				const isLast = index === pathSegments.length - 1;

				// Smart breadcrumb labeling
				let label = segment;

				// Try to get translation from navigation first
				const translationKey = segment.toLowerCase();
				const translatedNav = tNavigation(translationKey);

				if (translatedNav !== translationKey) {
					// Found a navigation translation
					label = translatedNav;
				} else {
					// Check if this is a provider or category slug
					// eslint-disable-next-line @typescript-eslint/no-require-imports
					const { slugToProviderName, slugToCategory } = require('@/lib/utils/provider-slug-mapping');

					// Try provider name lookup
					const providerName = slugToProviderName(segment);
					if (providerName) {
						label = providerName;
					} else {
						// Try category lookup
						const category = slugToCategory(segment);
						if (category && category !== segment.toUpperCase()) {
							// Use friendly category names
							const categoryMap: Record<string, string> = {
								'SLOT': 'Slots',
								'LIVE CASINO': 'Live Casino',
								'SPORT BOOK': 'Sports',
								'SPORTSBOOK': 'Sports',
								'RNG': 'Table Games',
							};
							label = categoryMap[category] || category;
						} else {
							// Fallback to capitalized segment
							label = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
						}
					}
				}

				breadcrumbItems.push({
					label,
					href: currentPath,
					isActive: isLast,
				});
			});
		}

		return breadcrumbItems;
	}, [pathname, tNavigation]);

	// Dynamic header configuration based on category
	const getHeaderConfig = useMemo(() => {
		if (!query) {
			if (!currentCategoryFilter) {
				return {
					title: tGames("pageTitle"),
				};
			}
		}

		switch (currentCategoryFilter.toUpperCase()) {
			case "SLOT":
				return {
					title: tGames("categories.slot.title"),
				};
			case "LIVE CASINO":
				return {
					title: tGames("categories.liveCasino.title"),
				};
			case "SPORT BOOK":
			case "SPORTSBOOK":
				return {
					title: tGames("categories.sports.title"),
				};
			case "RNG":
				return {
					title: tGames("categories.rng.title"),
				};
			default:
				return {
					title: tGames("categories.other.title", {
						category: query
							? query.charAt(0).toUpperCase() +
							  query.slice(1).toLowerCase()
							: activeFilters["category"]?.[0] || "All",
					}),
				};
		}
	}, [currentCategoryFilter, tGames, query, activeFilters]);

	// --- NEW: Get the granular clear action ---
	// const clearFiltersByType = useAppStore(
	// 	(state) => state.query.clearFiltersByType
	// );

	// --- Manage Local UI State ---
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	// const viewMode = "grid" as const;
	const [isPaginationLoading, setIsPaginationLoading] = useState(false);

	// You might want a loading state from the game slice
	const isInitialLoading =
		useAppStore((state) => state.game.list.status) !== "success";
	const tQuery = useTranslations("query");

	// Infinite scroll functionality - need to declare before using
	const hasMoreItems = visibleGames.length < totalFilteredCount;

	// Create a wrapper function for showMoreItems to handle loading state
	const handleLoadMore = async () => {
		if (isPaginationLoading) return;

		setIsPaginationLoading(true);
		showMoreItems();

		// Add a small delay to simulate loading and ensure smooth UX
		setTimeout(() => {
			setIsPaginationLoading(false);
		}, 500);
	};

	const { sentinelRef } = useInfiniteScroll({
		onLoadMore: handleLoadMore,
		hasNextPage: hasMoreItems,
		isLoading: isPaginationLoading,
		threshold: 200, // Trigger when 200px from bottom
	});

	if (isInitialLoading) return <QueryPageSkeleton />;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
			{/* --- MAIN CONTENT AREA --- */}
			<main className="lg:col-span-4">
				<div className="space-y-4">
					{/* Header Section */}
					{/* <div className="flex sticky top-16 flex-col  items-start gap-4 p-4 mb-8 border rounded-lg bg-card"></div> */}

					{/* Top Control Bar */}
					<div className="flex flex-col w-full sticky top-16 z-30  lg:flex-row justify-between items-start gap-4 p-4 border rounded-lg bg-card">
						<div className="flex flex-col gap-2 w-full">
							<h1 className="text-2xl lg:text-3xl font-semibold tracking-tight ">
								{getHeaderConfig.title}
							</h1>
							<nav
								className="flex items-center space-x-1 text-sm text-muted-foreground"
								aria-label="Breadcrumb"
							>
								{getBreadcrumbItems.map((item, index) => (
									<div
										key={item.href}
										className="flex items-center"
									>
										{index > 0 && (
											<ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/60" />
										)}
										{item.isActive ? (
											<span className="text-primary font-semibold">
												{item.label}
											</span>
										) : (
											<Link
												href={item.href}
												className="hover:text-primary transition-colors duration-200 hover:underline"
											>
												{item.label}
											</Link>
										)}
									</div>
								))}
							</nav>
						</div>

						{/* <QuerySearchInput
							value={searchQuery}
							onSearch={handleSearch}
							placeholder={tQuery("searchPlaceholderGeneric")}
							className="w-full lg:w-auto md:flex-grow"
						/> */}
						<div className="flex-shrink-0 flex flex-col w-full lg:w-auto lg:flex-row items-start lg:items-center gap-4 lg:gap-2">
							{/* {providerSection && (
								<QueryFilterDropdownWithSearch
									options={providerSection.options}
									activeValues={
										activeFilters["provider_name"] || []
									}
									onToggle={(value) =>
										handleToggleFilter(
											"provider_name",
											value
										)
									}
									onClear={() =>
										clearFiltersByType("provider_name")
									}
									className="!w-full lg:!w-auto"
								/>
							)} */}

							<div className="flex w-full lg:w-auto gap-2">
								<QuerySortDropdown
									options={[
										{
											value: "a-z",
											label: tQuery("sort.a-z"),
										},
										{
											value: "z-a",
											label: tQuery("sort.z-a"),
										},
									]}
									value={sortBy}
									onValueChange={handleSort}
									className="w-full basis-2/3 lg:basis-auto lg:w-auto"
								/>
								<GridListToggle
									value={viewMode}
									onValueChange={setViewMode}
									className="w-full lg:w-auto basis-1/3 lg:basis-auto"
								/>
							</div>
						</div>
					</div>

					{/* NEW: Category Pills Section */}
					{/* {categorySection && (
						<FilterSelectionPills
							options={categorySection.options}
							activeValues={activeFilters["category"] || []}
							onToggle={(value) =>
								handleToggleFilter("category", value)
							}
							// onClear={() => clearFiltersByType("category")}
							onClear={() => handleClearFilters()}
						/>
					)} */}

					{/* Active Filters Display */}
					<ActiveFilterPills
						activeFilters={activeFilters}
						onRemoveFilter={handleToggleFilter}
						onClearAll={handleClearFilters}
					/>

					{/* Results Grid/List */}
					<QueryResultsGrid
						games={visibleGames}
						viewMode={viewMode}
						isLoading={isInitialLoading}
						itemsPerPage={20} // Assuming 20 items per page for skeleton
					/>

					{/* Infinite Scroll Sentinel with Loading Animation */}
					<div
						ref={sentinelRef}
						className="relative"
						aria-hidden="true"
					>
						<InfiniteScrollLoader isVisible={hasMoreItems} />
					</div>
				</div>
			</main>
		</div>
	);
};
