"use client";

import CountUp from "react-countup";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCircleCheck } from "@fortawesome/pro-light-svg-icons";

interface Props {
	token: string;
	isLoading: boolean;
	pendingBonus: number;
	lastClaimDate: string;
	lastClaimAmount: number;
}

export const BonusStats = ({
	isLoading,
	pendingBonus,
	lastClaimDate,
	lastClaimAmount,
	token,
}: Props) => {
	const t = useTranslations("bonus.dashboard");

	return (
		<>
			{/* Pending Bonus Card */}
			<Card className="border-orange-500/30 bg-gradient-to-br from-background to-orange-500/5 hover:shadow-lg hover:border-orange-500/50 transition-all duration-300 group">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
						{t("pendingBonus")}
					</CardTitle>
					<div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/15 transition-colors">
						<FontAwesomeIcon
							icon={faClock}
							fontSize={20}
							className="text-orange-500"
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-8 w-28 rounded-md" />
					) : (
						<div className="text-2xl font-semibold text-foreground">
							<span className="text-orange-500">$</span>
							<CountUp
								end={pendingBonus}
								decimals={2}
								duration={1.5}
								separator=","
							/>{" "}
							<span className="text-sm font-medium text-muted-foreground/80">
								{token}
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Last Claim Info Card */}
			<Card className="border-green-500/30 bg-gradient-to-br from-background to-green-500/5 hover:shadow-lg hover:border-green-500/50 transition-all duration-300 group">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
						{t("lastClaim")}
					</CardTitle>
					<div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/15 transition-colors">
						<FontAwesomeIcon
							icon={faCircleCheck}
							fontSize={20}
							className="text-green-500"
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<>
							<Skeleton className="h-6 w-20 rounded-md mb-1" />
							<Skeleton className="h-4 w-24 rounded-md" />
						</>
					) : (
						<>
							<div className="text-xl font-semibold text-foreground">
								<span className="text-green-500">$</span>
								<CountUp
									end={lastClaimAmount}
									decimals={2}
									duration={1.5}
									separator=","
								/>{" "}
								<span className="text-xs font-medium text-muted-foreground/80">
									{token}
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								{lastClaimDate}
							</p>
						</>
					)}
				</CardContent>
			</Card>
		</>
	);
};
