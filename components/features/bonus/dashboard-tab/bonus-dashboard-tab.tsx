"use client";

import useBonusDashboard from "@/hooks/bonus/useBonusDashboard";
import { CommissionTiers } from "@/components/common/affiliate-bonus/comission-tiers";
import { GiftTiers } from "./gift-tiers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripHorizontal } from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";
import {
	comissionAmount,
	getGameType,
	parseAmount,
} from "@/lib/utils/features/affiliate-bonus/affiliate-bonus.utils";

/**
 * The Dashboard tab for Bonus section showing Terms & Conditions
 */
export const BonusDashboardTab = () => {
	const t = useTranslations("bonus.dashboard");
	// const tRates = useTranslations("bonus.rates");
	const { bonusRates, isLoading } = useBonusDashboard();

	// Base example structure without commission
	const exampleTemplates = [
		{ tier: 1, amount: "$250", gameKey: "table.slots" },
		{ tier: 2, amount: "$500", gameKey: "table.liveCasino" },
		{ tier: 3, amount: "$1,000", gameKey: "table.sports" },
		{ tier: 4, amount: "$5,000", gameKey: "table.slots" },
		{ tier: 5, amount: "$10,000", gameKey: "table.liveCasino" },
		{ tier: 6, amount: "$20,000", gameKey: "table.sports" },
		{ tier: 7, amount: "$60,000", gameKey: "table.liveCasino" },
	];

	// Dynamically calculate commissions based on affiliateRates
	const defaultExamples = exampleTemplates.map((example) => {
		const rate = bonusRates?.find((r) => Number(r.level) === example.tier);
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
					</div>
				</div>
			</div>

			{/* Gift Tiers Section */}
			<GiftTiers rates={bonusRates} isLoading={isLoading} />

			{/* Reusing CommissionTiers component */}
			<CommissionTiers
				rates={bonusRates}
				isLoading={isLoading}
				context="bonus"
				examples={defaultExamples}
			/>
		</div>
	);
};
