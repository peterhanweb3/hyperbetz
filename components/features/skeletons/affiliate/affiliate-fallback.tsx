"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	faArrowTrendUp,
	faGift,
	faGrid2Plus,
	faLink,
	faTable,
	faUser,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
// 	TrendingUp,
// 	Users,
// 	Gift,
// 	Link as LinkIcon,
// 	Table2,
// 	LayoutDashboard,
// } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Visual skeleton shown while the affiliate dashboard data loads.
 * Mirrors the final layout structure for a smooth UX.
 */
export const AffiliateFallback = () => {
	const t = useTranslations("affiliate.dashboard");
	return (
		<div className="space-y-8 animate-in fade-in-0 duration-500">
			{/* Header Skeleton */}
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
						{/* <LayoutDashboard className="h-6 w-6 text-primary" /> */}
						<FontAwesomeIcon
							icon={faGrid2Plus}
							fontSize={30}
							className="text-primary"
						/>
					</div>
					<div className="space-y-2">
						<Skeleton className="h-9 w-64" />
						<Skeleton className="h-5 w-96" />
					</div>
				</div>
			</div>

			{/* Performance Overview Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					{/* <TrendingUp className="h-5 w-5 text-primary" /> */}
					<FontAwesomeIcon
						icon={faArrowTrendUp}
						fontSize={20}
						className="text-primary"
					/>
					<Skeleton className="h-6 w-48" />
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{/* Total Income Card */}
					<Card className="relative overflow-hidden  bg-gradient-to-br from-card via-card to-emerald-500/5 border-emerald-500/20 shadow-lg">
						<div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
						<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{t("totalIncome")}
							</CardTitle>
							<div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
								{/* <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> */}
								<FontAwesomeIcon
									icon={faArrowTrendUp}
									fontSize={20}
									className="text-emerald-600 dark:text-emerald-400"
								/>
							</div>
						</CardHeader>
						<CardContent className="relative">
							<Skeleton className="h-9 w-32 mb-2" />
							<Skeleton className="h-4 w-24" />
						</CardContent>
					</Card>

					{/* Total Referrals Card */}
					<Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-blue-500/5 border-blue-500/20 shadow-lg">
						<div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl" />
						<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{t("totalReferrals")}
							</CardTitle>
							<div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
								{/* <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /> */}
								<FontAwesomeIcon
									icon={faUser}
									fontSize={20}
									className="text-blue-600 dark:text-blue-400"
								/>
							</div>
						</CardHeader>
						<CardContent className="relative">
							<Skeleton className="h-9 w-20 mb-2" />
							<Skeleton className="h-4 w-24" />
						</CardContent>
					</Card>

					{/* Claim Bonus Card */}
					<div className="md:col-span-2">
						<Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-orange-500/5 border-orange-500/20 shadow-lg">
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-2xl" />
							<CardHeader className="relative pb-3">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
										{/* <Gift className="h-5 w-5 text-orange-600 dark:text-orange-400" /> */}
										<FontAwesomeIcon
											icon={faGift}
											fontSize={20}
											className="text-orange-600 dark:text-orange-400"
										/>
									</div>
									<CardTitle className="text-base font-semibold text-foreground">
										{t("unclaimedEarnings")}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="relative space-y-6">
								<div className="space-y-2">
									<Skeleton className="h-10 w-40" />
									<Skeleton className="h-4 w-24" />
								</div>
								<Skeleton className="h-12 w-full" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Referral Management Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					{/* <Users className="h-5 w-5 text-primary" /> */}
					<FontAwesomeIcon
						icon={faUser}
						fontSize={20}
						className="text-primary"
					/>
					<Skeleton className="h-6 w-48" />
				</div>

				<Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-lg">
					<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
					<CardHeader className="relative">
						<CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
							<div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
								{/* <LinkIcon className="h-5 w-5 text-primary" /> */}
								<FontAwesomeIcon
									icon={faLink}
									fontSize={20}
									className="text-primary"
								/>
							</div>
							{t("yourReferralLinks")}
						</CardTitle>
						<Skeleton className="h-4 w-80 mt-2" />
					</CardHeader>
					<CardContent className="relative space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className="space-y-3">
								<Skeleton className="h-4 w-32" />
								<div className="flex w-full items-center space-x-3">
									<Skeleton className="h-12 flex-grow" />
									<Skeleton className="h-12 w-12" />
								</div>
								<Skeleton className="h-3 w-64" />
							</div>
							<div className="space-y-3">
								<Skeleton className="h-4 w-28" />
								<div className="flex w-full items-center space-x-3">
									<Skeleton className="h-12 flex-grow" />
									<Skeleton className="h-12 w-12" />
								</div>
								<Skeleton className="h-3 w-64" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Table Skeleton */}
			<div className="space-y-4">
				<Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								{/* <Table2 className="h-5 w-5 text-primary" /> */}
								<FontAwesomeIcon
									icon={faTable}
									fontSize={20}
									className="text-primary"
								/>
							</div>
							<div className="space-y-1">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>
						<Skeleton className="h-10 w-56" />
					</CardHeader>
					<CardContent className="space-y-4 pb-6">
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="grid grid-cols-7 gap-4 items-center py-3"
								>
									<div className="flex items-center space-x-3">
										<Skeleton className="h-8 w-8 rounded-full" />
										<Skeleton className="h-4 w-20" />
									</div>
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-6 w-16 rounded-full" />
								</div>
							))}
						</div>
						<div className="flex items-center justify-between pt-4 border-t border-border/50">
							<Skeleton className="h-4 w-40" />
							<div className="flex gap-2">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-8" />
								<Skeleton className="h-8 w-8" />
								<Skeleton className="h-8 w-8" />
								<Skeleton className="h-8 w-16" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AffiliateFallback;
