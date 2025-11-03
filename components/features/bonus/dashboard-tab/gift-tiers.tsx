"use client";

import { BonusRate } from "@/types/bonus/bonus.types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { formatTurnoverRange } from "@/lib/utils/features/affiliate-bonus/affiliate-bonus.utils";

interface GiftTiersProps {
	rates: BonusRate[];
	isLoading: boolean;
}

// Mapping of tier levels to gift images and tier names
const tierGiftMapping = [
	{
		level: 1,
		image: "/assets/gifts/orange.png",
		name: "Bronze",
		bgGradient: "from-orange-500/10 to-orange-600/5",
		borderColor: "border-orange-500/30",
		buttonBg: "bg-gradient-to-r from-orange-500 to-orange-600",
	},
	{
		level: 2,
		image: "/assets/gifts/sky blue.png",
		name: "Silver",
		bgGradient: "from-slate-400/10 to-slate-500/5",
		borderColor: "border-slate-400/30",
		buttonBg: "bg-gradient-to-r from-slate-400 to-slate-500",
	},
	{
		level: 3,
		image: "/assets/gifts/yellow.png",
		name: "Gold",
		bgGradient: "from-yellow-500/10 to-yellow-600/5",
		borderColor: "border-yellow-500/30",
		buttonBg: "bg-gradient-to-r from-yellow-500 to-yellow-600",
	},
	{
		level: 4,
		image: "/assets/gifts/pink.png",
		name: "Platinum",
		bgGradient: "from-pink-400/10 to-pink-500/5",
		borderColor: "border-pink-400/30",
		buttonBg: "bg-gradient-to-r from-pink-400 to-pink-500",
	},
	{
		level: 5,
		image: "/assets/gifts/green.png",
		name: "Emerald",
		bgGradient: "from-emerald-500/10 to-emerald-600/5",
		borderColor: "border-emerald-500/30",
		buttonBg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
	},
	{
		level: 6,
		image: "/assets/gifts/red.png",
		name: "Ruby",
		bgGradient: "from-red-500/10 to-red-600/5",
		borderColor: "border-red-500/30",
		buttonBg: "bg-gradient-to-r from-red-500 to-red-600",
	},
	{
		level: 7,
		image: "/assets/gifts/blue.png",
		name: "Diamond",
		bgGradient: "from-blue-400/10 to-blue-500/5",
		borderColor: "border-blue-400/30",
		buttonBg: "bg-gradient-to-r from-blue-400 to-blue-500",
	},
];

const GiftTierSkeleton = ({ total }: { total: number }) => (
	<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-7 gap-3 sm:gap-4">
		{[...Array(total)].map((_, i) => (
			<div
				key={i}
				className="flex flex-col items-center space-y-3 p-3 sm:p-4 bg-card border border-border rounded-xl"
			>
				<Skeleton className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-lg" />
				<Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
				<Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
				<Skeleton className="h-7 sm:h-8 w-full rounded-lg" />
			</div>
		))}
	</div>
);

/**
 * Gift Tiers component showing the farming rewards with gift boxes
 * Matches the design from the reference image
 */
export const GiftTiers = ({ rates, isLoading }: GiftTiersProps) => {
	if (isLoading) {
		return <GiftTierSkeleton total={rates.length} />;
	}

	return (
		<Card className="bg-gradient-to-br from-background via-background to-muted/20 shadow-lg">
			<CardContent className="p-4 sm:p-6 lg:p-8">
				{/* Header */}
				<div className="mb-4 sm:mb-6">
					<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
						Wager Farming to Get USDT
					</h2>
					<div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 text-sm sm:text-base text-muted-foreground">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-orange-500">
								Daily
							</span>
							<span>Commission</span>
						</div>
						<span className="hidden sm:inline text-muted-foreground/50">
							•
						</span>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-foreground">
								The commission is calculated every 24 hours.
							</span>
							<span className="text-orange-500 font-semibold">
								24 hours
							</span>
						</div>
					</div>
				</div>

				{/* Gift Tier Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-7 gap-3 sm:gap-4">
					{rates.map((rate) => {
						const tierConfig = tierGiftMapping.find(
							(t) => t.level === Number(rate.level)
						);

						if (!tierConfig) return null;

						// Get the highest percentage from the rate
						const maxPercent = Math.max(
							parseFloat(rate.slot_percent),
							parseFloat(rate.lc_percent),
							parseFloat(rate.sport_percent)
						);

						return (
							<div
								key={rate.level}
								className={`group relative flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br ${tierConfig.bgGradient} border ${tierConfig.borderColor} rounded-xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1`}
							>
								{/* Gift Image */}
								<div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-3">
									<Image
										src={tierConfig.image}
										alt={`${tierConfig.name} Gift`}
										fill
										className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
									/>
								</div>

								{/* Percentage */}
								<div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
									{maxPercent}%
								</div>

								{/* Wager Range */}
								<div className="text-xs sm:text-sm text-muted-foreground text-center mb-2 sm:mb-3 break-words w-full px-1">
									<span className="block sm:inline">
										Wager{" "}
									</span>
									<span className="font-medium">
										{formatTurnoverRange(
											rate.min_to,
											rate.max_to
										)}
									</span>
								</div>

								{/* Tier Name Button */}
								<div
									className={`w-full mt-auto py-1.5 sm:py-2 px-3 sm:px-4 ${tierConfig.buttonBg} text-white text-center rounded-lg font-semibold text-xs sm:text-sm shadow-md`}
								>
									{tierConfig.name}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
