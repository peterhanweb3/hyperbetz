"use client";
import CountUp from "react-countup";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faSpinner } from "@fortawesome/pro-light-svg-icons";
import useCountdownTimer from "@/hooks/useCountdownTimer"; // Import the timer hook

interface Props {
	token: string;
	isLoading: boolean;
	isClaiming: boolean;
	unclaimedAmount: number | undefined;
	onClaim: () => void;
	isClaimDisabled: boolean;
	context?: "affiliate" | "bonus";
}

export const ClaimBonus = ({
	isLoading,
	isClaiming,
	unclaimedAmount = 0,
	onClaim,
	token,
	isClaimDisabled = false,
	context = "affiliate",
}: Props) => {
	const t = useTranslations(`${context}.dashboard`);
	const timeLeft = useCountdownTimer(); // Add timer hook

	return (
		<Card className="h-fit border-primary/70 bg-gradient-to-br from-background to-muted/15 hover:shadow-lg hover:border-primary/30 hover:bg-gradient-to-br hover:from-background hover:to-muted/25 transition-all duration-300 group">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
					{t("unclaimedEarnings")}
				</CardTitle>
				<div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
					<FontAwesomeIcon
						icon={faGift}
						fontSize={20}
						className="text-primary group-hover:text-primary/90 transition-colors"
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between gap-4">
					{isLoading ? (
						<Skeleton className="h-8 w-28 rounded-md" />
					) : (
						<div className="text-2xl font-semibold text-foreground">
							<span className="text-primary">$</span>
							<CountUp
								end={unclaimedAmount}
								decimals={2}
								duration={1.5}
								separator=","
							/>{" "}
							<span className="text-sm font-medium text-muted-foreground/80">
								{token}
							</span>
						</div>
					)}
					<Button
						onClick={onClaim}
						disabled={isClaimDisabled || isLoading}
						className="px-6 hover:scale-[1.02] transition-transform duration-200"
						size="sm"
					>
						{isClaiming ? (
							<>
								<FontAwesomeIcon
									icon={faSpinner}
									fontSize={20}
									className="mr-2 animate-spin"
								/>
								{t("claiming")}
							</>
						) : (
							<>
								<FontAwesomeIcon
									icon={faGift}
									fontSize={16}
									className="mr-2"
								/>
								{t("claimButtonTitle")}
							</>
						)}
					</Button>
				</div>

				{/* Timer Section */}
				{context === "bonus" && (
					<div className="pt-3 sm:pt-4 border-t border-border/50 mt-4">
						<div className="text-xs font-medium text-muted-foreground/70 mb-1 tracking-wide">
							Next Unlock:
						</div>
						<div className="text-xl sm:text-2xl font-mono font-bold text-foreground tabular-nums tracking-wider">
							{timeLeft}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
