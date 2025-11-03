"use client";

import { useTranslations } from "@/lib/locale-provider";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrophy,
	faRotateRight,
	faFilter,
} from "@fortawesome/pro-light-svg-icons";
import { BetHistoryFilters } from "@/store/slices/history/betHistory.slice";

interface BetHistoryHeaderProps {
	showFilters: boolean;
	setShowFilters: (show: boolean) => void;
	filters: BetHistoryFilters;
	isLoading: boolean;
	onRefresh: () => void;
	canRefresh?: boolean;
	isRefreshing?: boolean;
}

export function BetHistoryHeader({
	showFilters,
	setShowFilters,
	filters,
	isLoading,
	onRefresh,
	canRefresh = true,
	isRefreshing = false,
}: BetHistoryHeaderProps) {
	const t = useTranslations("profile.betHistory");

	// Check if filters are active
	const hasActiveFilters = () => {
		const defaultFromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0];
		const defaultToDate = new Date().toISOString().split("T")[0];

		return (
			(filters.status && filters.status !== "ALL") ||
			(filters.vendorName && filters.vendorName !== "") ||
			filters.fromDate !== defaultFromDate ||
			filters.toDate !== defaultToDate
		);
	};

	return (
		<div className="relative border-b border-border/50 bg-gradient-to-r from-muted/30 to-background/30 p-5">
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />

			<div className="relative space-y-4">
				{/* Title section */}
				<div className="flex flex-col lg:flex-row items-start gap-4 lg:items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
							<FontAwesomeIcon
								icon={faTrophy}
								className="h-5 w-5 text-foreground"
							/>
						</div>
						<div>
							<h2 className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
								{t("title")}
							</h2>
							<p className="text-[10px] lg:text-xs text-muted-foreground">
								{t("trackBetsResults")}
							</p>
						</div>
					</div>

					{/* Action buttons */}
					<div className="flex items-center space-x-2">
						<button
							type="button"
							onClick={() => setShowFilters(!showFilters)}
							className={`cursor-pointer rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5 ${
								showFilters
									? "border-primary/50 bg-primary/10 text-primary"
									: "text-muted-foreground hover:border-border"
							}`}
						>
							<FontAwesomeIcon
								icon={faFilter}
								className="h-3 w-3"
							/>
							{t("filters")}
							{hasActiveFilters() && (
								<div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
							)}
						</button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onRefresh}
							disabled={isLoading || !canRefresh || isRefreshing}
							className="rounded-lg border-border/50 bg-background/50 text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-primary/10"
						>
							<FontAwesomeIcon
								icon={faRotateRight}
								className={`mr-1.5 h-3 w-3 transition-transform duration-500 ${
									isLoading || isRefreshing
										? "animate-spin"
										: ""
								}`}
							/>
							{t("refresh")}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
