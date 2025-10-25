// // "use client";
// // import Image from "next/image";
// // import { useDeposit } from "@/hooks/walletProvider/deposit/useDeposit";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { ChevronDown, Loader2, RotateCcw } from "lucide-react";
// // import { useState } from "react";
// // import { TokenListModal } from "@/components/common/walletProvider/token-list-modal";
// // import { NetworkSelector } from "@/components/common/walletProvider/network-selector";
// // import { Token } from "@/types/blockchain/swap.types";
// // import { Label } from "@/components/ui/label";
// // import { DepositTransactionPending } from "./deposit-transactions-pending";
// // import { useTranslations } from "@/lib/locale-provider";
// // import { CopyWalletAddressButton } from "@/components/common/walletProvider/copy-wallet-address-button";
// // import { useWalletAddress } from "@/hooks/walletProvider/useWalletAddress";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faLock } from "@fortawesome/pro-light-svg-icons";
// // import { cn } from "@/lib/utils";

// // export const DepositPanel = ({
// // 	isLobbyPage = false,
// // 	isEmbeddedWallet = false,
// // }: {
// // 	isLobbyPage?: boolean;
// // 	isEmbeddedWallet?: boolean;
// // }) => {
// // 	const t = useTranslations("walletProvider.depositPanel");
// // 	const { address: walletAddress } = useWalletAddress();

// // 	// --- 1. Connect to the Master Logic Hook ---
// // 	// We now destructure ALL the necessary state for the UI.
// // 	const {
// // 		selectedToken,
// // 		depositAmount,
// // 		isPending,
// // 		transactionHash,
// // 		timeLeft,
// // 		isApproved,

// // 		handleAmountChange,
// // 		selectToken,
// // 		setMaxAmount,
// // 		executeDeposit,
// // 		getButtonText,
// // 		isDepositDisabled,
// // 		resetPage,
// // 		// --- NEWLY ADDED STATE FOR UI ---
// // 		formattedBalance,
// // 		usdtConversionAmount,
// // 		minRequiredAmount,
// // 		isFetchingConversion, // To show a loading state for USD value
// // 	} = useDeposit();

// // 	const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

// // 	// --- NEW: Local state to track network switching ---
// // 	const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
// // 	const [isMaxed, setIsMaxed] = useState(false);

// // 	const handleSetMaxAmount = () => {
// // 		if (selectedToken) {
// // 			setMaxAmount();
// // 			setIsMaxed(true);
// // 		}
// // 	};
// // 	const handleAmountChangeWrapper = (value: string) => {
// // 		handleAmountChange(value);
// // 		setIsMaxed(false); // Reset if user changes amount manually
// // 	};

// // 	return (
// // 		<>
// // 			{/* Main container with dark background and rounded corners matching the image */}
// // 			<div className="bg-card border border-border rounded-2xl shadow-lg">
// // 				{/* --- HEADER --- */}
// // 				<div className="flex items-center justify-between p-4 border-b border-border">
// // 					<Button
// // 						variant="ghost"
// // 						size="icon"
// // 						onClick={resetPage}
// // 						aria-label={t("resetForm")}
// // 						className="hover:bg-muted"
// // 					>
// // 						<RotateCcw className="h-4 w-4" />
// // 					</Button>

// // 					<NetworkSelector
// // 						onSwitchingChange={setIsNetworkSwitching}
// // 					/>
// // 				</div>

// // 				{/* --- CONDITIONAL CONTENT --- */}
// // 				{isPending ? (
// // 					/* Show transaction pending component */
// // 					<div className="p-6 pb-12 flex items-center justify-center min-h-[400px]">
// // 						<DepositTransactionPending
// // 							transactionHash={transactionHash}
// // 							timeLeft={timeLeft}
// // 							onNewDeposit={resetPage}
// // 						/>
// // 					</div>
// // 				) : (
// // 					<>
// // 						{/* --- MAIN CONTENT --- */}
// // 						<div className="p-6 space-y-6">
// // 							{/* "You Pay" Label */}
// // 							<div className="text-left">
// // 								<Label className="text-muted-foreground text-sm font-normal">
// // 									{t("youPay")}
// // 								</Label>
// // 							</div>

