"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { selectNativeToken } from "@/store/selectors/blockchain/blockchain.selectors";

import {
	ArrowDownUp,
	Settings,
	Zap,
	ChevronDown,
	Loader2,
	// AlertTriangle,
	Info,
	TrendingUp,
	CircleCheck,
	RotateCcw,
} from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Token } from "@/types/blockchain/swap.types";
import useSwap from "@/hooks/walletProvider/swap/useSwapNew";
import { TokenListModal } from "@/components/common/walletProvider/token-list-modal";
import { NetworkSelector } from "@/components/common/walletProvider/network-selector";
import { CopyWalletAddressButton } from "@/components/common/walletProvider/copy-wallet-address-button";
import { useWalletAddress } from "@/hooks/walletProvider/useWalletAddress";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faExternalLinkAlt,
	faLock,
	faSpinner,
} from "@fortawesome/pro-light-svg-icons";
import { cn } from "@/lib/utils";
import { useBlockExplorerUrl } from "@/hooks/walletProvider/useBlockExplorerUrl";
import {
	formatAmount,
	formatUSD,
} from "@/lib/utils/wallet-provider/wallet-provider.utils";
import { sanitizeDecimalInput } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/store/store";
import { useTokens } from "@/hooks/walletProvider/useTokens";

// Slippage presets
const slippagePresets = ["0.1", "0.5", "1.0", "2.0"];

