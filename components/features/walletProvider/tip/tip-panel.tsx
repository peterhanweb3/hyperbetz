"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/pro-light-svg-icons";

import { useTip } from "@/hooks/walletProvider/tip/useTip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenListModal } from "@/components/common/walletProvider/token-list-modal";
import { NetworkSelector } from "@/components/common/walletProvider/network-selector";
import { Token } from "@/types/blockchain/swap.types";
import { Label } from "@/components/ui/label";
import { TipTransactionPending } from "@/components/features/walletProvider/tip/tip-transaction-pending";
import { useTranslations } from "@/lib/locale-provider";
import { CopyWalletAddressButton } from "@/components/common/walletProvider/copy-wallet-address-button";
import { useWalletAddress } from "@/hooks/walletProvider/useWalletAddress";
import { cn } from "@/lib/utils";

export const TipPanel = ({
	isLobbyPage = false,
	isEmbeddedWallet = false,
}: {
	isLobbyPage?: boolean;
	isEmbeddedWallet?: boolean;
}) => {
	const t = useTranslations("walletProvider.tipPanel");
	const { address: walletAddress } = useWalletAddress();

	const {
		selectedToken,
		tipAmount,
		isBalanceInsufficient,
		formattedBalance,
		isApproved,
		isPending,
		transactionHash,
		minTipAmount,
		isFetchingWallet,
		selectToken,
		handleAmountChange,
		setMaxAmount,
		executeTip,
		resetPage,
		getButtonText,
		isTipDisabled,
	} = useTip();

	const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
	const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
	const [isMaxed, setIsMaxed] = useState(false);

	const dynamicFontClass = useMemo(() => {
		const length = tipAmount.length;
		if (length > 20) return "!text-sm";
		if (length > 16) return "!text-base";
		if (length > 13) return "!text-lg";
		if (length > 12) return "!text-xl";
		if (length > 8) return "!text-2xl";
		return "!text-xl md:!text-2xl";
	}, [tipAmount]);

	const handleSetMaxAmount = () => {
		if (selectedToken) {
			setMaxAmount();
			setIsMaxed(true);
		}
	};

	const handleAmountChangeWrapper = (value: string) => {
		handleAmountChange(value);
		setIsMaxed(false);
	};

	const isActionDisabled =
		isTipDisabled() || isNetworkSwitching || isFetchingWallet;

	return (
		<>
			<div className="bg-card border border-border rounded-2xl shadow-lg">
				<div className="flex items-center justify-between p-3 border-b border-border">
					<Button
						variant="ghost"
						size="icon"
						onClick={resetPage}
						aria-label={t("resetForm")}
						className="hover:bg-muted"
					>
						<RotateCcw className="h-4 w-4" />
					</Button>

					<NetworkSelector
						onSwitchingChange={setIsNetworkSwitching}
					/>
				</div>

				{isPending ? (
					<div className="p-4 pb-8 flex items-center justify-center min-h-[320px]">
						<TipTransactionPending
							transactionHash={transactionHash}
							onSendAnother={resetPage}
						/>
					</div>
				) : (
					<>
						<div className="p-4 space-y-4">
							<div className="text-left">
								<Label className="text-muted-foreground text-sm font-normal">
									{t("youTip")}
								</Label>
							</div>

							<div className="space-y-4">
								<div
									className={cn(
										"placeholder:text-muted-foreground dark:bg-input/30 flex h-full w-full rounded-md bg-transparent",
										"px-4 py-2 shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
										"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
										"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
										isBalanceInsufficient
											? "border-destructive"
											: ""
									)}
								>
									<Input
										type="text"
										inputMode="decimal"
										placeholder="0"
										value={tipAmount}
										onChange={(e) =>
											handleAmountChangeWrapper(
												e.target.value
											)
										}
										className={cn(
											"!p-0 font-light !bg-transparent !border-none !pr-2 !shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40",
											dynamicFontClass
										)}
										disabled={
											!selectedToken || isNetworkSwitching
										}
									/>

									<Button
										variant="secondary"
										onClick={() =>
											setIsTokenModalOpen(true)
										}
										className="flex items-center gap-2 !py-1 px-2 rounded-full"
										disabled={isNetworkSwitching}
									>
										{selectedToken && (
											<Image
												src={selectedToken.icon}
												alt={selectedToken.symbol}
												width={24}
												height={24}
												className="rounded-full"
											/>
										)}
										<span className="flex items-center gap-2 text-[12px] md:text-xs">
											{selectedToken?.symbol ||
												t("selectToken")}
											{selectedToken && !isApproved && (
												<FontAwesomeIcon
													icon={faLock}
													className="text-yellow-500 font-semibold"
												/>
											)}
										</span>
										{isNetworkSwitching ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<ChevronDown className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="flex items-center justify-between w-full">
									{selectedToken && minTipAmount > 0 && (
										<div className="text-left">
											<span className="text-muted-foreground text-xs">
												{t("minPrefix")}{" "}
												{minTipAmount.toFixed(2)}{" "}
												{selectedToken.symbol}
											</span>
										</div>
									)}
									<div className="flex items-center ml-auto gap-2">
										<span className="text-muted-foreground text-sm">
											{t("balance")}{" "}
											{Number(formattedBalance).toFixed(
												2
											)}
										</span>
										<Button
											variant="link"
											onClick={handleSetMaxAmount}
											disabled={!selectedToken}
											className={`text-primary hover:text-primary/80 p-0 h-auto font-medium ${
												isMaxed ? "underline" : ""
											}`}
											size="sm"
										>
											{t("max")}
										</Button>
									</div>
								</div>

								{/* {selectedToken &&
									tipAmount &&
									usdEstimate > 0 && (
										<div className="text-left">
											<span className="text-muted-foreground text-sm">
												{t("approxUsd", {
													amount: usdEstimate.toFixed(
														2
													),
												})}
											</span>
										</div>
									)} */}
							</div>

							{!isLobbyPage &&
								isEmbeddedWallet &&
								walletAddress && (
									<div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												{t("emailWalletAddress")}
											</span>
											<code className="text-sm font-mono">
												{walletAddress.slice(0, 6)}...
												{walletAddress.slice(-4)}
											</code>
										</div>
										<CopyWalletAddressButton
											address={walletAddress}
											variant="outline"
											size="sm"
											iconOnly
										/>
									</div>
								)}
						</div>

						<div className="p-4 pt-0">
							<Button
								onClick={executeTip}
								disabled={isActionDisabled}
								size="default"
								className="w-full h-11 text-base font-semibold rounded-xl"
							>
								{getButtonText()}
							</Button>
						</div>
					</>
				)}
			</div>

			<TokenListModal
				isOpen={isTokenModalOpen}
				onClose={() => setIsTokenModalOpen(false)}
				onSelectToken={(token) => {
					if (token && typeof token === "object") {
						if ("logoURI" in token && !("balance" in token)) {
							const convertedToken: Token = {
								symbol: token.symbol,
								name: token.name,
								decimals: token.decimals,
								address: token.address,
								icon: token.logoURI,
								tags:
									token.tags?.map((tag) =>
										typeof tag === "string"
											? tag
											: tag.toString()
									) || [],
								balance: "0",
								usd_price: "0",
							};
							selectToken(convertedToken);
						} else if (
							"icon" in token &&
							"balance" in token &&
							"usd_price" in token
						) {
							selectToken(token as Token);
						}
					}
					setIsTokenModalOpen(false);
				}}
			/>
		</>
	);
};