// // 							{/* Amount Input with Token Selector - Main Section */}
// // 							<div className="space-y-4">
// // 								{/* Large Amount Input with Token Selector Overlay */}
// // 								<div
// // 									className={cn(
// // 										"placeholder:text-muted-foreground dark:bg-input/30 flex h-full w-full rounded-md bg-transparent",
// // 										"px-5 py-2.5 text-base shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
// // 										"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
// // 										"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
// // 									)}
// // 								>
// // 									<Input
// // 										type="text"
// // 										inputMode="decimal"
// // 										placeholder="0"
// // 										value={depositAmount}
// // 										onChange={(e) =>
// // 											handleAmountChangeWrapper(
// // 												e.target.value
// // 											)
// // 										}
// // 										className="!p-0 text-xl md:text-2xl font-light !bg-transparent !border-none !pr-2 !shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
// // 										disabled={!selectedToken}
// // 									/>

// // 									{/* Token Selector - Positioned absolutely on the right */}
// // 									<Button
// // 										variant="secondary"
// // 										onClick={() =>
// // 											setIsTokenModalOpen(true)
// // 										}
// // 										className="flex items-center gap-2 !py-1 px-2 rounded-full"
// // 										disabled={isNetworkSwitching}
// // 									>
// // 										{selectedToken && (
// // 											<Image
// // 												src={selectedToken.icon}
// // 												alt={selectedToken.symbol}
// // 												width={24}
// // 												height={24}
// // 												className="rounded-full"
// // 											/>
// // 										)}
// // 										<span className="font-semibold flex items-center gap-2 text-[11px] md:text-xs">
// // 											{selectedToken?.symbol ||
// // 												t("selectToken")}

// // 											{!isApproved && (
// // 												<FontAwesomeIcon
// // 													icon={faLock}
// // 													className="text-yellow-500 font-semibold"
// // 												/>
// // 											)}
// // 										</span>
// // 										{/* Conditionally render the spinner ONLY on this button */}
// // 										{isNetworkSwitching ? (
// // 											<Loader2 className="h-4 w-4 animate-spin" />
// // 										) : (
// // 											<ChevronDown className="h-4 w-4" />
// // 										)}
// // 									</Button>
// // 								</div>

// // 								{/* Balance and Max Button */}

// // 								<div className="flex items-center justify-between w-full">
// // 									{/* Minimum amount indicator */}
// // 									{selectedToken && (
// // 										<div className="text-left">
// // 											<span className="text-muted-foreground text-xs">
// // 												{t("minPrefix")}{" "}
// // 												{minRequiredAmount.toFixed(2)}{" "}
// // 												{selectedToken.symbol}
// // 											</span>
// // 										</div>
// // 									)}
// // 									<div className="flex items-center ml-auto gap-2">
// // 										<span className="text-muted-foreground text-sm">
// // 											{t("balance")}{" "}
// // 											{Number(formattedBalance).toFixed(
// // 												2
// // 											)}
// // 										</span>
// // 										<Button
// // 											variant="link"
// // 											onClick={handleSetMaxAmount}
// // 											disabled={!selectedToken}
// // 											className={`text-primary hover:text-primary/80 p-0 h-auto font-medium ${
// // 												isMaxed ? "underline" : ""
// // 											}`}
// // 											size="sm"
// // 										>
// // 											{t("max")}
// // 										</Button>
// // 									</div>
// // 								</div>

// // 								{/* USD Conversion */}
// // 								{selectedToken && depositAmount && (
// // 									<div className="text-left">
// // 										<span className="text-muted-foreground text-sm">
// // 											{isFetchingConversion ? (
// // 												<span className="animate-pulse">
// // 													{t("calculating")}{" "}
// // 												</span>
// // 											) : (
// // 												`Deposit $${usdtConversionAmount.toFixed(
// // 													2
// // 												)} USD`
// // 											)}
// // 										</span>
// // 									</div>
// // 								)}
// // 							</div>

