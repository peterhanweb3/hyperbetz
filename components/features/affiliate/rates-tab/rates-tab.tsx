"use client";

import useAffiliateDashboard from "@/hooks/affiliate/useAffiliateDashboard";
import { RatesTable } from "@/components/features/affiliate/rates-tab/rates-table";
// import { TrendingUp, Info } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faInfo } from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";

/**
 * The orchestrator for the "Rates" tab. It calls the master hook and
 * passes the affiliate rates data down to the presentation table.
 */
export const RatesTab = () => {
	const { affiliateRates, isLoading } = useAffiliateDashboard();
	const t = useTranslations("affiliate.rates");

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header Section */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 border border-primary/20">
						<FontAwesomeIcon
							icon={faArrowTrendUp}
							className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
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

				<div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-xl p-3 sm:p-4">
					<div className="flex items-start gap-2 sm:gap-3">
						<FontAwesomeIcon
							icon={faInfo}
							className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
						/>
						<div className="space-y-1">
							<p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
								{t("overview.title")}
							</p>
							<p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
								{t("overview.body")}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Rates Table */}
			<RatesTable affiliateRates={affiliateRates} isLoading={isLoading} />
		</div>
	);
};
