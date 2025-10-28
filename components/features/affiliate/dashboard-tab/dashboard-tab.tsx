"use client";

import useAffiliateDashboard from "@/hooks/affiliate/useAffiliateDashboard";
import { useAffiliateReferrals } from "@/hooks/affiliate/useAffiliateReferrals";
import ReferralsTable from "../referral-tab/referrals-table";
import { ClaimBonus } from "./claim-bonus";
import { CommissionTiers } from "@/components/common/affiliate-bonus/comission-tiers";
import { ReferralLink } from "./referral-link";
import { TotalReferrals } from "./total-referral";
import { TotalReferralIncome } from "./total-referral-income";
// import { LayoutDashboard, Users, TrendingUp, Shield } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faGripHorizontal,
	faUsers,
	faArrowTrendUp,
	faShield,
} from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";
import {
	comissionAmount,
	getGameType,
	parseAmount,
} from "@/lib/utils/features/affiliate-bonus/affiliate-bonus.utils";

/**
 * The orchestrator for the affiliate dashboard. It calls the master hook
 * and passes the correct state down to the dumb presentational components.
 */
export const DashboardTab = () => {
	const t = useTranslations("affiliate.dashboard");
	const {
		downlineData,
		isLoading,
		isClaiming,
		handleClaim,
		isClaimDisabled,
		affiliateRates,
	} = useAffiliateDashboard();
	const {
		data,
		isLoading: isReferralLoading,
		currentPage,
		sortOrder,
		setPage,
		setSortOrder,
	} = useAffiliateReferrals();

	// Base example structure without commission
	const exampleTemplates = [
		{ tier: 1, amount: "$250", gameKey: "table.slots" },
		{ tier: 2, amount: "$500", gameKey: "table.liveCasino" },
		{ tier: 3, amount: "$1,000", gameKey: "table.sports" },
		{ tier: 4, amount: "$5,000", gameKey: "table.slots" },
	];

	// Dynamically calculate commissions based on affiliateRates
	const defaultExamples = exampleTemplates.map((example) => {
		const rate = affiliateRates?.find(
			(r) => Number(r.level) === example.tier
		);
		const numericAmount = parseAmount(example.amount);
		const gameType = getGameType(example.gameKey);

		return {
			...example,
			commission:
				rate && !isLoading
					? comissionAmount(
							rate,
							numericAmount,
							example.tier,
							gameType
					  )
					: "$0.00",
		};
	});

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header Section */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 border border-primary/20">
						<FontAwesomeIcon
							icon={faGripHorizontal}
							className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
						/>
					</div>
					<div>
						<h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
							{t("title")}
						</h1>
						{/* <p className="text-muted-foreground text-base mt-1">
							{t("subtitle")}
						</p> */}
					</div>
				</div>
			</div>

			{/* Statistics Overview */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex items-center gap-2 mb-2">
					<FontAwesomeIcon
						icon={faArrowTrendUp}
						className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
					/>
					<h2 className="text-lg sm:text-xl font-semibold text-foreground">
						{t("performanceOverview")}
					</h2>
				</div>
				<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					<TotalReferralIncome
						isLoading={isLoading}
						totalBonus={
							(downlineData?.total_unclaim || 0) +
							(downlineData?.total_wager_last_month || 0)
						}
						token="USD"
					/>
					<TotalReferrals
						isLoading={isLoading}
						totalReferrals={downlineData?.total_data}
					/>
					<div className="sm:col-span-2">
						<ClaimBonus
							isLoading={isLoading}
							isClaiming={isClaiming}
							unclaimedAmount={downlineData?.total_unclaim}
							onClaim={handleClaim}
							token="USD"
							isClaimDisabled={isClaimDisabled}
						/>
					</div>
				</div>
			</div>

			{/* Referral Management */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex items-center gap-2 mb-2">
					<FontAwesomeIcon
						icon={faUsers}
						className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
					/>
					<h2 className="text-lg sm:text-xl font-semibold text-foreground">
						{t("referralManagement")}
					</h2>
				</div>
				<ReferralLink />
			</div>

			{/* Referrals Table */}
			<div className="space-y-3 sm:space-y-4">
				<ReferralsTable
					data={data?.data || []}
					totalRecords={data?.total_data || 0}
					isLoading={isReferralLoading}
					currentPage={currentPage}
					sortOrder={sortOrder}
					onPageChange={setPage}
					onSortChange={setSortOrder}
				/>
			</div>

			{/* Commission Tiers */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex items-center gap-2 mb-2">
					<FontAwesomeIcon
						icon={faShield}
						className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
					/>
					<h2 className="text-lg sm:text-xl font-semibold text-foreground">
						{t("termsAndCommission")}
					</h2>
				</div>
				<CommissionTiers
					rates={affiliateRates}
					isLoading={isLoading}
					examples={defaultExamples}
				/>
			</div>
		</div>
	);
};
