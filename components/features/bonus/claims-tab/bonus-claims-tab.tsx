"use client";

import useBonusDashboard from "@/hooks/bonus/useBonusDashboard";
import useBonusClaims from "@/hooks/bonus/usBonusClaims";
import { ClaimBonus } from "@/components/features/affiliate/dashboard-tab/claim-bonus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faRefresh } from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Enhanced semi-circular progress bar component showing monthly progress
 */
const SemiCircularProgress = ({
	totalUnclaimed,
}: {
	totalUnclaimed: number;
}) => {
	// Get current day and total days in month
	const now = new Date();
	const currentDay = now.getDate();
	const totalDaysInMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0
	).getDate();

	// Calculate progress percentage based on days
	const dayProgressPercentage = (currentDay / totalDaysInMonth) * 100;

	// Calculate stroke dash offset for semi-circle (180 degrees)
	const radius = 90;
	const circumference = Math.PI * radius;
	const progressOffset = circumference * (1 - dayProgressPercentage / 100);

	return (
		<div className="flex flex-col items-center space-y-4 sm:space-y-6 p-4  bg-gradient-to-br from-card via-card to-muted/5">
			{/* Semi-circular progress bar */}
			<div className="relative w-full flex items-center justify-center">
				<svg
					className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] h-28 sm:h-32 md:h-40"
					viewBox="0 0 240 140"
					style={{ transform: "rotate(0deg)" }}
				>
					{/* Background arc - thicker and more visible */}
					<path
						d="M 30 120 A 90 90 0 0 1 210 120"
						fill="none"
						stroke="white"
						strokeWidth="16"
						strokeLinecap="round"
						className="opacity-20"
					/>
					{/* Progress arc with gradient effect */}
					<path
						d="M 30 120 A 90 90 0 0 1 210 120"
						fill="none"
						stroke="url(#progressGradient)"
						strokeWidth="16"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={progressOffset}
						className="transition-all duration-700 ease-out drop-shadow-lg"
						style={{
							filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))",
						}}
					/>
					{/* Define gradient */}
					<defs>
						<linearGradient
							id="progressGradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor="#f97316" />
							<stop offset="50%" stopColor="#fb923c" />
							<stop offset="100%" stopColor="#facc15" />
						</linearGradient>
					</defs>
				</svg>

				{/* Center content - Day Progress */}
				<div className="absolute inset-0 flex flex-col items-center justify-center mt-4 sm:mt-6 md:mt-8">
					<div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tabular-nums tracking-tight mt-auto mb-1">
						<span className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
							{currentDay}
						</span>
						<span className="text-xl sm:text-2xl md:text-3xl text-muted-foreground/40 font-bold">
							{" "}
							/{" "}
						</span>
						<span className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground/60 font-bold">
							{totalDaysInMonth}
						</span>
					</div>
				</div>
			</div>

			{/* Current Bonus Section */}
			<div className="w-full space-y-2 sm:space-y-3 pt-2 border-t border-border/50">
				<div className="text-center">
					<div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 tracking-wide">
						Current Bonus:
					</div>
					<div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent tabular-nums">
						{totalUnclaimed.toFixed(2)}
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * Claims tab showing unclaimed bonus history with claim button
 */
