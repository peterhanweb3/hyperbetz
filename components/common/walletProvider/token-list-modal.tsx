"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Token } from "@/types/blockchain/swap.types";
import { Button } from "@/components/ui/button";
// import { ArrowLeft, RefreshCw } from "lucide-react";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { SearchTokenResult } from "@/types/walletProvider/transaction-service.types";
import Image from "next/image";
import { useTokenActions } from "@/hooks/walletProvider/useTokenActions";
import { useTokens } from "@/hooks/walletProvider/useTokens";
import { useTokenSearch } from "@/hooks/walletProvider/useTokenSearch";
import { NetworkSelector } from "./network-selector";
import { SearchResultRow, TokenRow } from "./token-list-rows";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faRefresh } from "@fortawesome/pro-light-svg-icons";

interface TokenListModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectToken: (token: Token | SearchTokenResult) => void;
	showAllTokens?: boolean; // New optional prop
	hideTopSection?: boolean;
	// enableNetworkLogoIcon?: boolean;
	// isTokenAllowed: boolean;
}

export const TokenListModal = ({
	isOpen,
	onClose,
	onSelectToken,
	showAllTokens = false, // Set default value to false
	hideTopSection = false,
}: // enableNetworkLogoIcon=false,
// isTokenAllowed,
TokenListModalProps) => {
	const t = useTranslations("walletProvider.tokenList");
	const { tokens, isTokensLoading, refreshTokens } = useTokens();
	const { user } = useDynamicAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const { searchResults, isSearching } = useTokenSearch(searchQuery);
	const { addTokenToMetamask } = useTokenActions();
	const [isRefreshedDisabled, setIsRefreshedDisabled] = useState(false);

	// Reset search query on close
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
		}
	}, [isOpen]);

	const handleRefreshTokens = async () => {
		setIsRefreshedDisabled(true);
		refreshTokens();
		setTimeout(() => {
			setIsRefreshedDisabled(false);
		}, 10000);
	};

	const { ownedTokens, otherTokens } = useMemo(() => {
		const lowerCaseQuery = searchQuery.toLowerCase();

		// If there's a search query, filter all tokens regardless of the showAllTokens prop
		if (searchQuery) {
			const filtered = tokens.filter(
				(t) =>
					t.name.toLowerCase().includes(lowerCaseQuery) ||
					t.symbol.toLowerCase().includes(lowerCaseQuery) ||
					t.address.toLowerCase().includes(lowerCaseQuery)
			);

			const owned = filtered.filter((t) => parseFloat(t.balance) > 0);
			const other = filtered.filter((t) => parseFloat(t.balance) <= 0);

			// Sort OWNED tokens by their balance in DESCENDING order.
			owned.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

			// Sort OTHER tokens alphabetically by their symbol.
			other.sort((a, b) => a.symbol.localeCompare(b.symbol));

			return { ownedTokens: owned, otherTokens: other };
		}
		// console.log({ showAllTokens });
		// If showAllTokens is true and there's no search query, show all tokens
		if (showAllTokens) {
			const owned = tokens.filter((t) => parseFloat(t.balance) > 0);
			const other = tokens.filter((t) => parseFloat(t.balance) <= 0);

			// short by balance x usd_price
			owned.sort((a, b) => {
				const aValue = parseFloat(a.balance) * parseFloat(a.usd_price);
				const bValue = parseFloat(b.balance) * parseFloat(b.usd_price);
				return bValue - aValue;
			});

			other.sort((a, b) => a.symbol.localeCompare(b.symbol));

			return { ownedTokens: owned, otherTokens: other };
		}

		const owned = tokens.filter((t) => parseFloat(t.balance) > 0.000001);
		// IF DEPOSIT
		if (!hideTopSection) {
			// remove usd_price = unavailable
			owned.sort((a, b) => {
				if (a.usd_price == "Unavailable") return 1;
				if (b.usd_price == "Unavailable") return -1;
				return 0;
			});
			// Sort by balance * usd_price
			owned.sort((a, b) => {
				const aValue = parseFloat(a.balance) * parseFloat(a.usd_price);
				const bValue = parseFloat(b.balance) * parseFloat(b.usd_price);
				return bValue - aValue;
			});
		} else {
			// Sort by balance.
			owned.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
		}

		return { ownedTokens: owned, otherTokens: [] };
	}, [tokens, searchQuery, showAllTokens]);

	const instantDepositTokens = useMemo(() => {
		return (
			(user?.balanceToken
				?.map((bt) =>
					tokens.find(
						(t) =>
							t.address.toLowerCase() ==
							bt.tokenContractAddress.toLowerCase()
					)
				)
				.filter(Boolean) as Token[]) || []
		);
	}, [user, tokens]);

	const handleShortcutClick = (token: Token | undefined) => {
		if (token) onSelectToken(token);
	};

	const isLoading = isTokensLoading || isSearching;
	const showSearchResults = searchQuery && searchResults.length > 0;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogTitle className="sr-only">{t("dialogTitle")}</DialogTitle>
			<DialogContent className="min-w-[30dvw] p-0 gap-0 flex flex-col h-[80vh]">
				<Command>
					<div className="flex items-center p-4 border-b">
						<Button variant="ghost" size="icon" onClick={onClose}>
							<FontAwesomeIcon icon={faArrowLeft} fontSize={16} />
						</Button>
						<NetworkSelector className="mx-auto" />
					</div>

					{!hideTopSection && (
						<div className="p-4 space-y-4">
							<div className="space-y-2">
								<p className="text-sm font-semibold">
									{t("instantDeposit")}
								</p>
								<div className="flex gap-2">
									{instantDepositTokens.map((token) => (
										<Button
											key={token.symbol}
											variant="secondary"
											onClick={() =>
												handleShortcutClick(token)
											}
											className="rounded-full"
										>
											<Image
												src={token.icon}
												alt={token.symbol}
												width={25}
												height={25}
											/>
											{token.symbol}
										</Button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold">
										{t("yourWalletBalance")}
									</p>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={handleRefreshTokens}
										disabled={isRefreshedDisabled}
									>
										<FontAwesomeIcon
											icon={faRefresh}
											fontSize={16}
											className={` ${
												isTokensLoading
													? "animate-spin"
													: ""
											}`}
										/>
									</Button>
								</div>
								<CommandInput
									placeholder={t("searchPlaceholder")}
									value={searchQuery}
									onValueChange={setSearchQuery}
								/>
							</div>
						</div>
					)}

					<CommandList
						className={`flex-grow ${
							hideTopSection ? "mt-4" : ""
						} px-2 max-h-full`}
					>
						{!isLoading &&
							!showSearchResults &&
							ownedTokens.length === 0 && (
								<CommandEmpty>
									{searchQuery
										? t("emptySearch")
										: t("emptyOwned")}
								</CommandEmpty>
							)}

						{isLoading ? (
							<div className="space-y-2 p-2">
								{[...Array(10)].map((_, i) => (
									<div
										key={i}
										className="flex items-center justify-between p-2 rounded-md animate-pulse bg-secondary/10 h-16"
									>
										<div className="flex items-center gap-3">
											<Skeleton className="w-8 h-8 rounded-full" />
											<div className="space-y-1">
												<Skeleton className="w-20 h-4 rounded-md" />
												<Skeleton className="w-12 h-3 rounded-md" />
											</div>
										</div>
										<Skeleton className="w-16 h-4 rounded-md" />
									</div>
								))}
							</div>
						) : showSearchResults ? (
							<CommandGroup heading={t("searchResults")}>
								{searchResults.map((token) => (
									<SearchResultRow
										key={token.address}
										onAddToWallet={addTokenToMetamask}
										token={token}
										// enableNetworkLogoIcon={
										// 	enableNetworkLogoIcon
										// }
										onSelect={onSelectToken}
									/>
								))}
							</CommandGroup>
						) : (
							<>
								{ownedTokens.length > 0 && (
									<CommandGroup
										heading={
											searchQuery || showAllTokens
												? t("yourTokens")
												: ""
										}
									>
										{ownedTokens.map((token) => (
											<TokenRow
												key={token.address}
												token={token}
												hideTopSection={hideTopSection}
												onSelect={onSelectToken}
												onAddToWallet={
													addTokenToMetamask
												}
												// enableNetworkLogoIcon={
												// 	enableNetworkLogoIcon
												// }
												isTokenOwned={true}
											/>
										))}
									</CommandGroup>
								)}
								{/* Show other tokens when searching OR when showAllTokens is true */}
								{(searchQuery || showAllTokens) &&
									otherTokens.length > 0 && (
										<CommandGroup
											heading={t("otherResults")}
										>
											{otherTokens.map((token) => (
												<TokenRow
													key={token.address}
													token={token}
													onSelect={onSelectToken}
													onAddToWallet={
														addTokenToMetamask
													}
													// enableNetworkLogoIcon={
													// 	enableNetworkLogoIcon
													// }
													isTokenOwned={false}
												/>
											))}
										</CommandGroup>
									)}
							</>
						)}
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
};
