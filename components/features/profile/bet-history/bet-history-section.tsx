"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/locale-provider";
import { useBetHistory } from "@/hooks/useBetHistory";
import { useRefreshLimiter } from "@/hooks/use-refresh-limiter";
import { BetStatus } from "@/types/games/betHistory.types";
import type { BetHistoryFilters as BetHistoryFiltersType } from "@/store/slices/history/betHistory.slice";

import { BetHistoryPagination } from "./bet-history-pagination";
import { BetHistoryContent } from "./bet-history-content";
import { BetHistoryFilters } from "./bet-history-filters";
import { BetHistoryHeader } from "./bet-history-header";
import { BetHistoryStats } from "./bet-history-stats";
import BetHistoryActiveFiltersDisplay from "./bet-history-active-filters";

export interface LocalFilters {
	dateRange: string;
	betStatus: BetStatus | "ALL";
	providerName: string;
	customDateFrom: string;
	customDateTo: string;
}

export default function BetHistorySection() {
	const t = useTranslations("profile.betHistory");

	// Initialize refresh limiter with 10 second cooldown
	const {
		isRefreshing,
		canRefresh,
		handleRefresh: handleRefreshWithLimit,
	} = useRefreshLimiter(10);

	const {
		filteredBets,
		filters,
		uniqueProviders,
		setFilters,
		fetchHistory,
		clearBetHistoryCache,
		isLoading,
		hasError,
		page,
		pageSize,
		setPage,
		totalPages,
		totalCount,
		grandTotalBet,
		grandTotalWinLose,
	} = useBetHistory();

	// Local UI state for filter panel
	const [showFilters, setShowFilters] = useState(false);
	const [showSensitiveData, setShowSensitiveData] = useState(true);
	const [localFilters, setLocalFilters] = useState<LocalFilters>({
		dateRange: "last-30-days",
		betStatus: "ALL",
		providerName: "ALL_PROVIDERS",
		customDateFrom: "",
		customDateTo: "",
	});

	// Server-side pagination
	const paginatedBets = filteredBets; // API returns current page
	const totalPagesCount = totalPages();

	useEffect(() => {
		fetchHistory();
	}, [fetchHistory]);

	const handleApplyFilters = (newFilters: BetHistoryFiltersType) => {
		setFilters(newFilters);
		setPage(1);
		setShowFilters(false);
	};

	const handleClearFilters = () => {
		const defaults: LocalFilters = {
			dateRange: "last-30-days",
			betStatus: "ALL",
			providerName: "ALL_PROVIDERS",
			customDateFrom: "",
			customDateTo: "",
		};
		setLocalFilters(defaults);
		setFilters({
			fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			toDate: new Date().toISOString().split("T")[0],
			vendorName: "",
			status: "ALL",
		});
		setPage(1);
	};

	const handleRefresh = async () => {
		await handleRefreshWithLimit(async () => {
			clearBetHistoryCache();
			await fetchHistory(true);
		});
	};

	const handlePageChange = (newPage: number) => setPage(newPage);
	// (Optional) page size change handler can be added to UI later

	const hasActiveFilters =
		localFilters.betStatus !== "ALL" ||
		localFilters.providerName !== "ALL_PROVIDERS" ||
		localFilters.dateRange !== "last-30-days" ||
		((localFilters.dateRange as string) === "custom" &&
			(localFilters.customDateFrom || localFilters.customDateTo));

	return (
		<div className="relative">
			<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-background/90 via-muted/50 to-background/90 backdrop-blur-2xl" />
			<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

			<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/20 backdrop-blur-3xl shadow-lg">
				<BetHistoryHeader
					showFilters={showFilters}
					setShowFilters={setShowFilters}
					filters={filters}
					isLoading={isLoading}
					onRefresh={handleRefresh}
					canRefresh={canRefresh}
					isRefreshing={isRefreshing}
				/>
				<div className="p-2">
					{showFilters && (
						<BetHistoryFilters
							localFilters={localFilters}
							setLocalFilters={setLocalFilters}
							uniqueProviders={uniqueProviders}
							onClose={() => setShowFilters(false)}
							onApply={handleApplyFilters}
							onClear={handleClearFilters}
						/>
					)}

					{/* Active Filters Summary */}
					{hasActiveFilters && (
						<BetHistoryActiveFiltersDisplay
							localFilters={localFilters}
							onClearAll={handleClearFilters}
						/>
					)}

					<div className="py-4">
						<BetHistoryStats
							grandTotalBet={grandTotalBet}
							grandTotalWinLose={grandTotalWinLose}
							isLoading={isLoading}
						/>
					</div>

					<BetHistoryContent
						records={paginatedBets}
						isLoading={isLoading}
						error={hasError ? t("errorLoadingBets") : null}
						onRefresh={handleRefresh}
						showSensitiveData={showSensitiveData}
						toggleSensitiveData={() =>
							setShowSensitiveData(!showSensitiveData)
						}
					/>

					{totalPagesCount > 1 && (
						<BetHistoryPagination
							currentPage={page}
							totalPages={totalPagesCount}
							totalRecords={totalCount}
							onPageChange={handlePageChange}
							isLoading={isLoading}
							pageSize={pageSize}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
