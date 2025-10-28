"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AffiliateRate } from "@/types/affiliate/affiliate.types";
import { BonusRate } from "@/types/bonus/bonus.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDollarSign,
	faArrowTrendUp,
	faGamepad,
	faDice,
	faTrophy,
} from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";
import {
	formatTurnoverRange,
	getTierColorScheme,
} from "@/lib/utils/features/affiliate-bonus/affiliate-bonus.utils";

interface IndividualCalculatorProps {
	rate: AffiliateRate | BonusRate;
	wagerAmount: string;
	onWagerChange: (amount: string) => void;
	calculateEarnings: (wager: number, percentage: string | null) => number;
	context?: "affiliate" | "bonus";
}

const GameTypeCalculator = ({
	type,
	percentage,
	earnings,
	icon,
	color,
	context = "affiliate",
}: {
	type: string;
	percentage: string | null;
	wager: number;
	earnings: number;
	icon: React.ReactNode;
	color: string;
	context?: "affiliate" | "bonus";
}) => {
	const t = useTranslations(`${context}.calculator`);
	return (
		<div
			className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-4 shadow-sm transition-all hover:shadow-md hover:border-${color}/30 group`}
		>
			<div
				className={`absolute inset-0 bg-gradient-to-br from-${color}/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>

			<div className="relative space-y-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className={`p-1.5 rounded-lg bg-${color}/10 border border-${color}/20`}
						>
							{icon}
						</div>
						<span className="font-semibold text-foreground">
							{type}
						</span>
					</div>
					<Badge variant="secondary" className="font-medium">
						{percentage || "0.00"}%
					</Badge>
				</div>

				{/* Calculation Display */}
				<div className="space-y-2">
					<div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
						{t("potentialEarnings")}
					</div>
					<div
						className={`text-2xl font-semibold text-${color} flex items-center gap-1`}
					>
						<FontAwesomeIcon
							icon={faDollarSign}
							className="h-5 w-5"
						/>
						{earnings.toFixed(2)}
					</div>
					<div className="text-xs text-muted-foreground">
						{t("basedOnRate", { percentage: percentage || "0.00" })}
					</div>
				</div>
			</div>
		</div>
	);
};

export const IndividualCalculator = ({
	rate,
	wagerAmount,
	onWagerChange,
	calculateEarnings,
	context = "affiliate",
}: IndividualCalculatorProps) => {
	const wager = parseFloat(wagerAmount) || 0;
	const tierColor = getTierColorScheme(Number(rate.level));
	const t = useTranslations(`${context}.calculator`);
	const tRates = useTranslations(`${context}.rates`);

	return (
		<Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/10 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
			<div
				className={`absolute inset-0 bg-gradient-to-r from-${tierColor.bg}-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>

			<CardContent className="relative p-6 space-y-6">
				{/* Tier Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<div
							className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-${tierColor.bg}-500 to-${tierColor.bg}-600 text-white shadow-lg`}
						>
							<span className="text-xl font-semibold">
								{rate.level}
							</span>
						</div>
						<div>
							<h3 className="text-2xl font-semibold text-foreground">
								{t("tier", { level: rate.level })}
							</h3>
							<p className="text-sm text-muted-foreground">
								{t("commissionLevel", { level: rate.level })}
							</p>
						</div>
					</div>
					<Badge
						variant="outline"
						className={`text-sm py-2 px-4 border-${tierColor.bg}-500/30 bg-${tierColor.bg}-500/10 text-${tierColor.bg}-700 dark:text-${tierColor.bg}-300`}
					>
						<FontAwesomeIcon
							icon={faArrowTrendUp}
							className="h-4 w-4 mr-2"
						/>
						{tRates("table.wagerRange")}{" "}
						{formatTurnoverRange(rate.min_to, rate.max_to)}
					</Badge>
				</div>

				{/* Wager Input Section */}
				<div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<FontAwesomeIcon
								icon={faDollarSign}
								className="h-5 w-5 text-primary"
							/>
							<label className="text-sm font-medium text-foreground">
								{t("enterWager")}
							</label>
						</div>
						<Input
							type="number"
							placeholder={t("wagerPlaceholder")}
							value={wagerAmount}
							onChange={(e) => onWagerChange(e.target.value)}
							className="text-lg font-medium bg-background border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
						/>
						{wager > 0 && (
							<div className="text-sm text-muted-foreground">
								{t("calcFor", {
									amount: wager.toLocaleString(),
								})}
							</div>
						)}
					</div>
				</div>

				{/* Game Type Calculators Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<GameTypeCalculator
						type={tRates("table.slots")}
						percentage={rate.slot_percent}
						wager={wager}
						earnings={calculateEarnings(wager, rate.slot_percent)}
						icon={
							<FontAwesomeIcon
								icon={faDice}
								className="h-4 w-4 text-amber-600"
							/>
						}
						color="amber"
						context={context}
					/>
					<GameTypeCalculator
						type={tRates("table.liveCasino")}
						percentage={rate.lc_percent}
						wager={wager}
						earnings={calculateEarnings(wager, rate.lc_percent)}
						icon={
							<FontAwesomeIcon
								icon={faGamepad}
								className="h-4 w-4 text-red-600"
							/>
						}
						color="red"
						context={context}
					/>
					<GameTypeCalculator
						type={tRates("table.sports")}
						percentage={rate.sport_percent}
						wager={wager}
						earnings={calculateEarnings(wager, rate.sport_percent)}
						icon={
							<FontAwesomeIcon
								icon={faTrophy}
								className="h-4 w-4 text-blue-600"
							/>
						}
						color="blue"
						context={context}
					/>
				</div>

				{/* Total Earnings Summary */}
				{wager > 0 && (
					<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<FontAwesomeIcon
									icon={faArrowTrendUp}
									className="h-5 w-5 text-primary"
								/>
								<span className="font-medium text-foreground">
									{t("totalPotential")}
								</span>
							</div>
							<div className="text-2xl font-semibold text-primary">
								$
								{(
									calculateEarnings(
										wager,
										rate.slot_percent
									) +
									calculateEarnings(wager, rate.lc_percent) +
									calculateEarnings(wager, rate.sport_percent)
								).toFixed(2)}
							</div>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t("combinedAtTier", { level: rate.level })}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
