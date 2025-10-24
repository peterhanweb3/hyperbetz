"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/store";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useTranslations } from "@/lib/locale-provider";

interface TipTransactionPendingProps {
	transactionHash: string | null;
	timeLeft?: number;
	onSendAnother: () => void;
}

export const TipTransactionPending = ({
	transactionHash,
	timeLeft = 0,
	onSendAnother,
}: TipTransactionPendingProps) => {
	const t = useTranslations("walletProvider.tipPending");
	const tx = useAppStore((state) =>
		state.blockchain.transaction.transactions.find(
			(tItem) => tItem.hash === transactionHash
		)
	);

	const { primaryWallet } = useDynamicContext();
	const [blockExplorerUrl, setBlockExplorerUrl] = useState<string | null>(
		null
	);
	const isConfirmed = tx?.status === "confirmed";

	useEffect(() => {
		primaryWallet?.connector
			.getBlockExplorerUrlsForCurrentNetwork()
			.then((urls) => {
				if (urls && urls.length > 0) {
					setBlockExplorerUrl(urls[0]);
				}
			});
	}, [primaryWallet]);

	return (
		<div className="text-center space-y-4">
			{isConfirmed ? (
				<CheckCircle className="mx-auto h-12 w-12 text-green-500" />
			) : (
				<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
			)}

			<h4 className="font-semibold text-lg">
				{isConfirmed ? t("confirmedTitle") : t("submittedTitle")}
			</h4>
			<p className="text-sm text-muted-foreground">
				{isConfirmed ? t("confirmedDesc") : t("submittedDesc")}
			</p>

			{!isConfirmed && timeLeft > 0 && (
				<p className="text-2xl font-semibold">{timeLeft}s</p>
			)}

			{transactionHash && blockExplorerUrl && (
				<a
					href={`${blockExplorerUrl}/tx/${transactionHash}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs text-primary underline break-all block"
				>
					{t("viewOnExplorer")}
				</a>
			)}

			<Button
				onClick={onSendAnother}
				variant="link"
				size="sm"
				className="mt-4"
			>
				{isConfirmed ? t("newTipConfirmed") : t("newTipPending")}
			</Button>
		</div>
	);
};
