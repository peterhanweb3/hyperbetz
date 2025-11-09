"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/store";
import {
	selectAllProviders,
	selectProvidersByCategory,
} from "@/store/selectors/query/query.selectors";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Import the UI components
// import { QuerySearchInput } from "./query-search-input";
import { QuerySortDropdown } from "./query-sort-dropdown";
import { GridListToggle, ViewMode } from "./grid-list-toggle";
import { ProviderGridCard } from "./provider-grid-card";
import { ProviderListCard } from "./provider-list-card";
// import { ActiveFilterPills } from "./active-filter-pills";
import { useTranslations } from "@/lib/locale-provider";
// import { ActiveFilters } from "@/store/slices/query/query.slice";

interface ProviderPageLayoutProps {
	categoryFromPath?: string;
}

export const ProviderPageLayout = ({ categoryFromPath }: ProviderPageLayoutProps = {}) => {
	// --- 1. HOOKS & STATE SETUP ---
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get category from URL params (support both path params and query params)
	// Path params take precedence for SEO-friendly URLs
	const categoryFilter = categoryFromPath
		? decodeURIComponent(categoryFromPath).replace(/-/g, ' ').toUpperCase()
		: (searchParams.get("category") ?? "");

	// Get raw data using our efficient selectors based on category filter
	const allProviders = useAppStore(selectAllProviders);
	const filteredProvidersByCategory = useAppStore(
		selectProvidersByCategory(categoryFilter)
	);

	// Use category-filtered providers if category is specified, otherwise use all providers
	const providersToUse = categoryFilter
		? filteredProvidersByCategory
		: allProviders;

	// console.log("All providers coming in provider-page-layout.tsx", providersToUse);

	// This component now manages its own state, initialized from the URL
	// const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [sortBy, setSortBy] = useState(searchParams.get("sort") || "a-z");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	// Create active filters based on URL parameters
	// const activeFilters: ActiveFilters = useMemo(() => {
	// 	const filters: ActiveFilters = {};
	// 	if (categoryFilter) {
	// 		filters.category = [categoryFilter];
	// 	}
	// 	return filters;
	// }, [categoryFilter]);

	// --- 2. URL SYNCHRONIZATION LOGIC ---
	useEffect(() => {
		const params = new URLSearchParams();
		if (categoryFilter) params.set("category", categoryFilter);
		// if (searchQuery) params.set("q", searchQuery);
		if (sortBy && sortBy !== "a-z") params.set("sort", sortBy);

		// Use replace to avoid polluting browser history
		router.replace(`${pathname}?${params.toString()}`);
	}, [
		// searchQuery,
		sortBy,
		categoryFilter,
		pathname,
		router,
	]);

	// --- 3. DATA PROCESSING ENGINE (LOCAL) ---
	const displayedProviders = useMemo(() => {
		const filtered = providersToUse.filter(
			(provider) => provider.name.toLowerCase()
			// .includes(searchQuery.toLowerCase())
		);
		return [...filtered].sort((a, b) =>
			sortBy === "a-z"
				? a.name.localeCompare(b.name)
				: b.name.localeCompare(a.name)
		);
	}, [
		providersToUse,
		//  searchQuery,
		sortBy,
	]);

	// --- 4. UI ASSEMBLY ---
	const tProviders = useTranslations("providers");
	const tQuerySort = useTranslations("query.sort");

	// Dynamic header configuration based on category
	const getHeaderConfig = useMemo(() => {
		if (!categoryFilter) {
			return {
				title: tProviders("pageTitle"),
			};
		}

		switch (categoryFilter.toUpperCase()) {
			case "SLOT":
				return {
					title: tProviders("categories.slot.title"),
				};
			case "LIVE CASINO":
				return {
					title: tProviders("categories.liveCasino.title"),
				};
			case "SPORT BOOK":
			case "SPORTSBOOK":
				return {
					title: tProviders("categories.sports.title"),
				};
			case "RNG":
				return {
					title: tProviders("categories.rng.title"),
				};
			default:
				return {
					title: tProviders("categories.other.title").replace(
						"{category}",
						categoryFilter
					),
				};
		}
	}, [categoryFilter, tProviders]);

	// Function to clear category filter
	// const clearCategoryFilter = () => {
	// 	const params = new URLSearchParams();
	// 	// if (searchQuery) params.set("q", searchQuery);
	// 	if (sortBy && sortBy !== "a-z") params.set("sort", sortBy);
	// 	router.push(`${pathname}?${params.toString()}`);
	// };

	// Handle removing individual filters
	// const handleRemoveFilter = (filterType: string, value: string) => {
	// 	if (filterType === "category") {
	// 		clearCategoryFilter();
	// 	}
	// };

	// Handle clearing all filters
	// const handleClearAllFilters = () => {
	// 	clearCategoryFilter();
	// };

	return (
		<div className="space-y-6">
			<div className="flex sticky top-16 flex-col  items-start gap-4 p-4 mb-8 border w-full rounded-lg bg-card">
				<div className="md:flex block items-center justify-between gap-2 w-full">
					<h1 className="text-2xl lg:text-3xl text-center md:text-start mb-4 md:mb-0 tracking-tight ">
						{getHeaderConfig.title}
					</h1>

					{/* Commented out search, sort, and view toggle functionality */}
					<div className="flex sticky top-16 flex-col md:flex-row justify-between items-center gap-4 ">
						{/* <QuerySearchInput
							value={searchQuery}
							onSearch={setSearchQuery}
							placeholder={tProviders("searchPlaceholder")}
							className="w-full md:w-auto md:flex-grow"
						/> */}
						<div className="flex-shrink-0 flex items-center gap-8">
							<QuerySortDropdown
								options={[
									{ value: "a-z", label: tQuerySort("a-z") },
									{ value: "z-a", label: tQuerySort("z-a") },
								]}
								value={sortBy}
								onValueChange={setSortBy}
							/>
							<GridListToggle
								value={viewMode}
								onValueChange={setViewMode}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Active Filter Pills Component */}
			{/* <ActiveFilterPills
				activeFilters={activeFilters}
				onRemoveFilter={handleRemoveFilter}
				onClearAll={handleClearAllFilters}
			/> */}

			{displayedProviders.length > 0 ? (
				<div
					className={`gap-2 ${
						viewMode === "grid"
							? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
							: "flex flex-col "
					}`}
				>
					{displayedProviders.map((provider) =>
						viewMode === "grid" ? (
							<ProviderGridCard
								key={`${provider.name}-grid`}
								name={provider.name}
								gameCount={provider.count || 0}
								iconUrl={provider.icon_url}
							/>
						) : (
							<ProviderListCard
								key={`${provider.name}-list`}
								name={provider.name}
								gameCount={provider.count || 0}
								iconUrl={provider.icon_url}
							/>
						)
					)}
				</div>
			) : (
				<p className="text-center text-muted-foreground py-10">
					{tProviders("empty")}
				</p>
			)}
		</div>
	);
};