export const BonusClaimsTab = () => {
	const t = useTranslations("bonus.claims");
	const tCommon = useTranslations("bonus");

	const {
		bonusData,
		isLoading: isDashboardLoading,
		isClaiming,
		handleClaim,
		isClaimDisabled,
	} = useBonusDashboard();

	const {
		unclaimedBonusData,
		isLoading: isClaimsLoading,
		isRefreshing,
		refresh,
	} = useBonusClaims();

	const isLoading = isDashboardLoading || isClaimsLoading;

	// Calculate totals from the data
	const totalUnclaimed = unclaimedBonusData.reduce(
		(sum, item) => sum + item.unclaim_amount,
		0
	);

	// Format date helper
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Get tier label
	const getTierLabel = (tier: number) => {
		return `${t("tierPrefix")} ${tier}`;
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 border border-primary/20">
							<FontAwesomeIcon
								icon={faClipboardList}
								className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
							/>
						</div>
						<div>
							<h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
								{t("title")}
							</h1>
							<p className="text-sm sm:text-base text-muted-foreground mt-1">
								{t("subtitle")}
							</p>
						</div>
					</div>
					<Button
						onClick={refresh}
						disabled={isRefreshing}
						variant="outline"
						size="sm"
						className="flex items-center gap-2"
					>
						<FontAwesomeIcon
							icon={faRefresh}
							fontSize={16}
							className={isRefreshing ? "animate-spin" : ""}
						/>
						<span className="hidden xs:inline">
							{isRefreshing
								? tCommon("refreshing")
								: tCommon("refresh")}
						</span>
					</Button>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-stretch">
				{/* Table Section */}
				<div className="flex-1 min-w-0 flex flex-col">
					<Card className="overflow-hidden pt-0 flex flex-col flex-1">
						{isLoading ? (
							<div className="p-3 sm:p-4 md:p-6 space-y-4">
								{[...Array(5)].map((_, i) => (
									<Skeleton
										key={i}
										className="h-10 sm:h-12 w-full"
									/>
								))}
							</div>
						) : (
							<div className="overflow-x-auto flex-1 flex flex-col">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50 hover:bg-muted/50">
											<TableHead className="font-semibold text-foreground/80 py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-xs sm:text-sm">
												{t("tableHeaders.date")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
												{t("tableHeaders.slots")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
												{t("tableHeaders.liveCasino")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
												{t("tableHeaders.sports")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
												{t("tableHeaders.total")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm">
												{t("tableHeaders.tier")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[90px] sm:min-w-[110px] text-xs sm:text-sm">
												{t("tableHeaders.unclaimed")}
											</TableHead>
											<TableHead className="font-semibold text-foreground/80 text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm">
												{t("tableHeaders.token")}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{unclaimedBonusData.length === 0 ? (
											<TableRow className="hover:bg-transparent">
												<TableCell
													colSpan={8}
													className="text-center py-12 sm:py-16"
												>
													<div className="flex flex-col items-center gap-2 sm:gap-3">
														<div className="text-base sm:text-lg text-muted-foreground font-medium">
															{t("empty.title")}
														</div>
														<div className="text-xs sm:text-sm text-muted-foreground/70">
															{t(
																"empty.subtitle"
															)}
														</div>
													</div>
												</TableCell>
											</TableRow>
										) : (
											unclaimedBonusData.map(
												(item, index) => (
													<TableRow
														key={index}
														className="hover:bg-muted/30 transition-colors"
													>
														<TableCell className="font-medium py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 whitespace-nowrap text-xs sm:text-sm">
															{formatDate(
																item.bet_date
															)}
														</TableCell>
														<TableCell className="text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 tabular-nums text-xs sm:text-sm">
															<span className="text-muted-foreground">
																${" "}
															</span>
															{item.total_wager_slot.toFixed(
																2
															)}
														</TableCell>
														<TableCell className="text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 tabular-nums text-xs sm:text-sm">
															<span className="text-muted-foreground">
																${" "}
															</span>
															{item.total_wager_lc.toFixed(
																2
															)}
														</TableCell>
														<TableCell className="text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 tabular-nums text-xs sm:text-sm">
															<span className="text-muted-foreground">
																${" "}
															</span>
															{item.total_wager_sport.toFixed(
																2
															)}
														</TableCell>
														<TableCell className="text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-semibold tabular-nums text-xs sm:text-sm">
															<span className="text-muted-foreground font-normal">
																${" "}
															</span>
															{item.total_wager.toFixed(
																2
															)}
														</TableCell>
														<TableCell className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4">
															<div className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold min-w-[60px] sm:min-w-[70px]">
																{getTierLabel(
																	item.tier
																)}
															</div>
														</TableCell>
														<TableCell className="text-right py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-bold text-primary tabular-nums text-xs sm:text-sm">
															<span className="font-normal text-muted-foreground">
																${" "}
															</span>
															{item.unclaim_amount.toFixed(
																2
															)}
														</TableCell>
														<TableCell className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4">
															<span className="inline-flex items-center justify-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-muted/50 text-[10px] sm:text-xs font-medium text-foreground/70 min-w-[45px] sm:min-w-[50px]">
																{item.token}
															</span>
														</TableCell>
													</TableRow>
												)
											)
										)}
									</TableBody>
								</Table>
							</div>
						)}
					</Card>
				</div>

				{/* Claim Card Section */}
				<div className="lg:w-70 xl:w-86 flex-shrink-0 flex flex-col">
					<div className="space-y-3 sm:space-y-4 lg:sticky lg:top-4 flex-1 flex flex-col">
						{/* Semi-Circular Progress Card */}
						<Card className="overflow-hidden border-primary/70 p-0 flex-1 flex flex-col justify-center">
							<CardContent className="p-0">
								{isLoading ? (
									<div className="p-4 sm:p-6 space-y-4">
										<Skeleton className="h-24 sm:h-32 w-full" />
										<Skeleton className="h-16 sm:h-20 w-full" />
									</div>
								) : (
									<SemiCircularProgress
										totalUnclaimed={totalUnclaimed}
									/>
								)}
							</CardContent>
						</Card>

						{/* Claim Button */}
						<ClaimBonus
							isLoading={isLoading}
							isClaiming={isClaiming}
							unclaimedAmount={
								bonusData?.data.available_bonus || 0
							}
							onClaim={handleClaim}
							token="USD"
							isClaimDisabled={isClaimDisabled}
							context="bonus"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