// // 							{/* Wallet Address Copy Section */}
// // 							{!isLobbyPage &&
// // 								isEmbeddedWallet &&
// // 								walletAddress && (
// // 									<div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
// // 										<div className="flex items-center gap-2">
// // 											<span className="text-sm text-muted-foreground">
// // 												{isEmbeddedWallet
// // 													? t("emailWalletAddress")
// // 													: t("walletAddress")}
// // 											</span>
// // 											<code className="text-sm font-mono">
// // 												{walletAddress.slice(0, 6)}...
// // 												{walletAddress.slice(-4)}
// // 											</code>
// // 										</div>
// // 										<CopyWalletAddressButton
// // 											address={walletAddress}
// // 											variant="outline"
// // 											size="sm"
// // 											iconOnly
// // 										/>
// // 									</div>
// // 								)}
// // 						</div>

// // 						{/* --- FOOTER --- */}
// // 						<div className="p-6 pt-0">
// // 							<Button
// // 								onClick={executeDeposit}
// // 								disabled={
// // 									isDepositDisabled() || isNetworkSwitching
// // 								}
// // 								size="lg"
// // 								className="w-full h-12 text-lg font-semibold rounded-xl"
// // 							>
// // 								{getButtonText()}
// // 							</Button>
// // 						</div>
// // 					</>
// // 				)}
// // 			</div>

// // 			{/* The separate, full-screen token list modal */}
// // 			<TokenListModal
// // 				isOpen={isTokenModalOpen}
// // 				onClose={() => setIsTokenModalOpen(false)}
// // 				// isTokenAllowed={isApproved}
// // 				onSelectToken={(token) => {
// // 					// Handle both Token and SearchTokenResult types
// // 					if (token && typeof token === "object") {
// // 						// Check if it's a SearchTokenResult (from search)
// // 						if ("logoURI" in token && !("balance" in token)) {
// // 							// Convert SearchTokenResult to Token format
// // 							const convertedToken: Token = {
// // 								symbol: token.symbol,
// // 								name: token.name,
// // 								decimals: token.decimals,
// // 								address: token.address,
// // 								icon: token.logoURI, // Convert logoURI to icon
// // 								tags:
// // 									token.tags?.map((tag) =>
// // 										typeof tag === "string"
// // 											? tag
// // 											: tag.toString()
// // 									) || [],
// // 								balance: "0", // Default balance for search results
// // 								usd_price: "0", // Default price for search results
// // 							};
// // 							selectToken(convertedToken);
// // 						} else if (
// // 							"icon" in token &&
// // 							"balance" in token &&
// // 							"usd_price" in token
// // 						) {
// // 							// It's already a Token object
// // 							selectToken(token as Token);
// // 						}
// // 					}
// // 					setIsTokenModalOpen(false);
// // 				}}
// // 			/>
// // 		</>
// // 	);
// // };

// "use client";
// import Image from "next/image";
// import { useDeposit } from "@/hooks/walletProvider/deposit/useDeposit";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ChevronDown, Loader2, RotateCcw } from "lucide-react";
// import { useState } from "react";
// import { TokenListModal } from "@/components/common/walletProvider/token-list-modal";
// import { NetworkSelector } from "@/components/common/walletProvider/network-selector";
// import { Token } from "@/types/blockchain/swap.types";
// import { Label } from "@/components/ui/label";
// import { DepositTransactionPending } from "./deposit-transactions-pending";
// import { useTranslations } from "@/lib/locale-provider";
// import { CopyWalletAddressButton } from "@/components/common/walletProvider/copy-wallet-address-button";
// import { useWalletAddress } from "@/hooks/walletProvider/useWalletAddress";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faLock } from "@fortawesome/pro-light-svg-icons";
// import { cn } from "@/lib/utils";

// export const DepositPanel = ({
// 	isLobbyPage = false,
// 	isEmbeddedWallet = false,
// }: {
// 	isLobbyPage?: boolean;
// 	isEmbeddedWallet?: boolean;
// }) => {
// 	const t = useTranslations("walletProvider.depositPanel");
// 	const { address: walletAddress } = useWalletAddress();

