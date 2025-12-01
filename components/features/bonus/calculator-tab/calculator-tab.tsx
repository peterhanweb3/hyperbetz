"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndividualCalculator } from "@/components/common/affiliate-bonus/wager-calculator";
import useBonusDashboard from "@/hooks/bonus/useBonusDashboard";
import { useAffiliateCalculator } from "@/hooks/affiliate/useAffiliateCalculator";
// import { Calculator, TrendingUp } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faCalculator } from "@fortawesome/pro-light-svg-icons";

const CalculatorSkeleton = () => (
	<div className="space-y-4 sm:space-y-6">
		{[...Array(3)].map((_, i) => (
			<Card
				key={i}
				className="bg-card/50 backdrop-blur-sm border-border/50 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm"
			>
				<div className="flex items-center gap-3 sm:gap-4">
					<Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
					<Skeleton className="h-6 sm:h-8 w-36 sm:w-48" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
					<Skeleton className="h-20 sm:h-24 w-full" />
					<Skeleton className="h-20 sm:h-24 w-full" />
					<Skeleton className="h-20 sm:h-24 w-full" />
				</div>
				<Skeleton className="h-10 sm:h-12 w-full" />
			</Card>
		))}
	</div>
);

interface CalculatorTabProps {
	context?: "affiliate" | "bonus";
}

/**
 * The orchestrator for the "Calculator" tab. It fetches the affiliate rates
 * and provides the state and logic for the interactive calculator UI.
 */
export const CalculatorTab = ({
	context = "affiliate",
}: CalculatorTabProps) => {
	// Get the static rate data from the dashboard hook
	const { bonusRates, isLoading: isLoadingRates } = useBonusDashboard();

	// Get the interactive state and logic from the calculator hook
	const { wagerInputs, handleWagerChange, calculateEarnings } =
		useAffiliateCalculator();
	const t = useTranslations(`${context}.calculator`);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header Section */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 border border-primary/20">
						{/* <Calculator className="h-6 w-6 text-primary" /> */}
						<FontAwesomeIcon
							icon={faCalculator}
							fontSize={20}
							className="text-primary sm:text-[24px]"
						/>
					</div>
					<div>
						<h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
							{t("title")}
						</h2>
						<p className="text-muted-foreground text-sm sm:text-base mt-1">
							{t("subtitle")}
						</p>
					</div>
				</div>

				<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-3 sm:p-4">
					<div className="flex items-center gap-2 text-xs sm:text-sm text-primary flex-wrap">
						{/* <TrendingUp className="h-4 w-4" /> */}
						<FontAwesomeIcon
							icon={faArrowTrendUp}
							fontSize={14}
							className="text-primary sm:text-base"
						/>
						<span className="font-medium">
							{t("interactive.title")}
						</span>
						<span className="text-muted-foreground">
							{t("interactive.body")}
						</span>
					</div>
				</div>
			</div>

			{/* Calculator Grid */}
			{isLoadingRates ? (
				<CalculatorSkeleton />
			) : (
				<div className="grid gap-4 sm:gap-6">
					{bonusRates.map((rate) => (
						<IndividualCalculator
							key={rate.level}
							rate={rate}
							// Each calculator gets its own specific wager amount from the state object
							wagerAmount={wagerInputs[rate.level] || ""}
							// The handler is passed down with the tier level pre-filled
							onWagerChange={(amount) =>
								handleWagerChange(rate.level, amount)
							}
							calculateEarnings={calculateEarnings}
							context={context}
						/>
					))}
				</div>
			)}
		</div>
	);
};