export const SwapPanel = memo(
	({
		isLobbyPage = false,
		isEmbeddedWallet,
	}: {
		isLobbyPage?: boolean;
		isEmbeddedWallet?: boolean;
	}) => {
		const t = useTranslations("walletProvider.swapPanel");
		const { address: walletAddress } = useWalletAddress();
		const { getTransactionUrl } = useBlockExplorerUrl();
		const [isLoadingNativeToken, setIsLoadingNativeToken] = useState(false);
		const chainId = useAppStore(
			(state) => state.blockchain.network.chainId
		);
		const nativeToken = useAppStore(selectNativeToken);
		const { isTokensLoading } = useTokens();

		// Destructure all swap hook properties
		const {
			// Token state
			fromToken,
			toToken,
			setFromToken,
			setToToken,
			switchTokens,
			setMaxAmount,
			// Amount state
			exchangeAmount,
			receivedAmount,
			handleExchangeAmountChange,
			handleReceivedAmountChange,
			resetAmounts,

			// Quote and conversion
			conversion,
			isFetching,
			getExchangeRate,
			estimatedGas,

			// Transaction state
			slippage,
			setSlippage,
			isLoading,
			isApproveLoading,
			isTokenAllowed,
			executeSwap,
			approveToken,

			// Gas and balance
			isLowBalance,
			showToolTip,
			gasReservationAmount,

			// UI state
			transactionSuccess,
			txHash,
			isPending,
			timeLeft,
			completedExchangeAmount,
			completedReceivedAmount,
			completedFromToken,
			completedToToken,
			resetSwapState,

			// Price information
			fromTokenUsdPrice,
			toTokenUsdPrice,

			// Validation
			validateSwap,

			// UI Helpers
			getSwapButtonText,
		} = useSwap();

		// Local UI state
		const [fromTokenModalOpen, setFromTokenModalOpen] = useState(false);
		const [toTokenModalOpen, setToTokenModalOpen] = useState(false);
		const [showTransactionDetails, setShowTransactionDetails] =
			useState(false);
		const [customSlippage, setCustomSlippage] = useState("1.0");
		const [isSettingsOpen, setIsSettingsOpen] = useState(false);

		// const toolTipText = t("maxButtonToolTipText", {
		// 	gasReservationAmount,
		// 	selectedTokenSymbol: fromToken?.symbol as string,
		// Confetti and toast now handled inside useSwapTransaction hook
		// after on-chain confirmation is received

		useEffect(() => {
			if (chainId) {
				if (fromToken?.address === nativeToken?.address) return;
				setFromToken(null);
				setIsLoadingNativeToken(true);
				if (!isTokensLoading) {
					if (!fromToken?.address) {
						setFromToken(nativeToken);
						setIsLoadingNativeToken(false);
					}
				}
			}
		}, [chainId, isTokensLoading, txHash]);

		const isSwapDisabled = () => {
			return (
				!fromToken ||
				!toToken ||
				(!exchangeAmount && !receivedAmount) ||
				isFetching ||
				isLoading ||
				isApproveLoading ||
				!validateSwap()
			);
		};

		const handleSwapExecution = async () => {
			if (!isTokenAllowed) {
				await approveToken();
			} else {
				await executeSwap();
			}
		};

		const dynamicExchangeFontClass = useMemo(() => {
			const textLength = exchangeAmount.length;

			if (textLength > 20) {
				return "!text-sm";
			}
			if (textLength > 16) {
				// If length is 18 or more
				// console.log("Applying text-sm for length:", textLength);
				return "!text-base";
			}
			// Smaller font for long inputs
			if (textLength > 13) {
				// If length is 17 (because >=18 would be caught above)
				// console.log("Applying text-base for length:", textLength);
				return "!text-lg";
			}
			// Medium font for moderately long inputs
			if (textLength > 12) {
				// If length is 13, 14, 15, 16
				// console.log("Applying !text-lg for length:", textLength);
				return "!text-xl";
			}
			if (textLength > 8) {
				// If length is 9, 10, 11, 12
				// console.log("Applying !text-xl for length:", textLength);
				return "!text-2xl";
			}
			return "!text-xl md:!text-2xl";
		}, [exchangeAmount]);

		const dynamicReceiveFontClass = useMemo(() => {
			const textLength = receivedAmount.length;

			if (textLength > 20) {
				return "!text-sm";
			}
			if (textLength > 16) {
				// If length is 18 or more
				// console.log("Applying text-sm for length:", textLength);
				return "!text-base";
			}
			// Smaller font for long inputs
			if (textLength > 13) {
				// If length is 17 (because >=18 would be caught above)
				// console.log("Applying text-base for length:", textLength);
				return "!text-lg";
			}
			// Medium font for moderately long inputs
			if (textLength > 12) {
				// If length is 13, 14, 15, 16
				// console.log("Applying !text-lg for length:", textLength);
				return "!text-xl";
			}
			if (textLength > 8) {
				// If length is 9, 10, 11, 12
				// console.log("Applying !text-xl for length:", textLength);
				return "!text-2xl";
			}
			return "!text-xl md:!text-2xl";
		}, [receivedAmount]);

		return (
			<div className="bg-card border border-border rounded-2xl shadow-lg">
				{/* Network Header */}
				<div className="flex items-center justify-between p-3 border-b border-border">
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								resetAmounts();
								resetSwapState();
							}}
							className="h-8 w-8 hover:bg-muted"
						>
							<RotateCcw className="h-4 w-4" />
						</Button>

						<Popover
							open={isSettingsOpen}
							onOpenChange={setIsSettingsOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 hover:bg-muted/50"
								>
									<Settings className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80" align="start">
								<div className="space-y-4">
									<div>
										<Label className="text-[11px] md:text-xs font-medium">
											{t("slippageTolerance")}
										</Label>
										<div className="flex gap-2 mt-2">
											{slippagePresets.map((preset) => (
												<Button
													key={preset}
													variant={
														slippage === preset
															? "default"
															: "outline"
													}
													size="sm"
													onClick={() =>
														setSlippage(preset)
													}
												>
													{preset}%
												</Button>
											))}
										</div>
										<div className="flex gap-2 mt-2">
											<Input
												type="number"
												placeholder={t("custom")}
												value={customSlippage}
												onChange={(e) =>
													setCustomSlippage(
														e.target.value
													)
												}
												className="flex-1"
											/>
											<Button
												size="sm"
												onClick={() =>
													setSlippage(customSlippage)
												}
											>
												{t("set")}
											</Button>
										</div>
									</div>
									<div className="text-sm text-muted-foreground">
										{t("currentSlippage")}: {slippage}%
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<NetworkSelector />
				</div>

				{/* Transaction Pending State */}
				{isPending && txHash && !transactionSuccess ? (
					<div className="p-6 space-y-4 text-center">
						{/* Pending Spinner */}
						<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />

						<h4 className="font-semibold text-lg">
							{t("transactionSubmitted")}
						</h4>

						<p className="text-sm text-muted-foreground">
							{t("waitingForConfirmation")}
						</p>

						{/* Countdown timer */}
						{timeLeft > 0 && (
							<p className="text-2xl font-semibold">
								{timeLeft}s
							</p>
						)}

						{/* Swap Details */}
						{completedFromToken && completedToToken && (
							<div className="bg-muted/30 rounded-lg p-3 border border-border/40 space-y-2 md:w-80 mx-auto">
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 flex-1">
										<div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-border/50">
											<Image
												src={completedFromToken.icon}
												alt={completedFromToken.symbol}
												width={24}
												height={24}
												className="w-6 h-6 object-cover"
											/>
										</div>
										<div className="flex flex-col min-w-0">
											<span className="text-xs text-muted-foreground">
												{completedFromToken.symbol}
											</span>
											<span className="font-semibold text-sm truncate">
												{formatAmount(
													completedExchangeAmount ||
														exchangeAmount
												)}
											</span>
										</div>
									</div>
									<div className="flex-shrink-0 rotate-90">
										<ArrowDownUp className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="flex items-center gap-2 flex-1 justify-end">
										<div className="flex flex-col items-end min-w-0">
											<span className="text-xs text-muted-foreground">
												{completedToToken.symbol}
											</span>
											<span className="font-semibold text-sm truncate">
												{formatAmount(
													completedReceivedAmount ||
														receivedAmount
												)}
											</span>
										</div>
										<div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-border/50">
											<Image
												src={completedToToken.icon}
												alt={completedToToken.symbol}
												width={24}
												height={24}
												className="w-6 h-6 object-cover"
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Explorer link */}
						{getTransactionUrl(txHash) && (
							<a
								href={getTransactionUrl(txHash) || "#"}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-primary underline break-all block"
							>
								{t("viewOnExplorer")}
							</a>
						)}

						{/* Timeout state */}
						{timeLeft === 0 && (
							<div className="space-y-2">
								<p className="text-sm text-destructive">
									{t("confirmationTimeout")}
								</p>
								<Button
									onClick={resetSwapState}
									variant="outline"
									size="sm"
								>
									{t("newSwap")}
								</Button>
							</div>
						)}
					</div>
				) : transactionSuccess && txHash ? (
					<div className="p-6 space-y-3">
						{/* Success Icon with Gradient Background */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl animate-pulse" />
							</div>
							<div className="relative flex items-center justify-center">
								<div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 shadow-lg">
									<CircleCheck className="h-10 w-10 text-white" />
								</div>
							</div>
						</div>

						{/* Success Message */}
						<div className="text-center space-y-1">
							<h3 className="text-2xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
								{t("swapSuccessful")}
							</h3>
							<p className="text-sm text-muted-foreground">
								{t("transactionConfirmed")}
							</p>
						</div>

						{/* Transaction Details Card */}
						<div className="bg-muted/30 rounded-lg p-3 border-2 border-border/40 space-y-2.5 md:w-80 mx-auto">
							{/* Compact Swap Display */}
							<div className="flex items-center justify-between gap-2">
								{/* From Token */}
								<div className="flex items-center gap-2 flex-1">
									{completedFromToken && (
										<div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-border/50">
											<Image
												src={completedFromToken.icon}
												alt={completedFromToken.symbol}
												width={28}
												height={28}
												className="w-6 h-6 object-cover"
											/>
										</div>
									)}
									<div className="flex flex-col min-w-0">
										<span className="text-xs text-muted-foreground">
											{completedFromToken?.symbol}
										</span>
										<span className="font-semibold text-sm truncate">
											{formatAmount(
												completedExchangeAmount ||
													exchangeAmount
											)}
										</span>
									</div>
								</div>

								{/* Arrow */}
								<div className="flex-shrink-0 rotate-90">
									<ArrowDownUp className="h-4 w-4 text-muted-foreground" />
								</div>

								{/* To Token */}
								<div className="flex items-center gap-2 flex-1 justify-end">
									<div className="flex flex-col items-end min-w-0">
										<span className="text-xs text-muted-foreground">
											{completedToToken?.symbol}
										</span>
										<span className="font-semibold text-sm truncate">
											{formatAmount(
												completedReceivedAmount ||
													receivedAmount
											)}
										</span>
									</div>
									{completedToToken && (
										<div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-border/50">
											<Image
												src={completedToToken.icon}
												alt={completedToToken.symbol}
												width={28}
												height={28}
												className="w-6 h-6 object-cover"
											/>
										</div>
									)}
								</div>
							</div>

							{/* Transaction Hash */}
							{getTransactionUrl(txHash) && (
								<div className="pt-2 border-t border-border/30">
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">
											{t("hash")}:
										</span>
										<a
											href={
												getTransactionUrl(txHash) || "#"
											}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-mono"
										>
											<span>
												{txHash.slice(0, 6)}...
												{txHash.slice(-4)}
											</span>
											<svg
												className="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
												/>
											</svg>
										</a>
									</div>
								</div>
							)}
						</div>

						{/* Action Buttons */}
						<div className="space-y-2 flex gap-2 w-full justify-center">
							<Button
								onClick={resetSwapState}
								className="bg-primary text-foreground font-medium shadow-lg"
							>
								{t("newSwap")}
							</Button>
							{getTransactionUrl(txHash) && (
								<Button
									variant="outline"
									onClick={() => {
										window.open(
											getTransactionUrl(txHash) || "#",
											"_blank"
										);
									}}
									className="font-medium bg-secondary/50 hover:bg-secondary/70 text-foreground"
								>
									{"Explorer "}
									<FontAwesomeIcon icon={faExternalLinkAlt} />
								</Button>
							)}
						</div>
					</div>
				) : (
					<div className="p-4 space-y-1">
						{/* You Pay Card */}
						<div className="bg-input/30 border border-border rounded-xl p-3 space-y-2.5 h-25 sm:h-auto">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{t("youPay")}
								</span>
								{fromToken && (
									<div className="text-xs text-muted-foreground flex items-center gap-1">
										<span>
											{formatAmount(fromToken.balance)}{" "}
											{fromToken.symbol}
										</span>
										<TooltipProvider>
											<Tooltip
												open={
													showToolTip
														? undefined
														: false
												}
											>
												<TooltipTrigger asChild>
													<Button
														variant="link"
														onClick={() => {
															console.log(
																"Gas reservation button clicked"
															);
															setMaxAmount();
														}}
														disabled={
															!fromToken ||
															fromToken.balance ==
																"0"
														}
														className={`text-primary hover:text-primary/80 p-0 h-auto font-medium `}
														size="sm"
													>
														{t("max")}
													</Button>
												</TooltipTrigger>
												<TooltipContent
													toolTipArrowColor="dark"
													side="right"
													sideOffset={4}
													className="w-[250px] bg-[#000000d9] dark:bg-[#000000d9] px-2 py-[6px] rounded-[6px]"
													style={{
														wordWrap: "break-word",
														boxShadow:
															"0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05)",
													}}
												>
													<p className="text-sm font-normal leading-[1.5714285714285714] text-white">
														{t(
															"maxButtonToolTipText",
															{
																gasReservationAmount,
																selectedTokenSymbol:
																	fromToken?.symbol as string,
															}
														)}
													</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>

										{isLowBalance && (
											<Badge
												variant="destructive"
												className="text-[10px]"
											>
												{t("low")}
											</Badge>
										)}
									</div>
								)}
							</div>

							<div className="flex items-center justify-between gap-3">
								<input
									type="text"
									inputMode="decimal"
									placeholder={t("amountPlaceholder")}
									value={exchangeAmount}
									onChange={(e) =>
										handleExchangeAmountChange(
											sanitizeDecimalInput(e.target.value)
										)
									}
									className={cn(
										"bg-transparent  font-semibold text-foreground placeholder:text-muted-foreground/50 border-none outline-none flex-1 min-w-0",
										dynamicExchangeFontClass,
										fromToken &&
											exchangeAmount > fromToken.balance
											? "text-destructive"
											: "" // Red text if over balance
									)}
									disabled={!fromToken}
								/>
								<Button
									variant="ghost"
									onClick={() => setFromTokenModalOpen(true)}
									disabled={isLoadingNativeToken}
									className="h-auto px-2.5 py-1.5 gap-2 bg-muted/30 hover:bg-muted/50 rounded-full"
								>
									{isLoadingNativeToken ? (
										<>
											<FontAwesomeIcon
												icon={faSpinner}
												className="h-4 w-4 animate-spin"
											/>
											<span className="text-base font-normal">
												Loading...
											</span>
										</>
									) : fromToken ? (
										<>
											<div className="w-5 h-5 rounded-full overflow-hidden">
												<Image
													src={fromToken.icon}
													alt={fromToken.symbol}
													width={20}
													height={20}
													className="w-5 h-5 rounded-full object-cover"
												/>
											</div>
											<span className="font-medium flex items-center gap-2 text-sm">
												{fromToken.symbol}
												{!isTokenAllowed && (
													<FontAwesomeIcon
														icon={faLock}
														className="text-yellow-500 font-semibold"
													/>
												)}
											</span>
											<ChevronDown className="h-3 w-3" />
										</>
									) : (
										<>
											<span className="text-[11px] py-[2px] md:text-xs font-medium">
												{t("selectToken")}
											</span>
											<ChevronDown className="h-3 w-3" />
										</>
									)}
								</Button>
							</div>

							{fromToken && exchangeAmount && (
								<div className="text-xs text-muted-foreground">
									{formatUSD(
										exchangeAmount,
										fromTokenUsdPrice
									)}
								</div>
							)}
						</div>

						{/* Swap Button with Cutout Effect */}
						<div className="flex justify-center relative -my-4 z-10">
							<div className="bg-card border-border p-1 rounded-lg">
								<Button
									variant="ghost"
									size="icon"
									onClick={switchTokens}
									className="rounded-lg bg-card/20 hover:bg-muted/40 w-8 h-8 border border-border/20"
									// disabled={!fromToken || !toToken}
								>
									<ArrowDownUp className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* You Receive Card */}
						<div className="bg-input/30 border border-border rounded-xl p-3 space-y-2.5 h-25 sm:h-auto">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{t("youReceive")}
								</span>
								{toToken && (
									<div className="text-xs text-muted-foreground">
										{formatAmount(toToken.balance)}{" "}
										{toToken.symbol}
									</div>
								)}
							</div>

							<div className="flex items-center justify-between gap-3">
								<input
									type="text"
									inputMode="decimal"
									placeholder={t("amountPlaceholder")}
									value={receivedAmount}
									onChange={(e) =>
										handleReceivedAmountChange(
											sanitizeDecimalInput(e.target.value)
										)
									}
									className={cn(
										"bg-transparent  font-semibold text-foreground placeholder:text-muted-foreground/50 border-none outline-none flex-1 min-w-0",
										dynamicReceiveFontClass
									)}
									disabled={!toToken}
								/>
								<Button
									variant="ghost"
									onClick={() => setToTokenModalOpen(true)}
									className="h-auto px-3 py-1.5 gap-2 bg-muted/30 hover:bg-muted/50 rounded-full"
								>
									{toToken ? (
										<>
											<div className="w-5 h-5 rounded-full overflow-hidden">
												<Image
													src={toToken.icon}
													alt={toToken.symbol}
													width={20}
													height={20}
													className="w-5 h-5 rounded-full object-cover"
												/>
											</div>
											<span className="font-medium flex items-center gap-2 text-sm">
												{toToken.symbol}
											</span>
											<ChevronDown className="h-3 w-3" />
										</>
									) : (
										<>
											<span className="text-[11px] py-[2px] md:text-xs font-medium">
												{t("selectToken")}
											</span>
											<ChevronDown className="h-3 w-3" />
										</>
									)}
								</Button>
							</div>

							{toToken && receivedAmount && (
								<div className="text-xs text-muted-foreground">
									{formatUSD(receivedAmount, toTokenUsdPrice)}
								</div>
							)}
						</div>

						{/* Quote Loading */}
						{isFetching && (
							<div className="flex items-center justify-center gap-2 py-4">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm text-muted-foreground">
									{t("gettingBestQuote")}
								</span>
							</div>
						)}

						{/* Conversion Details */}
						{conversion && !isFetching && fromToken && toToken && (
							<div className="mt-4">
								<Collapsible
									open={showTransactionDetails}
									onOpenChange={setShowTransactionDetails}
								>
									<div className="bg-muted/10 rounded-lg border border-border/30">
										<CollapsibleTrigger asChild>
											<div className="p-3 cursor-pointer hover:bg-card/20 transition-colors rounded-lg">
												<div className="flex items-center justify-between">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<TrendingUp className="h-4 w-4 text-primary" />
															<span className="text-[11px] md:text-xs font-medium">
																1{" "}
																{
																	fromToken.symbol
																}{" "}
																={" "}
																{getExchangeRate().toFixed(
																	6
																)}{" "}
																{toToken.symbol}
															</span>
														</div>
														<div className="flex items-center gap-2 text-xs text-muted-foreground">
															<Zap className="h-3 w-3" />
															<span>
																{t("gas")}:{" "}
																{parseFloat(
																	estimatedGas
																) < 0.01
																	? "< $0.01"
																	: `$${parseFloat(
																			estimatedGas
																		).toFixed(
																			2
																		)}`}
															</span>
														</div>
													</div>
													<ChevronDown className="h-4 w-4 transition-transform duration-200" />
												</div>
											</div>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<div className="px-3 pb-3">
												<Separator className="mb-3" />
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															{t(
																"minimumReceived"
															)}
														</span>
														<span>
															{formatAmount(
																receivedAmount
															)}{" "}
															{toToken.symbol}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															{t(
																"slippageToleranceLabel"
															)}
														</span>
														<span>{slippage}%</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">
															{t("gasFee")}
														</span>
														<span>
															{parseFloat(
																estimatedGas
															) < 0.01
																? "< $0.01"
																: `$${parseFloat(
																		estimatedGas
																	).toFixed(
																		2
																	)}`}
														</span>
													</div>
												</div>
											</div>
										</CollapsibleContent>
									</div>
								</Collapsible>
							</div>
						)}

						{/* Warnings */}
						{/* {isLowBalance && showToolTip && (
							<Alert className="border-destructive/20 bg-destructive/10 mt-4">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription className="text-sm">
									{toolTipMessage}
								</AlertDescription>
							</Alert>
						)} */}

						{/* Price Impact Warning */}
						{conversion && fromToken && toToken && (
							<div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
								<Info className="h-3 w-3" />
								<span>{t("priceWarning")}</span>
							</div>
						)}

						{/* Wallet Address Copy Section */}
						{!isLobbyPage && isEmbeddedWallet && walletAddress && (
							<div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border mt-4">
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{isEmbeddedWallet
											? t("emailWalletAddress")
											: t("walletAddress")}
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

						{/* Main Action Button */}
						<div className="pt-4">
							{!fromToken || !toToken ? (
								<Button
									onClick={() => {
										if (!fromToken) {
											setFromTokenModalOpen(true);
										} else {
											setToTokenModalOpen(true);
										}
									}}
									size="lg"
									className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
									variant="default"
								>
									{t("selectToken")}
								</Button>
							) : (
								<Button
									onClick={handleSwapExecution}
									disabled={isSwapDisabled()}
									size="lg"
									className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 disabled:opacity-50"
								>
									{isLoading || isApproveLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : null}
									{getSwapButtonText()}
								</Button>
							)}
						</div>
					</div>
				)}

				{/* Token Selection Modals */}
				<TokenListModal
					isOpen={fromTokenModalOpen}
					onClose={() => setFromTokenModalOpen(false)}
					// isTokenAllowed={isTokenAllowed}
					showAllTokens
					onSelectToken={(token) => {
						setFromToken(token as Token);
						setFromTokenModalOpen(false);
					}}
				/>

				<TokenListModal
					isOpen={toTokenModalOpen}
					onClose={() => setToTokenModalOpen(false)}
					// isTokenAllowed={isTokenAllowed}
					showAllTokens
					onSelectToken={(token) => {
						setToToken(token as Token);
						setToTokenModalOpen(false);
					}}
				/>
			</div>
		);
	}
);

SwapPanel.displayName = "SwapPanel";
