import { useState, useEffect, useMemo, useCallback, ChangeEvent } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { useTranslations, useLocaleContext } from "@/lib/locale-provider";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useRefreshLimiter } from "@/hooks/use-refresh-limiter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
	ArrowUpRight,
	ExternalLink,
	RefreshCw,
	TrendingUp,
	TrendingDown,
	Clock,
	CheckCircle2,
	XCircle,
	ChevronLeft,
	ChevronRight,
	Filter,
	Calendar,
	Search,
	X,
} from "lucide-react";
import { TransactionRecord } from "@/types/transactions/transaction.types";

interface TransactionItemProps {
	transaction: TransactionRecord;
}

function TransactionItem({ transaction }: TransactionItemProps) {
	const { locale } = useLocaleContext();
	const tProfile = useTranslations("profile");
	const isDeposit = transaction.type === "DEPO";
	const isSuccess = transaction.status.toLowerCase() === "success";
	const isPending = transaction.status.toLowerCase() === "pending";

	const StatusIcon = isSuccess ? CheckCircle2 : isPending ? Clock : XCircle;

	return (
		<div className="group relative">
			{/* Theme-based glassmorphism card */}
			<div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background/80 via-muted/20 to-background/80 backdrop-blur-xl transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5">
				{/* Animated background glow */}
				<div
					className={`absolute inset-0 opacity-0 transition-all duration-300 group-hover:opacity-100 ${
						isDeposit
							? "bg-gradient-to-r from-success/5 via-success/[0.02] to-success/5"
							: "bg-gradient-to-r from-primary/5 via-primary/[0.02] to-primary/5"
					}`}
				/>

				{/* Status indicator */}
				<div
					className={`absolute left-0 top-0 h-full w-[2px] transition-all duration-300 ${
						isSuccess
							? "bg-gradient-to-b from-success to-success/80"
							: isPending
							? "bg-gradient-to-b from-warning to-warning/80"
							: "bg-gradient-to-b from-destructive to-destructive/80"
					}`}
				/>

				<div className="relative p-3 sm:p-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						{/* Left section */}
						<div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
							{/* Transaction type icon */}
							<div className="relative flex-shrink-0">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 ${
										isDeposit
											? "bg-gradient-to-br from-primary/20 to-success/30 shadow-md shadow-success/10"
											: "bg-gradient-to-br from-primary/20 to-primary/30 shadow-md shadow-primary/10"
									}`}
								>
									{isDeposit ? (
										<TrendingUp className="h-4 w-4 text-success" />
									) : (
										<TrendingDown className="h-4 w-4 text-primary" />
									)}
								</div>

								{/* Status indicator */}
								<div
									className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${
										isSuccess
											? "bg-success"
											: isPending
											? "bg-warning"
											: "bg-destructive"
									}`}
								>
									<StatusIcon className="h-2 w-2 text-foreground" />
								</div>
							</div>

							{/* Transaction details */}
							<div className="space-y-1 flex-1 min-w-0">
								<div className="flex items-center space-x-2 flex-wrap">
									<h3 className="text-sm font-semibold text-foreground">
										{isDeposit
											? tProfile("deposit")
											: tProfile("withdrawal")}
									</h3>
									<Badge
										variant="outline"
										className={`border-0 px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
											isSuccess
												? "bg-success/20 text-success"
												: isPending
												? "bg-warning/20 text-warning"
												: "bg-destructive/20 text-destructive"
										}`}
									>
										{transaction.status}
									</Badge>
								</div>

								<div className="space-y-0.5 text-xs text-muted-foreground">
									<p className="flex items-center space-x-1">
										<Clock className="h-2.5 w-2.5 flex-shrink-0" />
										<span>
											{new Date(
												transaction.submit_date
											).toLocaleDateString(locale, {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</p>

									<div className="flex items-center space-x-3 text-xs flex-wrap">
										<span className="flex items-center space-x-1">
											<div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
											<span>{transaction.network}</span>
										</span>
										<span className="text-muted-foreground/60">
											•
										</span>
										<span>{transaction.method}</span>
									</div>

									<p className="font-mono text-xs text-muted-foreground/80 truncate max-w-full sm:max-w-[120px]">
										{transaction.transaction_code}
									</p>
								</div>
							</div>
						</div>

						{/* Right section - Amount */}
						<div className="flex items-center justify-between sm:justify-end space-x-2 sm:flex-shrink-0">
							<div className="flex items-center gap-2 md:block text-left sm:text-right">
								<p
									className={`text-lg font-semibold tabular-nums ${
										isDeposit
											? "text-success"
											: "text-primary"
									}`}
								>
									{isDeposit ? "+" : "-"}
									{parseFloat(transaction.amount).toFixed(4)}
								</p>
								<p className="text-xs font-medium text-foreground/80">
									{transaction.currency}
								</p>
								<p className="text-xs text-muted-foreground">
									≈ $
									{parseFloat(
										transaction.real_amount
									).toFixed(2)}
								</p>
							</div>

							{/* External link button */}
							{transaction.hash && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-8 w-8 flex-shrink-0 rounded-lg border border-border/50 bg-background/50 p-0 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-primary/10 hover:scale-105"
									onClick={() => {
										// Use hash_url if available, otherwise construct URL for Polygon
										const explorerUrl =
											transaction.hash_url ||
											`https://polygonscan.com/tx/${transaction.hash}`;
										window.open(explorerUrl, "_blank");
									}}
								>
									<ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function TransactionHistorySection() {
	const t = useTranslations("profile.transactions");
	const [activeTab, setActiveTab] = useState("all");
	const [dateRange, setDateRange] = useState("last-30-days");
	const [transactionStatus, setTransactionStatus] = useState("all");
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [customDateFrom, setCustomDateFrom] = useState("");
	const [customDateTo, setCustomDateTo] = useState("");

	// Initialize refresh limiter with 10 second cooldown
	const { isRefreshing, canRefresh, handleRefresh } = useRefreshLimiter(10);

	// Get auth token from auth context
	const { authToken, user } = useDynamicAuth();

	// Use the standalone transaction store
	const allTransactions = useTransactionStore((state) => state.transactions);
	const status = useTransactionStore((state) => state.status);
	const error = useTransactionStore((state) => state.error);
	const totalData = useTransactionStore((state) => state.totalData);
	const currentPage = useTransactionStore((state) => state.currentPage);
	const pageSize = useTransactionStore((state) => state.pageSize);
	const totalPages = useTransactionStore((state) => state.totalPages);
	const fetchTransactionHistory = useTransactionStore(
		(state) => state.fetchTransactionHistory
	);
	const setPage = useTransactionStore((state) => state.setPage);
	const setPageSize = useTransactionStore((state) => state.setPageSize);

	// Convert status to boolean for component usage
	const isLoading = status === "loading";

	// Custom filter close handler
	const closeFilters = useCallback(() => {
		console.log("Closing filters");
		setShowFilters(false);
	}, []);

	// Calculate date range based on selection (memoized to prevent infinite re-renders)
	const currentDateRange = useMemo(() => {
		// Helper function to format date as YYYY-MM-DD in local timezone
		const formatDateToLocal = (date: Date): string => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		};

		const getDateRange = (range: string) => {
			const now = new Date();
			const today = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()
			);

			switch (range) {
				case "today":
					return {
						from: formatDateToLocal(today),
						to: formatDateToLocal(today),
					};
				case "last-7-days":
					const last7Days = new Date(today);
					last7Days.setDate(today.getDate() - 7);
					return {
						from: formatDateToLocal(last7Days),
						to: formatDateToLocal(today),
					};
				case "last-30-days":
					const last30Days = new Date(today);
					last30Days.setDate(today.getDate() - 30);
					return {
						from: formatDateToLocal(last30Days),
						to: formatDateToLocal(today),
					};
				case "last-90-days":
					const last90Days = new Date(today);
					last90Days.setDate(today.getDate() - 90);
					return {
						from: formatDateToLocal(last90Days),
						to: formatDateToLocal(today),
					};
				case "this-month":
					const thisMonthStart = new Date(
						today.getFullYear(),
						today.getMonth(),
						1
					);
					return {
						from: formatDateToLocal(thisMonthStart),
						to: formatDateToLocal(today),
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
						from: formatDateToLocal(lastMonthStart),
						to: formatDateToLocal(lastMonthEnd),
					};
				case "custom":
					return {
						from: customDateFrom || formatDateToLocal(today),
						to: customDateTo || formatDateToLocal(today),
					};
				default:
					return {
						from: "2025-01-01",
						to: formatDateToLocal(today),
					};
			}
		};

		const calculatedRange = getDateRange(dateRange);

		return calculatedRange;
	}, [dateRange, customDateFrom, customDateTo]);

	// Filter handlers (memoized to prevent re-renders)
	const handleClearFilters = useCallback(() => {
		setDateRange("last-30-days");
		setTransactionStatus("all");
		setSearchQuery("");
		setCustomDateFrom("");
		setCustomDateTo("");
		setPage(1); // Reset to first page when clearing filters
	}, [setPage]);

	const handleDateChangeFrom = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedDate = e.target.value;
		const today = new Date().toISOString().split("T")[0];
		if (selectedDate > today) {
			setCustomDateFrom(today);
			return;
		}
		setCustomDateFrom(selectedDate);
	};
	const handleDateChangeTo = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedDate = e.target.value;
		const today = new Date().toISOString().split("T")[0];
		if (selectedDate > today) {
			setCustomDateTo(today);
			return;
		}
		setCustomDateTo(selectedDate);
	};

	const handleApplyFilters = useCallback(() => {
		// Filters are applied automatically through client-side filtering
		closeFilters();
	}, [closeFilters]);

	const getTransactionType = useCallback((tab: string) => {
		switch (tab) {
			case "deposits":
				return "DEPO";
			case "withdrawals":
				return "WD";
			default:
				return "";
		}
	}, []);

	const transactionHistoryParams = useMemo(
		() => ({
			username: user?.username || "defaultuser",
			password:
				process.env.NEXT_PUBLIC_GAME_URL_API_PASSWORD ||
				"defaultpassword",
			from_date: `${currentDateRange.from} 00:00:00`,
			to_date: `${currentDateRange.to} 23:59:59`,
			transaction_type: getTransactionType(activeTab) as
				| "DEPO"
				| "WD"
				| "",
			transaction_status:
				transactionStatus !== "all"
					? (transactionStatus as "SUCCESS" | "REJECTED" | "PENDING")
					: ("" as "SUCCESS" | "REJECTED" | "PENDING" | ""),
			limit: pageSize,
			page_number: currentPage,
		}),
		[
			activeTab,
			currentDateRange.from,
			currentDateRange.to,
			getTransactionType,
			user?.username,
			transactionStatus,
			pageSize,
			currentPage,
		]
	);

	// Fetch transactions when parameters change
	useEffect(() => {
		// Only fetch if we have authToken
		if (authToken && user?.username) {
			const fetchData = async () => {
				await fetchTransactionHistory(
					transactionHistoryParams,
					authToken
				);
			};
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactionHistoryParams, authToken, user?.username]);

	// Refetch function with DDoS protection
	const refetch = useCallback(async () => {
		// Only refetch if we have authToken
		if (authToken) {
			await handleRefresh(async () => {
				await fetchTransactionHistory(
					transactionHistoryParams,
					authToken
				);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactionHistoryParams, authToken, handleRefresh]); // Intentionally excluding fetchTransactionHistory to prevent infinite loop

	// Server-side filtered transactions (no client-side filtering for search as it should be handled by API)
	const transactions = allTransactions || [];

	// Server-side pagination controls
	const hasNextPage = currentPage < totalPages;
	const hasPrevPage = currentPage > 1;

	const goToPage = useCallback(
		(page: number) => {
			if (page >= 1 && page <= totalPages) {
				setPage(page);
			}
		},
		[totalPages, setPage]
	);

	const nextPage = useCallback(() => {
		if (hasNextPage) {
			setPage(currentPage + 1);
		}
	}, [hasNextPage, currentPage, setPage]);

	const prevPage = useCallback(() => {
		if (hasPrevPage) {
			setPage(currentPage - 1);
		}
	}, [hasPrevPage, currentPage, setPage]);

	// Handle page size change
	// const handlePageSizeChange = useCallback((newSize: number) => {
	//   setPageSize(newSize);
	// }, [setPageSize]);

	// Reset pagination when filters change
	useEffect(() => {
		setPage(1);
	}, [transactionStatus, dateRange, activeTab, setPage]);

	// Pagination component
	const PaginationControls = () => (
		<div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-background/20">
			<div className="flex items-center order-2 lg:order-1 gap-2 text-sm text-muted-foreground">
				<span>{t("show")}</span>
				<Select
					value={pageSize.toString()}
					onValueChange={(value) => setPageSize(Number(value))}
				>
					<SelectTrigger className="h-8 w-16 bg-background/50 border-border/50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="5">5</SelectItem>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="20">20</SelectItem>
						<SelectItem value="50">50</SelectItem>
					</SelectContent>
				</Select>
				<span>{t("ofTransactions", { count: totalData })}</span>
			</div>

			<div className="flex items-center order-1 lg:order-2 gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={prevPage}
					disabled={!hasPrevPage || isLoading}
					className="h-8 w-8 p-0 bg-background/50 border-border/50 hover:bg-primary/10"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/* Pagination Numbers */}
				<div className="flex items-center gap-1">
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						const page = Math.max(1, currentPage - 2) + i;
						if (page > totalPages) return null;

						return (
							<Button
								key={page}
								type="button"
								variant={
									page === currentPage ? "default" : "outline"
								}
								size="sm"
								onClick={() => goToPage(page)}
								className={`h-8 w-8 p-0 ${
									page === currentPage
										? "bg-primary text-foreground"
										: "bg-background/50 border-border/50 hover:bg-primary/10"
								}`}
							>
								{page}
							</Button>
						);
					})}
				</div>

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={nextPage}
					disabled={!hasNextPage || isLoading}
					className="h-8 w-8 p-0 bg-background/50 border-border/50 hover:bg-primary/10"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);

	return (
		<div
			className="relative"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
					e.preventDefault();
					e.stopPropagation();
				}
			}}
		>
			{/* Background with theme-based gradient */}
			<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-background/90 via-muted/50 to-background/90 backdrop-blur-2xl" />
			<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

			{/* Content */}
			<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/20 backdrop-blur-3xl shadow-lg">
				{/* Compact header */}
				<div className="relative border-b border-border/50 bg-gradient-to-r from-muted/30 to-background/30 p-5">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />

					<div className="relative space-y-4">
						{/* Title section */}
						<div className="flex flex-col lg:flex-row items-start gap-4 lg:items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
									<ArrowUpRight className="h-5 w-5 text-foreground" />
								</div>
								<div>
									<h2 className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
										{t("title")}
									</h2>
									<p className="text-[10px] lg:text-xs text-muted-foreground">
										{t("trackDepositsWithdrawals")}
									</p>
								</div>
							</div>

							{/* Action buttons */}
							<div className="flex items-center space-x-2">
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										console.log("Filter button clicked");
										setShowFilters((prev) => !prev);
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									className={`cursor-pointer rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5 ${
										showFilters
											? "border-primary/50 bg-primary/10 text-primary"
											: "text-muted-foreground hover:border-border"
									}`}
								>
									<Filter className="h-3 w-3" />
									{t("filters")}
									{((transactionStatus &&
										transactionStatus !== "all") ||
										dateRange !== "last-30-days") && (
										<div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
									)}
								</button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={refetch}
									disabled={
										isLoading || !canRefresh || isRefreshing
									}
									className="rounded-lg border-border/50 bg-background/50 text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-primary/10"
								>
									<RefreshCw
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

						{/* Advanced filter panel */}
						{showFilters && (
							<div className="mt-4 rounded-xl border border-border/50 bg-background/40 backdrop-blur-sm overflow-hidden">
								{/* Filter header */}
								<div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
									<div className="flex items-center gap-2">
										<Filter className="h-4 w-4 text-primary" />
										<h3 className="text-sm font-semibold text-foreground">
											{t("advancedFilters")}
										</h3>
									</div>
									<div
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											closeFilters();
										}}
										className="cursor-pointer h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
									>
										<X className="h-4 w-4" />
									</div>
								</div>

								{/* Filter content */}
								<div className="p-4 space-y-4">
									{/* Search */}
									<div className="space-y-2">
										<label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
											<Search className="h-3 w-3" />
											{t("searchTransactionComingSoon")}
										</label>
										<Input
											placeholder={t(
												"searchPlaceholderDisabled"
											)}
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											disabled
											className="h-9 bg-background/30 border-border/30 text-muted-foreground cursor-not-allowed"
										/>
									</div>

									{/* Date Range and Status row */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Date Range */}
										<div className="space-y-2">
											<label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{t("dateRange")}
											</label>
											<Select
												value={dateRange}
												onValueChange={setDateRange}
											>
												<SelectTrigger className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20">
													<SelectValue
														placeholder={t(
															"selectDateRange"
														)}
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

										{/* Transaction Status */}
										<div className="space-y-2">
											<label className="text-xs font-medium text-foreground/80">
												{t("transactionStatus")}
											</label>
											<Select
												value={transactionStatus}
												onValueChange={
													setTransactionStatus
												}
											>
												<SelectTrigger className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20">
													<SelectValue
														placeholder={t(
															"allStatuses"
														)}
													/>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														{t("allStatuses")}
													</SelectItem>
													<SelectItem value="CONFIRMED">
														<div className="flex items-center gap-2">
															<div className="h-2 w-2 rounded-full bg-success" />
															{t("success")}
														</div>
													</SelectItem>
													<SelectItem value="PENDING">
														<div className="flex items-center gap-2">
															<div className="h-2 w-2 rounded-full bg-warning" />
															{t("pending")}
														</div>
													</SelectItem>
													<SelectItem value="REJECTED">
														<div className="flex items-center gap-2">
															<div className="h-2 w-2 rounded-full bg-destructive" />
															{t("rejected")}
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Custom Date Range */}
									{dateRange === "custom" && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-border/50 bg-muted/20">
											<div className="space-y-2">
												<label className="text-xs font-medium text-foreground/80">
													{t("fromDate")}
												</label>
												<Input
													type="date"
													value={customDateFrom}
													onChange={
														handleDateChangeFrom
													}
													// onChange={(e) =>
													// 	setCustomDateTo(
													// 		e.target.value
													// 	)
													// }
													max={
														new Date()
															.toISOString()
															.split("T")[0]
													}
													className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-foreground/80">
													{t("toDate")}
												</label>
												<Input
													type="date"
													value={customDateTo}
													onChange={
														handleDateChangeTo
													}
													// onChange={(e) =>
													// 	setCustomDateTo(
													// 		e.target.value
													// 	)
													// }
													max={
														new Date()
															.toISOString()
															.split("T")[0]
													}
													className="h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
												/>
											</div>
										</div>
									)}

									{/* Filter Actions */}
									<div className="flex items-center justify-between pt-2 border-t border-border/50">
										<div
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleClearFilters();
											}}
											className="cursor-pointer h-8 px-3 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors text-sm font-medium"
										>
											{t("clearAll")}
										</div>
										<div className="flex items-center gap-2">
											<div
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													closeFilters();
												}}
												className="cursor-pointer h-8 px-3 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
											>
												{t("cancel")}
											</div>
											<div
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleApplyFilters();
												}}
												className="cursor-pointer h-8 px-3 flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary text-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all text-sm font-medium"
											>
												{t("applyFilters")}
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Active filters summary */}
						{((transactionStatus && transactionStatus !== "all") ||
							dateRange !== "last-30-days") && (
							<div className="mt-3 p-3 rounded-lg border border-border/50 bg-primary/5 backdrop-blur-sm">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									{/* Left section - Filter label and active filters */}
									<div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-primary min-w-0">
										<div className="flex items-center gap-2 flex-shrink-0">
											<Filter className="h-3 w-3" />
											<span className="font-medium">
												{t("activeFilters")}
											</span>
										</div>

										{/* Active filter chips */}
										<div className="flex items-center gap-1 flex-wrap">
											{transactionStatus &&
												transactionStatus !== "all" && (
													<span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
														{t("statusLabel")}:{" "}
														{transactionStatus.toLocaleUpperCase() ==
														"SUCCESS"
															? t("success")
															: transactionStatus ===
															  "PENDING"
															? t("pending")
															: t("rejected")}
													</span>
												)}
											{dateRange !== "last-30-days" && (
												<span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
													{t("dateLabel")}:{" "}
													{dateRange
														.replace("-", " ")
														.replace(/\b\w/g, (l) =>
															l.toUpperCase()
														)}
												</span>
											)}
										</div>
									</div>

									{/* Right section - Clear button */}
									<div className="flex items-center sm:justify-end">
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleClearFilters();
											}}
											className="cursor-pointer h-7 px-3 flex items-center justify-center rounded-md border border-border/50 bg-background/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors text-xs font-medium whitespace-nowrap"
										>
											<X className="h-3 w-3 mr-1" />
											{t("clearAll")}
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Stats */}
						{totalData > 0 && (
							<div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between text-xs text-muted-foreground">
								<div className="flex items-center space-x-2">
									<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
									<span>
										{t("statsTotalTransactions", {
											total: totalData,
										})}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<span>
										{t("pageOf", {
											current: currentPage,
											total: totalPages,
										})}
									</span>
									<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
									<span>{t("live")}</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Compact tabs */}
				<div className="relative p-5">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid h-10 w-full grid-cols-3 rounded-xl border border-border/50 bg-background/40 p-0.5 backdrop-blur-sm">
							<TabsTrigger
								value="all"
								className="rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
							>
								{t("tabs.all")}
							</TabsTrigger>
							<TabsTrigger
								value="deposits"
								className="rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
							>
								{t("tabs.deposits")}
							</TabsTrigger>
							<TabsTrigger
								value="withdrawals"
								className="rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
							>
								{t("tabs.withdrawals")}
							</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab} className="mt-5">
							{isLoading ? (
								<div className="space-y-3">
									{[...Array(pageSize)].map((_, i) => (
										<div
											key={i}
											className="animate-pulse rounded-xl border border-border/50 bg-muted/20 p-4 backdrop-blur-sm"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-3">
													<div className="h-10 w-10 rounded-xl bg-muted/40" />
													<div className="space-y-2">
														<div className="h-4 w-24 rounded bg-muted/40" />
														<div className="h-3 w-32 rounded bg-muted/40" />
														<div className="h-2 w-20 rounded bg-muted/40" />
													</div>
												</div>
												<div className="text-right space-y-2">
													<div className="h-4 w-20 rounded bg-muted/40" />
													<div className="h-3 w-12 rounded bg-muted/40" />
												</div>
											</div>
										</div>
									))}
								</div>
							) : error ? (
								<div className="text-center py-12">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/20">
										<XCircle className="h-8 w-8 text-destructive" />
									</div>
									<h3 className="mb-2 text-lg font-semibold text-foreground">
										{t("errorLoadingTransactions")}
									</h3>
									<p className="mb-4 text-sm text-muted-foreground">
										{error}
									</p>
									<Button
										type="button"
										onClick={refetch}
										className="rounded-lg bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/20"
									>
										<RefreshCw className="mr-2 h-4 w-4" />
										{t("tryAgain")}
									</Button>
								</div>
							) : !transactions || transactions.length === 0 ? (
								<div className="text-center py-12">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20">
										<Clock className="h-8 w-8 text-muted-foreground" />
									</div>
									<h3 className="mb-2 text-lg font-semibold text-foreground">
										{t("noTransactionsFound")}
									</h3>
									<p className="mb-6 text-sm text-muted-foreground">
										{activeTab === "all"
											? t(
													"noTransactionsAvailableSelectedPeriod"
											  )
											: activeTab === "deposits"
											? t("noDepositsFoundSelectedPeriod")
											: t(
													"noWithdrawalsFoundSelectedPeriod"
											  )}
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* Compact stats bar */}
									<div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3 backdrop-blur-sm">
										<div className="flex items-center space-x-2 text-sm text-foreground">
											<div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
											<span>
												{t("showingRangeOfTotal", {
													from:
														transactions.length > 0
															? (currentPage -
																	1) *
																	pageSize +
															  1
															: 0,
													to: Math.min(
														currentPage * pageSize,
														totalData
													),
													total: totalData,
												})}
											</span>
										</div>
										<div className="flex items-center space-x-1 text-xs text-muted-foreground">
											<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
											<span>
												{t("pageShort", {
													current: currentPage,
													total: totalPages,
												})}
											</span>
										</div>
									</div>

									{/* Transaction list */}
									<div className="space-y-3">
										{transactions?.map(
											(
												transaction: TransactionRecord,
												index: number
											) => (
												<div
													key={transaction.id}
													className="animate-in slide-in-from-bottom-2 duration-300"
													style={{
														animationDelay: `${
															index * 50
														}ms`,
													}}
												>
													<TransactionItem
														transaction={
															transaction
														}
													/>
												</div>
											)
										)}
									</div>

									{/* Pagination */}
									{totalPages > 1 && <PaginationControls />}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
