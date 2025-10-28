"use client";

import React from "react";
import CountUp from "react-countup";
// import { TrendingUp } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp } from "@fortawesome/pro-light-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/locale-provider";

interface Props {
	isLoading: boolean;
	totalBonus: number | undefined;
	token: string;
	context?: "affiliate" | "bonus";
}

export const TotalReferralIncome = ({
	isLoading,
	totalBonus = 0,
	token,
	context = "affiliate",
}: Props) => {
	const t = useTranslations(`${context}.dashboard`);
	return (
		<Card className="border-primary/70 bg-gradient-to-br from-background to-muted/15 hover:shadow-lg hover:border-primary/30 hover:bg-gradient-to-br hover:from-background hover:to-muted/25 transition-all duration-300 group">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
					{t("totalIncome")}
				</CardTitle>
				<div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
					<FontAwesomeIcon
						icon={faArrowTrendUp}
						className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors"
					/>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-8 w-28 rounded-md" />
				) : (
					<div className="text-2xl font-semibold text-foreground">
						<span className="text-primary">$</span>
						<CountUp
							end={totalBonus}
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
	);
};