// 	// --- 1. Connect to the Master Logic Hook ---
// 	// We now destructure ALL the necessary state for the UI.
// 	const {
// 		selectedToken,
// 		depositAmount,
// 		isPending,
// 		transactionHash,
// 		timeLeft,
// 		isApproved,

// 		handleAmountChange,
// 		selectToken,
// 		setMaxAmount,
// 		executeDeposit,
// 		getButtonText,
// 		isDepositDisabled,
// 		resetPage,
// 		// --- NEWLY ADDED STATE FOR UI ---
// 		formattedBalance,
// 		usdtConversionAmount,
// 		minRequiredAmount,
// 		isFetchingConversion, // To show a loading state for USD value
// 	} = useDeposit();

// 	const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

// 	// --- NEW: Local state to track network switching ---
// 	const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
// 	const [isMaxed, setIsMaxed] = useState(false);
// 	const [wordCount, setWordCount] = useState(0);

// 	// --- NEW: Word count and dynamic font size logic ---
// 	const countWords = (text: string): number => {
// 		if (!text || text.trim() === '') return 0;
// 		return text.trim().split(/\s+/).length;
// 	};

// 	const getDynamicFontClass = (count: number): string => {
// 		if (count >= 20) return 'text-[9px]';
// 		if (count >= 18) return 'text-[12px]';
// 		return 'text-xl md:text-2xl'; // Default size
// 	};

// 	const handleSetMaxAmount = () => {
// 		if (selectedToken) {
// 			setMaxAmount();
// 			setIsMaxed(true);
// 		}
// 	};
// 	const handleAmountChangeWrapper = (value: string) => {
// 		handleAmountChange(value);
// 		setIsMaxed(false); // Reset if user changes amount manually
// 		const words = countWords(value);
// 		setWordCount(words);
// 	};

// 	return (
// 		<>
// 			{/* Main container with dark background and rounded corners matching the image */}
// 			<div className="bg-card border border-border rounded-2xl shadow-lg">
// 				{/* --- HEADER --- */}
// 				<div className="flex items-center justify-between p-4 border-b border-border">
// 					<Button
// 						variant="ghost"
// 						size="icon"
// 						onClick={resetPage}
// 						aria-label={t("resetForm")}
// 						className="hover:bg-muted"
// 					>
// 						<RotateCcw className="h-4 w-4" />
// 					</Button>

// 					<NetworkSelector
// 						onSwitchingChange={setIsNetworkSwitching}
// 					/>
// 				</div>

// 				{/* --- CONDITIONAL CONTENT --- */}
// 				{isPending ? (
// 					/* Show transaction pending component */
// 					<div className="p-6 pb-12 flex items-center justify-center min-h-[400px]">
// 						<DepositTransactionPending
// 							transactionHash={transactionHash}
// 							timeLeft={timeLeft}
// 							onNewDeposit={resetPage}
// 						/>
// 					</div>
// 				) : (
// 					<>
// 						{/* --- MAIN CONTENT --- */}
// 						<div className="p-6 space-y-6">
// 							{/* "You Pay" Label */}
// 							<div className="text-left">
// 								<Label className="text-muted-foreground text-sm font-normal">
// 									{t("youPay")}
// 								</Label>
// 							</div>

// 							{/* Amount Input with Token Selector - Main Section */}
// 							<div className="space-y-4">
// 								{/* Large Amount Input with Token Selector Overlay */}
// 								<div
// 									className={cn(
// 										"placeholder:text-muted-foreground dark:bg-input/30 flex h-full w-full rounded-md bg-transparent",
// 										"px-5 py-2.5 text-base shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
// 										"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
// 										"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
// 									)}
// 								>
// 									<Input
// 										type="text"
// 										inputMode="decimal"
// 										placeholder="0"
// 										value={depositAmount}
// 										onChange={(e) =>
// 											handleAmountChangeWrapper(
// 												e.target.value
// 											)
// 										}
// 										className={cn(
// 											"!p-0 font-light !bg-transparent !border-none !pr-2 !shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40",
// 											getDynamicFontClass(wordCount)
// 										)}
// 										disabled={!selectedToken}
// 									/>

