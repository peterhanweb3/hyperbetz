"use client";

import { memo, useMemo, useState } from "react";
import { useTranslations } from "@/lib/locale-provider";
import { useTransactionModal } from "@/hooks/walletProvider/use-transaction-modal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	AnimatedTabs,
	AnimatedTabsContent,
	AnimatedTabsList,
	AnimatedTabsTrigger,
} from "@/components/ui/animated-tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
// Sidebar removed: using top header tabs in both views
import { DepositPanel } from "@/components/features/walletProvider/deposit/deposit-panel";
import { SwapPanel } from "@/components/features/walletProvider/swap/swap-panel";
import { WithdrawPanel } from "@/components/features/walletProvider/withdraw/withdraw-panel";
import { TipPanel } from "@/components/features/walletProvider/tip/tip-panel";
import { WalletInfoPanel } from "./wallet/wallet-info-panel";
import { TransactionModalTab } from "@/store/slices/ui/walletProvider/modal.slice";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

type DisplayType = "modal-view" | "tabbed-view";

interface TransactionModalProps {
	displayType?: DisplayType;
	isLobbyPage?: boolean;
}

type AllowedTab = Exclude<TransactionModalTab, "">;

// --- Tabbed View (no global modal hooks; local state only) ---
const TransactionTabbedView = memo(function TransactionTabbedView({
	isLobbyPage = false,
}: {
	isLobbyPage?: boolean;
}) {
	const t = useTranslations("walletProvider.transactionModal");
	const { primaryWallet } = useDynamicContext();
	const isEmbeddedWallet = primaryWallet?.connector?.isEmbeddedWallet;
	const [localActiveTab, setLocalActiveTab] = useState<AllowedTab>("deposit");

	const tabContent = useMemo(
		() => ({
			walletInfo: <WalletInfoPanel />,
			deposit: (
				<DepositPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
			tip: (
				<TipPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
			withdraw: (
				<WithdrawPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
			swap: (
				<SwapPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
		}),
		[isEmbeddedWallet, isLobbyPage]
	);

	return (
		<div className="w-full h-full border rounded-lg bg-background">
			<AnimatedTabs
				value={localActiveTab}
				onValueChange={(v) => setLocalActiveTab(v as AllowedTab)}
				className="w-full"
			>
				<div className="flex items-center justify-between p-4 border-b">
				<AnimatedTabsList
						className={`grid w-auto ${
							isEmbeddedWallet ? "grid-cols-5" : "grid-cols-4"
						}`}
					>
						{isEmbeddedWallet && (
							<AnimatedTabsTrigger value="walletInfo">
								{t("tabs.walletInfo")}
							</AnimatedTabsTrigger>
						)}
						<AnimatedTabsTrigger value="deposit">
							{t("tabs.deposit")}
						</AnimatedTabsTrigger>
						<AnimatedTabsTrigger value="withdraw">
							{t("tabs.withdraw")}
						</AnimatedTabsTrigger>
						<AnimatedTabsTrigger value="swap">{t("tabs.swap")}</AnimatedTabsTrigger>
						<AnimatedTabsTrigger value="tip">
							{t("tabs.tip")}
						</AnimatedTabsTrigger>
					</AnimatedTabsList>
				</div>
				<div className="p-4">
					{Object.entries(tabContent).map(([key, content]) => (
						<AnimatedTabsContent
							key={key}
							value={key}
							className="mt-0"
						>
							{content}
						</AnimatedTabsContent>
					))}
				</div>
			</AnimatedTabs>
		</div>
	);
});

// --- Modal View (keeps global modal hooks + URL sync) ---
const TransactionModalView = memo(function TransactionModalView({
	isLobbyPage = false,
}: {
	isLobbyPage?: boolean;
}) {
	const t = useTranslations("walletProvider.transactionModal");
	const { isOpen, closeModal, activeTab, setActiveTab } =
		useTransactionModal();
	const { primaryWallet } = useDynamicContext();
	const isEmbeddedWallet = primaryWallet?.connector?.isEmbeddedWallet;

	const tabContent = useMemo(
		() => ({
			walletInfo: <WalletInfoPanel onNavigate={closeModal} />,
			deposit: (
				<DepositPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
			tip: (
				<TipPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
			withdraw: (
				<WithdrawPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
			swap: (
				<SwapPanel
					isEmbeddedWallet={isEmbeddedWallet}
					isLobbyPage={isLobbyPage}
				/>
			),
		}),
		[isEmbeddedWallet, isLobbyPage, closeModal]
	);

	const handleOpenChange = (open: boolean) => {
		if (!open) closeModal();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTitle className="text-lg font-semibold sr-only">
				{t(`tabs.${activeTab as AllowedTab}`)}
			</DialogTitle>
			<DialogContent
				className="w-[1200px] max-w-[100dvw] h-[600px] p-0 gap-0 flex flex-col"
				onPointerDownOutside={(e) => {
					e.preventDefault();
					return false;
				}}
			>
				{/* Mobile: compact dropdown + underline tabs for consistency */}
				<div className="md:hidden border-b p-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="w-fit justify-between"
							>
								{activeTab === "walletInfo" && isEmbeddedWallet
									? t("mobileDropdown.emailWallet")
									: activeTab === "walletInfo"
									? t("mobileDropdown.wallet")
									: activeTab === "deposit"
									? t("mobileDropdown.deposit")
									: activeTab === "tip"
									? t("mobileDropdown.tip")
									: activeTab === "withdraw"
									? t("mobileDropdown.withdraw")
									: activeTab === "swap"
									? t("mobileDropdown.swap")
									: t("mobileDropdown.wallet")}
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-fit min-w-[200px]">
							<DropdownMenuItem
								onClick={() => setActiveTab("walletInfo")}
								className={
									activeTab === "walletInfo"
										? "bg-accent"
										: ""
								}
							>
								{isEmbeddedWallet
									? t("mobileDropdown.emailWallet")
									: t("mobileDropdown.wallet")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setActiveTab("deposit")}
								className={
									activeTab === "deposit" ? "bg-accent" : ""
								}
							>
								{t("mobileDropdown.deposit")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setActiveTab("tip")}
								className={
									activeTab === "tip" ? "bg-accent" : ""
								}
							>
								{t("mobileDropdown.tip")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setActiveTab("withdraw")}
								className={
									activeTab === "withdraw" ? "bg-accent" : ""
								}
							>
								{t("mobileDropdown.withdraw")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setActiveTab("swap")}
								className={
									activeTab === "swap" ? "bg-accent" : ""
								}
							>
								{t("mobileDropdown.swap")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Single desktop header (title + tabs) below; removed duplicate title */}

				{/* Header + Tabs (desktop) */}
				<div className="hidden md:block w-full">
					<div className="px-6 pt-6 pb-3">
						<h1 className="text-2xl font-bold text-foreground tracking-tight">
							WALLET
						</h1>
					</div>
					<div className="px-6 border-b border-border">
						<div className="flex space-x-8">
							<button
								onClick={() => setActiveTab("walletInfo")}
								className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
									activeTab === "walletInfo"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Wallet
							</button>
							<button
								onClick={() => setActiveTab("deposit")}
								className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
									activeTab === "deposit"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Deposit
							</button>
							
							<button
								onClick={() => setActiveTab("withdraw")}
								className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
									activeTab === "withdraw"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Withdraw
							</button>
							<button
								onClick={() => setActiveTab("swap")}
								className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
									activeTab === "swap"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Swap
							</button>
							<button
								onClick={() => setActiveTab("tip")}
								className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
									activeTab === "tip"
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Tip
							</button>
						</div>
					</div>
				</div>

				{/* Content Area under header */}
				<div className="w-full px-6 pt-4 pb-4 overflow-y-auto">
					<div className="w-full mx-auto max-w-[560px]">
						{tabContent[activeTab as AllowedTab]}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
});

export const TransactionModal = ({
	displayType = "modal-view",
	isLobbyPage = false,
}: TransactionModalProps) => {
	if (displayType === "tabbed-view")
		return <TransactionTabbedView isLobbyPage={isLobbyPage} />;
	return <TransactionModalView isLobbyPage={isLobbyPage} />;
};
