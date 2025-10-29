"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { useBlockExplorerUrl } from "@/hooks/walletProvider/useBlockExplorerUrl";

interface WithdrawTransactionPendingProps {
	transactionHash: string | null;
	timeLeft: number;
	isSuccessful: boolean;
	onNewWithdrawal: () => void;
	setShowingConfetti: (value: boolean) => void;
}

export const WithdrawTransactionPending = ({
	transactionHash,
	timeLeft,
	isSuccessful,
	onNewWithdrawal,
	setShowingConfetti,
}: WithdrawTransactionPendingProps) => {
	const t = useTranslations("walletProvider.withdrawPending");
	const { getTransactionUrl } = useBlockExplorerUrl();
	const hasTriggeredConfetti = useRef(false);

	// This useEffect faithfully triggers the confetti effect on success.
	useEffect(() => {
		if (isSuccessful && !hasTriggeredConfetti.current) {
			hasTriggeredConfetti.current = true;
			setShowingConfetti(true);
			const defaults = {
				spread: 360,
				ticks: 70,
				gravity: 0,
				decay: 0.94,
				startVelocity: 30,
			};
			confetti({
				...defaults,
				particleCount: 50,
				scalar: 1.2,
				shapes: ["star"],
			});
			setTimeout(
				() =>
					confetti({
						...defaults,
						particleCount: 70,
						scalar: 2,
						shapes: ["circle"],
					}),
				200
			);

			// setShowingConfetti(false);
			setTimeout(() => setShowingConfetti(false), 500);
		}

		// Reset the ref when component unmounts or when isSuccessful becomes false
		if (!isSuccessful) {
			hasTriggeredConfetti.current = false;
		}
	}, [isSuccessful, setShowingConfetti]);

	return (
		<div className="text-center space-y-4 py-8">
			{isSuccessful ? (
				<CheckCircle className="mx-auto h-12 w-12 text-green-500" />
			) : (
				<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
			)}
			<h4 className="font-semibold text-lg">
				{isSuccessful ? t("confirmedTitle") : t("submittedTitle")}
			</h4>
			<p className="text-sm text-muted-foreground">
				{isSuccessful ? t("confirmedDesc") : t("submittedDesc")}
			</p>
			{!isSuccessful && transactionHash !== "manual_approval_pending" && (
				<p className="text-2xl font-semibold">{timeLeft}s</p>
			)}
			{transactionHash &&
				transactionHash !== "manual_approval_pending" &&
				getTransactionUrl(transactionHash) && (
					<a
						href={getTransactionUrl(transactionHash) || "#"}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-primary underline break-all block"
					>
						{t("viewOnExplorer")}
					</a>
				)}
			{transactionHash === "manual_approval_pending" && (
				<p className="text-xs text-muted-foreground">
					{t("manualApproval")}
				</p>
			)}
			<Button
				onClick={onNewWithdrawal}
				variant="link"
				size="sm"
				className="mt-4"
			>
				{isSuccessful
					? t("newWithdrawalConfirmed")
					: t("newWithdrawalPending")}
			</Button>
		</div>
	);
};
