"use client";

import { useCallback } from "react";
import { useTranslations } from "@/lib/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFilter,
	faCalendarAlt,
	faTimes,
} from "@fortawesome/pro-light-svg-icons";
import { BetStatus } from "@/types/games/betHistory.types";
import type { BetHistoryFilters as BetHistoryFiltersType } from "@/store/slices/history/betHistory.slice";
import { LocalFilters } from "./bet-history-section";

interface BetHistoryFiltersProps {
	localFilters: LocalFilters;
	setLocalFilters: (
		filters: LocalFilters | ((prev: LocalFilters) => LocalFilters)
	) => void;
	uniqueProviders: string[];
	onClose: () => void;
	onApply: (filters: BetHistoryFiltersType) => void;
	onClear: () => void;
}

export function BetHistoryFilters({
	localFilters,
	setLocalFilters,
	uniqueProviders,
	onClose,
	onApply,
	onClear,
}: BetHistoryFiltersProps) {
	const t = useTranslations("profile.betHistory");

	// Validate date inputs to prevent future dates
	const handleDateChangeFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedDate = e.target.value;
		const today = new Date().toISOString().split("T")[0];
		if (selectedDate > today) {
			setLocalFilters((prev) => ({
				...prev,
				customDateFrom: today,
			}));
			return;
		}
		setLocalFilters((prev) => ({
			...prev,
			customDateFrom: selectedDate,
		}));
	};

	const handleDateChangeTo = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedDate = e.target.value;
		const today = new Date().toISOString().split("T")[0];
		if (selectedDate > today) {
			setLocalFilters((prev) => ({
				...prev,
				customDateTo: today,
			}));
			return;
		}
		setLocalFilters((prev) => ({
			...prev,
			customDateTo: selectedDate,
		}));
	};

	// Calculate date range for display
	const getDateRange = useCallback(
		(range: string, customFrom?: string, customTo?: string) => {
			const now = new Date();
			const today = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()
			);

			switch (range) {
				case "today":
					return {
						from: today.toISOString().split("T")[0],
						to: today.toISOString().split("T")[0],
					};
				case "last-7-days":
					const last7Days = new Date(today);
					last7Days.setDate(today.getDate() - 7);
					return {
						from: last7Days.toISOString().split("T")[0],
						to: today.toISOString().split("T")[0],
					};
				case "last-30-days":
					const last30Days = new Date(today);
					last30Days.setDate(today.getDate() - 30);
					return {
						from: last30Days.toISOString().split("T")[0],
						to: today.toISOString().split("T")[0],
					};
				case "last-90-days":
					const last90Days = new Date(today);
					last90Days.setDate(today.getDate() - 90);
					return {
						from: last90Days.toISOString().split("T")[0],
						to: today.toISOString().split("T")[0],
					};
				case "this-month":
					const thisMonthStart = new Date(
						today.getFullYear(),
						today.getMonth(),
						1
					);
					return {
						from: thisMonthStart.toISOString().split("T")[0],
						to: today.toISOString().split("T")[0],
					};
				case "last-month":
					const lastMonthStart = new Date(
						today.getFullYear(),
						today.getMonth() - 1,
						1
					);
					const lastMonthEnd = new Date(
						today.getFullYear(),
						today.getMonth(),
						0
					);
					return {
						from: lastMonthStart.toISOString().split("T")[0],
						to: lastMonthEnd.toISOString().split("T")[0],
					};
				case "custom":
					return {
						from: customFrom || today.toISOString().split("T")[0],
						to: customTo || today.toISOString().split("T")[0],
					};
				default:
					// Default to last 30 days instead of a fixed date
					const defaultLast30Days = new Date(today);
					defaultLast30Days.setDate(today.getDate() - 30);
					return {
						from: defaultLast30Days.toISOString().split("T")[0],
						to: today.toISOString().split("T")[0],
					};
			}
		},
		[]
	);

	const handleApplyFilters = useCallback(() => {
		const dateRange = getDateRange(
			localFilters.dateRange,
			localFilters.customDateFrom,
			localFilters.customDateTo
		);

		// Update store filters - convert "ALL_PROVIDERS" to empty string for store
		onApply({
			fromDate: dateRange.from,
			toDate: dateRange.to,
			vendorName:
				localFilters.providerName === "ALL_PROVIDERS"
					? ""
					: localFilters.providerName,
			status: localFilters.betStatus,
		});
	}, [localFilters, getDateRange, onApply]);

	return (
		<div className="mt-4 rounded-xl border border-border/50 bg-background/40 backdrop-blur-sm overflow-hidden">
			{/* Filter header */}
			<div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
				<div className="flex items-center gap-2">
					<FontAwesomeIcon
						icon={faFilter}
						className="h-4 w-4 text-primary"
					/>
					<h3 className="text-sm font-semibold text-foreground">
						{t("advancedFilters")}
					</h3>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="cursor-pointer h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
				>
					<FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
				</button>
			</div>

			{/* Filter content */}
			<div className="p-4 space-y-4">
				{/* Date Range and Status row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Date Range */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
							<FontAwesomeIcon
								icon={faCalendarAlt}
								className="h-3 w-3"
							/>
							{t("dateRange")}
						</label>
						<Select
							value={localFilters.dateRange}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({
									...prev,
									dateRange: value,
								}))
							}
						>
							<SelectTrigger className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20">
								<SelectValue
									placeholder={t("selectDateRange")}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="today">
									{t("today")}
								</SelectItem>
								<SelectItem value="last-7-days">
									{t("last7Days")}
								</SelectItem>
								<SelectItem value="last-30-days">
									{t("last30Days")}
								</SelectItem>
								<SelectItem value="last-90-days">
									{t("last90Days")}
								</SelectItem>
								<SelectItem value="this-month">
									{t("thisMonth")}
								</SelectItem>
								<SelectItem value="last-month">
									{t("lastMonth")}
								</SelectItem>
								<SelectItem value="custom">
									{t("customRange")}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Provider */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-foreground/80">
							{t("provider")}
						</label>
						<Select
							value={localFilters.providerName}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({
									...prev,
									providerName: value,
								}))
							}
						>
							<SelectTrigger className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20">
								<SelectValue placeholder={t("allProviders")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL_PROVIDERS">
									{t("allProviders")}
								</SelectItem>
								{uniqueProviders.map((provider: string) => (
									<SelectItem key={provider} value={provider}>
										{provider}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Bet Status */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-foreground/80">
							{t("status")}
						</label>
						<Select
							value={localFilters.betStatus}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({
									...prev,
									betStatus: value as BetStatus | "ALL",
								}))
							}
						>
							<SelectTrigger className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20">
								<SelectValue placeholder={t("allStatuses")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">
									{t("allStatuses")}
								</SelectItem>
								<SelectItem value="OUTSTANDING">
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-warning" />
										{t("outstanding")}
									</div>
								</SelectItem>
								<SelectItem value="WIN">
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-success" />
										{t("win")}
									</div>
								</SelectItem>
								<SelectItem value="LOSE">
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-destructive" />
										{t("lose")}
									</div>
								</SelectItem>
								<SelectItem value="DRAW">
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-muted-foreground" />
										{t("draw")}
									</div>
								</SelectItem>
								<SelectItem value="VOID">
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-muted-foreground" />
										{t("void")}
									</div>
								</SelectItem>
								<SelectItem value="B WIN">
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-success" />
										{t("bonusWin")}
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Custom Date Range */}
				{localFilters.dateRange === "custom" && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-border/50 bg-muted/20">
						<div className="space-y-2">
							<label className="text-xs font-medium text-foreground/80">
								{t("fromDate")}
							</label>
							<Input
								type="date"
								value={localFilters.customDateFrom}
								onChange={handleDateChangeFrom}
								max={new Date().toISOString().split("T")[0]}
								className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-xs font-medium text-foreground/80">
								{t("toDate")}
							</label>
							<Input
								type="date"
								value={localFilters.customDateTo}
								onChange={handleDateChangeTo}
								max={new Date().toISOString().split("T")[0]}
								className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
							/>
						</div>
					</div>
				)}

				{/* Filter Actions */}
				<div className="flex items-center justify-between pt-2 border-t border-border/50">
					<button
						type="button"
						onClick={onClear}
						className="cursor-pointer h-8 px-3 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors text-sm font-medium"
					>
						{t("clearAll")}
					</button>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onClose}
							className="cursor-pointer h-8 px-3 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
						>
							{t("cancel")}
						</button>
						<button
							type="button"
							onClick={handleApplyFilters}
							className="cursor-pointer h-8 px-3 flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary text-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all text-sm font-medium"
						>
							{t("applyFilters")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
