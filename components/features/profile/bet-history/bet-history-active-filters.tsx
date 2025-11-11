import { faFilter, faTimes } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "@/lib/locale-provider";
import { LocalFilters } from "./bet-history-section";
import { BetStatus } from "@/types/games/betHistory.types";

interface BetHistoryActiveFiltersDisplayProps {
	localFilters: LocalFilters;
	onClearAll: () => void;
}

export default function BetHistoryActiveFiltersDisplay({
	localFilters,
	onClearAll,
}: BetHistoryActiveFiltersDisplayProps) {
	const t = useTranslations("profile.betHistory");

	// Map internal status codes to translation keys
	const getStatusTranslationKey = (status: BetStatus | "ALL") => {
		switch (status) {
			case "OUTSTANDING":
				return "outstanding";
			case "WIN":
				return "win";
			case "LOSE":
				return "lose";
			case "DRAW":
				return "draw";
			case "VOID":
				return "void";
			case "B WIN":
				return "bonusWin";
			default:
				return "";
		}
	};

	// Map date range control values to translation keys
	const getDateRangeTranslation = (dateRange: string) => {
		const dateRangeMap: Record<string, string> = {
			today: "today",
			"last-7-days": "last7Days",
			"last-30-days": "last30Days",
			"last-90-days": "last90Days",
			"this-month": "thisMonth",
			"last-month": "lastMonth",
			custom: "customRange",
		};
		return dateRangeMap[dateRange] ? t(dateRangeMap[dateRange]) : dateRange;
	};

	return (
		<div className="mt-3 p-3 rounded-lg border border-border/50 bg-primary/5 backdrop-blur-sm">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				{/* Left section - Filter label and active filters */}
				<div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-primary min-w-0">
					<div className="flex items-center gap-2 flex-shrink-0">
						<FontAwesomeIcon icon={faFilter} className="h-3 w-3" />
						<span className="font-medium">
							{t("activeFilters")}
						</span>
					</div>

					{/* Active filter chips */}
					<div className="flex items-center gap-1 flex-wrap">
						{localFilters.betStatus !== "ALL" && (
							<span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
								{t("statusLabel")}:{" "}
								{t(
									getStatusTranslationKey(
										localFilters.betStatus
									)
								)}
							</span>
						)}
						{localFilters.providerName !== "ALL_PROVIDERS" && (
							<span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
								{t("providerLabel")}:{" "}
								{localFilters.providerName}
							</span>
						)}
						{(localFilters.dateRange !== "last-30-days" ||
							((localFilters.dateRange as string) === "custom" &&
								(localFilters.customDateFrom ||
									localFilters.customDateTo))) && (
							<span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
								{t("dateLabel")}:{" "}
								{localFilters.dateRange === "custom"
									? `${
											localFilters.customDateFrom || "?"
									  } → ${localFilters.customDateTo || "?"}`
									: getDateRangeTranslation(
											localFilters.dateRange
									  )}
							</span>
						)}
					</div>
				</div>

				{/* Right section - Clear all button */}
				<div className="flex items-center sm:justify-end">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onClearAll();
						}}
						className="cursor-pointer h-7 px-3 flex items-center justify-center rounded-md border border-border/50 bg-background/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors text-xs font-medium whitespace-nowrap"
					>
						<FontAwesomeIcon
							icon={faTimes}
							className="h-3 w-3 mr-1"
						/>
						{t("clearAll")}
					</button>
				</div>
			</div>
		</div>
	);
}