// 									{/* Token Selector - Positioned absolutely on the right */}
// 									<Button
// 										variant="secondary"
// 										onClick={() =>
// 											setIsTokenModalOpen(true)
// 										}
// 										className="flex items-center gap-2 !py-1 px-2 rounded-full"
// 										disabled={isNetworkSwitching}
// 									>
// 										{selectedToken && (
// 											<Image
// 												src={selectedToken.icon}
// 												alt={selectedToken.symbol}
// 												width={24}
// 												height={24}
// 												className="rounded-full"
// 											/>
// 										)}
// 										<span className="font-semibold flex items-center gap-2 text-[11px] md:text-xs">
// 											{selectedToken?.symbol ||
// 												t("selectToken")}

// 											{!isApproved && (
// 												<FontAwesomeIcon
// 													icon={faLock}
// 													className="text-yellow-500 font-semibold"
// 												/>
// 											)}
// 										</span>
// 										{/* Conditionally render the spinner ONLY on this button */}
// 										{isNetworkSwitching ? (
// 											<Loader2 className="h-4 w-4 animate-spin" />
// 										) : (
// 											<ChevronDown className="h-4 w-4" />
// 										)}
// 									</Button>
// 								</div>

// 								{/* Balance and Max Button */}

// 								<div className="flex items-center justify-between w-full">
// 									{/* Minimum amount indicator */}
// 									{selectedToken && (
// 										<div className="text-left">
// 											<span className="text-muted-foreground text-xs">
// 												{t("minPrefix")}{" "}
// 												{minRequiredAmount.toFixed(2)}{" "}
// 												{selectedToken.symbol}
// 											</span>
// 										</div>
// 									)}
// 									<div className="flex items-center ml-auto gap-2">
// 										<span className="text-muted-foreground text-sm">
// 											{t("balance")}{" "}
// 											{Number(formattedBalance).toFixed(
// 												2
// 											)}
// 										</span>
// 										<Button
// 											variant="link"
// 											onClick={handleSetMaxAmount}
// 											disabled={!selectedToken}
// 											className={`text-primary hover:text-primary/80 p-0 h-auto font-medium ${
// 												isMaxed ? "underline" : ""
// 											}`}
// 											size="sm"
// 										>
// 											{t("max")}
// 										</Button>
// 									</div>
// 								</div>

// 								{/* USD Conversion */}
// 								{selectedToken && depositAmount && (
// 									<div className="text-left">
// 										<span className="text-muted-foreground text-sm">
// 											{isFetchingConversion ? (
// 												<span className="animate-pulse">
// 													{t("calculating")}{" "}
// 												</span>
// 											) : (
// 												`Deposit $${usdtConversionAmount.toFixed(
// 													2
// 												)} USD`
// 											)}
// 										</span>
// 									</div>
// 								)}
// 							</div>

// 							{/* Wallet Address Copy Section */}
// 							{!isLobbyPage &&
// 								isEmbeddedWallet &&
// 								walletAddress && (
// 									<div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
// 										<div className="flex items-center gap-2">
// 											<span className="text-sm text-muted-foreground">
// 												{isEmbeddedWallet
// 													? t("emailWalletAddress")
// 													: t("walletAddress")}
// 											</span>
// 											<code className="text-sm font-mono">
// 												{walletAddress.slice(0, 6)}...
// 												{walletAddress.slice(-4)}
// 											</code>
// 										</div>
// 										<CopyWalletAddressButton
// 											address={walletAddress}
// 											variant="outline"
// 											size="sm"
// 											iconOnly
// 										/>
// 									</div>
// 								)}
// 						</div>

// 						{/* --- FOOTER --- */}
// 						<div className="p-6 pt-0">
// 							<Button
// 								onClick={executeDeposit}
// 								disabled={
// 									isDepositDisabled() || isNetworkSwitching
// 								}
// 								size="lg"
// 								className="w-full h-12 text-lg font-semibold rounded-xl"
// 							>
// 								{getButtonText()}
// 							</Button>
// 						</div>
// 					</>
// 				)}
// 			</div>

