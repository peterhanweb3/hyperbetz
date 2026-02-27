"use client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAppStore } from "@/store/store";
import { useTranslations } from "@/lib/locale-provider";
import { useBlockExplorerUrl } from "@/hooks/walletProvider/useBlockExplorerUrl";

interface TransactionPendingProps {
	transactionHash: string | null;
	timeLeft: number;
	onNewDeposit: () => void;
}

export const DepositTransactionPending = ({
	transactionHash,
	timeLeft,
	onNewDeposit,
}: TransactionPendingProps) => {
	const t = useTranslations("walletProvider.depositPending");
	// We can get the real-time status directly from the transaction slice
	const tx = useAppStore((state) =>
		state.blockchain.transaction.transactions.find(
			(t) => t.hash === transactionHash
		)
	);

	const { getTransactionUrl } = useBlockExplorerUrl();

	const isConfirmed = tx?.status === "confirmed";
	const isFailed = tx?.status === "failed";
	const showFailedMessage = isFailed || timeLeft === 0;

	const explorerTxUrl = transactionHash
		? getTransactionUrl(transactionHash)
		: null;

	return (
		<div className="text-center space-y-4">
			{showFailedMessage ? (
				<XCircle className="mx-auto h-12 w-12 text-red-500" />
			) : isConfirmed ? (
				<CheckCircle className="mx-auto h-12 w-12 text-green-500" />
			) : (
				<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
			)}

			<h4 className="font-semibold text-lg">
				{showFailedMessage
					? t("failedTitle")
					: isConfirmed
						? t("confirmedTitle")
						: t("submittedTitle")}
			</h4>

			<p className="text-sm text-muted-foreground">
				{showFailedMessage
					? t("failedDesc")
					: isConfirmed
						? t("confirmedDesc")
						: t("submittedDesc")}
			</p>

			{/* Countdown timer is only shown while pending */}
			{!isConfirmed && !showFailedMessage && (
				<p className="text-2xl font-semibold">{timeLeft}s</p>
			)}

			{explorerTxUrl && (
				<a
					href={explorerTxUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs text-primary underline break-all block"
				>
					{t("viewOnExplorer")}
				</a>
			)}

			<Button
				onClick={onNewDeposit}
				variant="link"
				size="sm"
				className="mt-4"
			>
				{showFailedMessage
					? t("newDepositFailed")
					: isConfirmed
						? t("newDepositConfirmed")
						: t("newDepositPending")}
			</Button>
		</div>
	);
};
