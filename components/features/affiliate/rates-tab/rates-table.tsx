"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
	TrendingUp,
	Clock,
	Diamond,
	Dice6,
	Gamepad2,
	Trophy,
} from "lucide-react";
import { AffiliateRate } from "@/types/affiliate/affiliate.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import {
	formatTurnoverRangeCompact,
	getTierColorSchemeWithGradient,
} from "@/lib/utils/features/affiliate-bonus/affiliate-bonus.utils";

interface RatesTableProps {
	affiliateRates: AffiliateRate[];
	isLoading: boolean;
	context?: "affiliate" | "bonus";
}

const TableSkeleton = () => (
	<div className="space-y-4">
		<div className="grid grid-cols-5 gap-4 p-6 bg-muted/30 rounded-xl">
			{[...Array(5)].map((_, i) => (
				<Skeleton key={i} className="h-6 w-full" />
			))}
		</div>
		{[...Array(7)].map((_, i) => (
			<div key={i} className="grid grid-cols-5 gap-4 p-6">
				{[...Array(5)].map((_, j) => (
					<Skeleton key={j} className="h-8 w-full" />
				))}
			</div>
		))}
	</div>
);

/**
 * A dedicated component to display the affiliate commission rates in a clean,
 * professional data table, inspired by the reference UI.
 */
export const RatesTable = ({
	affiliateRates,
	isLoading,
	context = "affiliate",
}: RatesTableProps) => {
	const t = useTranslations(`${context}.rates`);

	// Tier name mapping for bonus context
	const commissionLevel: Record<number, string> = {
		1: "Bronze",
		2: "Silver",
		3: "Gold",
		4: "Platinum",
		5: "Emerald",
		6: "Ruby",
		7: "Diamond",
	};

	return (
		<Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/10 border-border/50 shadow-xl pt-0">
			<CardHeader className="relative bg-gradient-to-r pt-6 from-muted/30 via-muted/20 to-muted/30 border-b border-border/50 pb-6">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
				<div className="relative flex items-center gap-4">
					<div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
						<TrendingUp className="h-7 w-7 text-primary" />
					</div>
					<div>
						<CardTitle className="text-2xl font-semibold text-foreground tracking-tight">
							{t("title")}
						</CardTitle>
						<p className="text-muted-foreground mt-1">
							{t("subtitle")}
						</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				{isLoading ? (
					<div className="p-6">
						<TableSkeleton />
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-gradient-to-r from-muted/40 to-muted/20 border-none hover:bg-muted/50 transition-colors">
									<TableHead className="font-semibold text-foreground text-base py-6 px-6 border-r border-border/30 min-w-[200px]">
										<div className="flex items-center gap-3">
											<Diamond className="h-5 w-5 text-primary" />
											{t("table.tierLevel")}
										</div>
									</TableHead>
									<TableHead className="font-semibold text-foreground text-base py-6 px-6 border-r border-border/30 min-w-[180px]">
										<div className="flex items-center gap-2">
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
											{t("table.wagerRange")}
										</div>
									</TableHead>
									<TableHead className="text-center font-semibold text-foreground text-base py-6 px-6 border-r border-border/30 min-w-[150px]">
										<div className="flex items-center justify-center gap-2">
											<Dice6 className="h-4 w-4 text-amber-600" />
											{t("table.slots")}
										</div>
									</TableHead>
									<TableHead className="text-center font-semibold text-foreground text-base py-6 px-6 border-r border-border/30 min-w-[150px]">
										<div className="flex items-center justify-center gap-2">
											<Gamepad2 className="h-4 w-4 text-red-600" />
											{t("table.liveCasino")}
										</div>
									</TableHead>
									<TableHead className="text-center font-semibold text-foreground text-base py-6 px-6 min-w-[150px]">
										<div className="flex items-center justify-center gap-2">
											<Trophy className="h-4 w-4 text-blue-600" />
											{t("table.sports")}
										</div>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{affiliateRates.map((tier) => {
									const tierColor =
										getTierColorSchemeWithGradient(
											Number(tier.level)
										);
									return (
										<TableRow
											key={tier.level}
											className="group border-border/20 hover:bg-gradient-to-r hover:from-muted/20 hover:to-transparent transition-all duration-300"
										>
											<TableCell className="py-6 px-6 border-r border-border/20">
												<div className="flex items-center gap-4">
													<div
														className={`w-10 h-10 rounded-xl bg-gradient-to-r ${tierColor.gradient} flex items-center justify-center shadow-lg border border-white/20`}
													>
														<span className="text-white font-semibold text-sm">
															{tier.level}
														</span>
													</div>
													<div>
														<div className="font-semibold text-foreground text-lg">
															{t(
																"table.tierPrefix"
															)}{" "}
															{tier.level}
														</div>
														<div className="text-sm text-muted-foreground">
															{
																commissionLevel[
																	Number(
																		tier.level
																	)
																]
															}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell className="py-6 px-6 border-r border-border/20">
												<div className="space-y-1">
													<div className="font-semibold text-foreground text-base">
														{formatTurnoverRangeCompact(
															tier.min_to,
															tier.max_to
														)}
													</div>
													<div className="text-xs text-muted-foreground">
														{t("table.dailyWager")}
													</div>
												</div>
											</TableCell>
											<TableCell className="text-center py-6 px-6 border-r border-border/20">
												<div className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl shadow-sm">
													<Dice6 className="w-4 h-4 text-amber-600" />
													<span className="font-semibold text-foreground text-lg">
														{tier.slot_percent}%
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center py-6 px-6 border-r border-border/20">
												<div className="inline-flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl shadow-sm">
													<Gamepad2 className="w-4 h-4 text-red-600" />
													<span className="font-semibold text-foreground text-lg">
														{tier.lc_percent}%
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center py-6 px-6">
												<div className="inline-flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl shadow-sm">
													<Trophy className="w-4 h-4 text-blue-600" />
													<span className="font-semibold text-foreground text-lg">
														{tier.sport_percent}%
													</span>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}

				{/* Footer Info */}
				<div className="px-6 py-6 bg-gradient-to-r from-muted/20 to-muted/10 border-t border-border/50">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Clock className="h-4 w-4 text-primary" />
							<span className="font-medium">
								{t("footer.schedule")}
							</span>
						</div>
						<div className="text-sm text-muted-foreground">
							{t("footer.availableDaily")}{" "}
							<span className="font-semibold text-foreground">
								14:00 UTC
							</span>
							<span className="text-xs ml-2">
								{t("footer.localTimeLabel", { time: "19:30" })}
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