// 			{/* The separate, full-screen token list modal */}
// 			<TokenListModal
// 				isOpen={isTokenModalOpen}
// 				onClose={() => setIsTokenModalOpen(false)}
// 				// isTokenAllowed={isApproved}
// 				onSelectToken={(token) => {
// 					// Handle both Token and SearchTokenResult types
// 					if (token && typeof token === "object") {
// 						// Check if it's a SearchTokenResult (from search)
// 						if ("logoURI" in token && !("balance" in token)) {
// 							// Convert SearchTokenResult to Token format
// 							const convertedToken: Token = {
// 								symbol: token.symbol,
// 								name: token.name,
// 								decimals: token.decimals,
// 								address: token.address,
// 								icon: token.logoURI, // Convert logoURI to icon
// 								tags:
// 									token.tags?.map((tag) =>
// 										typeof tag === "string"
// 											? tag
// 											: tag.toString()
// 									) || [],
// 								balance: "0", // Default balance for search results
// 								usd_price: "0", // Default price for search results
// 							};
// 							selectToken(convertedToken);
// 						} else if (
// 							"icon" in token &&
// 							"balance" in token &&
// 							"usd_price" in token
// 						) {
// 							// It's already a Token object
// 							selectToken(token as Token);
// 						}
// 					}
// 					setIsTokenModalOpen(false);
// 				}}
// 			/>
// 		</>
// 	);
// };

"use client";
import Image from "next/image";
import { useDeposit } from "@/hooks/walletProvider/deposit/useDeposit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { TokenListModal } from "@/components/common/walletProvider/token-list-modal";
import { NetworkSelector } from "@/components/common/walletProvider/network-selector";
import { Token } from "@/types/blockchain/swap.types";
import { Label } from "@/components/ui/label";
import { DepositTransactionPending } from "./deposit-transactions-pending";
import { useTranslations } from "@/lib/locale-provider";
import { CopyWalletAddressButton } from "@/components/common/walletProvider/copy-wallet-address-button";
import { useWalletAddress } from "@/hooks/walletProvider/useWalletAddress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/pro-light-svg-icons";
import { cn } from "@/lib/utils";

export const DepositPanel = ({
	isLobbyPage = false,
	isEmbeddedWallet = false,
}: {
	isLobbyPage?: boolean;
	isEmbeddedWallet?: boolean;
}) => {
	const t = useTranslations("walletProvider.depositPanel");
	const { address: walletAddress } = useWalletAddress();

	// --- 1. Connect to the Master Logic Hook ---
	// We now destructure ALL the necessary state for the UI.
	const {
		selectedToken,
		depositAmount,
		isPending,
		transactionHash,
		timeLeft,
		isApproved,

		handleAmountChange,
		selectToken,
		setMaxAmount,
		executeDeposit,
		getButtonText,
		isDepositDisabled,
		resetPage,
		// --- NEWLY ADDED STATE FOR UI ---
		formattedBalance,
		usdtConversionAmount,
		minRequiredAmount,
		isFetchingConversion, // To show a loading state for USD value
		isFetchingMinDepositAmount,
	} = useDeposit();

	const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
	const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
	const [isMaxed, setIsMaxed] = useState(false);

	// Dynamic font size based on character length (not words since this is numeric input)
	const dynamicFontClass = useMemo(() => {
		const textLength = depositAmount.length;

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
	}, [depositAmount]);

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

	return (
		<>
			{/* Main container with dark background and rounded corners matching the image */}
			<div className="bg-card border border-border rounded-2xl shadow-lg">
				{/* --- HEADER --- */}
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

				{/* --- CONDITIONAL CONTENT --- */}
				{isPending ? (
					/* Show transaction pending component */
					<div className="p-4 pb-8 flex items-center justify-center min-h-[320px]">
						<DepositTransactionPending
							transactionHash={transactionHash}
							timeLeft={timeLeft}
							onNewDeposit={resetPage}
						/>
					</div>
				) : (
					<>
						{/* --- MAIN CONTENT --- */}
						<div className="p-4 space-y-4">
							{/* "You Pay" Label */}
							<div className="text-left">
								<Label className="text-muted-foreground text-sm font-normal">
									{t("youPay")}
								</Label>
							</div>

							{/* Amount Input with Token Selector - Main Section */}
							<div className="space-y-4">
								{/* Large Amount Input with Token Selector Overlay */}
								<div
									className={cn(
										"placeholder:text-muted-foreground dark:bg-input/30 flex h-full w-full rounded-md bg-transparent",
										"px-4 py-2 shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
										"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
										"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
									)}
								>
									<Input
										type="text"
										inputMode="decimal"
										placeholder="0"
										value={depositAmount}
										onChange={(e) =>
											handleAmountChangeWrapper(
												e.target.value
											)
										}
										className={cn(
											"!p-0 font-light !bg-transparent !border-none !pr-2 !shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40",
											dynamicFontClass
										)}
										disabled={!selectedToken}
									/>

									{/* Token Selector - Positioned absolutely on the right */}
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
											{!isApproved && (
												<FontAwesomeIcon
													icon={faLock}
													className="text-yellow-500 font-semibold"
												/>
											)}
										</span>
										{/* Conditionally render the spinner ONLY on this button */}
										{isNetworkSwitching ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<ChevronDown className="h-4 w-4" />
										)}
									</Button>
								</div>

								{/* Balance and Max Button */}
								<div className="flex items-center justify-between w-full">
									{/* Minimum amount indicator */}
									{selectedToken && (
										<div className="text-left">
											<span className="text-muted-foreground text-xs">
												{isFetchingMinDepositAmount ? (
													<span className="animate-pulse">
														Calculating...
													</span>
												) : (
													<>
														{t("minPrefix")}{" "}
														{minRequiredAmount}{" "}
														{selectedToken.symbol}
													</>
												)}
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

								{/* USD Conversion */}
								{selectedToken && depositAmount && (
									<div className="text-left">
										<span className="text-muted-foreground text-sm">
											{isFetchingConversion ? (
												<span className="animate-pulse">
													{t("calculating")}{" "}
												</span>
											) : (
												`Deposit $${usdtConversionAmount.toFixed(
													2
												)} USD`
											)}
										</span>
									</div>
								)}
							</div>

							{/* Wallet Address Copy Section */}
							{!isLobbyPage &&
								isEmbeddedWallet &&
								walletAddress && (
									<div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
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
						</div>

						{/* --- FOOTER --- */}
						<div className="p-4 pt-0">
							<Button
								onClick={executeDeposit}
								disabled={
									isDepositDisabled() || isNetworkSwitching
								}
								size="default"
								className="w-full h-11 text-base font-semibold rounded-xl"
							>
								{getButtonText()}
							</Button>
						</div>
					</>
				)}
			</div>

			{/* The separate, full-screen token list modal */}
			<TokenListModal
				isOpen={isTokenModalOpen}
				onClose={() => setIsTokenModalOpen(false)}
				// isTokenAllowed={isApproved}
				onSelectToken={(token) => {
					// Handle both Token and SearchTokenResult types
					if (token && typeof token === "object") {
						// Check if it's a SearchTokenResult (from search)
						if ("logoURI" in token && !("balance" in token)) {
							// Convert SearchTokenResult to Token format
							const convertedToken: Token = {
								symbol: token.symbol,
								name: token.name,
								decimals: token.decimals,
								address: token.address,
								icon: token.logoURI, // Convert logoURI to icon
								tags:
									token.tags?.map((tag) =>
										typeof tag === "string"
											? tag
											: tag.toString()
									) || [],
								balance: "0", // Default balance for search results
								usd_price: "0", // Default price for search results
							};
							selectToken(convertedToken);
						} else if (
							"icon" in token &&
							"balance" in token &&
							"usd_price" in token
						) {
							// It's already a Token object
							selectToken(token as Token);
						}
					}
					setIsTokenModalOpen(false);
				}}
			/>
		</>
	);
};
