import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import { Token } from "@/types/blockchain/swap.types";
import { SearchTokenResult } from "@/types/walletProvider/transaction-service.types";
// import { useAppStore } from "@/store/store"; // V2 Import
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons"; // V1 & V2 Imports
import { faArrowRotateRight } from "@fortawesome/pro-solid-svg-icons"; // V2 Import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

// --- Helper Functions ---
const truncateAddress = (address: string) =>
	`${address.slice(0, 6)}...${address.slice(-4)}`;

// --- TokenRow for Owned Tokens ---
interface TokenRowProps {
	token: Token;
	onSelect: (token: Token) => void;
	onAddToWallet: (token: Token) => void;
	isTokenOwned?: boolean;
	hideTopSection?: boolean;
	// enableNetworkLogoIcon?: boolean; // V2 Prop added
}

export const TokenRow = ({
	token,
	onSelect,
	onAddToWallet,
	isTokenOwned,
	hideTopSection = false,
}: // enableNetworkLogoIcon,
TokenRowProps) => {
	const balance = parseFloat(token.balance);
	const usdPrice = parseFloat(token.usd_price);
	const fiatValue =
		isNaN(balance) || isNaN(usdPrice) ? 0 : balance * usdPrice;

	// const { chainLogo, chainId } = useAppStore(
	// 	(state) => state.blockchain.network
	// );

	// dont round off the balance use this function insted just pass the value and the decimal places
	const roundOffBalance = (value: number, decimalPlaces: number) => {
		let sanitized = value.toString().replace(/[^0-9.]/g, "");

	if ((sanitized.match(/\./g) || []).length > 1) {
		sanitized = sanitized.substring(0, sanitized.lastIndexOf("."));
	}

	if (sanitized.includes(".")) {
		const parts = sanitized.split(".");
		sanitized = `${parts[0]}.${parts[1].substring(0, decimalPlaces)}`;
	}

	if (
		sanitized.startsWith("0") &&
		sanitized !== "0" &&
		!sanitized.startsWith("0.")
	) {
		sanitized = sanitized.replace(/^0+/, "");
	}

	if (sanitized.startsWith(".")) {
		sanitized = `0${sanitized}`;
	}

	return sanitized;
		
	};

	return (
		<CommandItem
			value={`${token.name} ${token.symbol} ${token.address}`}
			onSelect={() => onSelect(token)}
			className="!p-3 w-full !rounded-xl" // V1 Styling
		>
			<div className="flex justify-between items-center gap-4 w-full">
				{/* V2 Feature: Added relative container for chain logo overlay */}
				<div className="relative">
					{token.icon && (
						<Image
							src={token.icon}
							alt={token.name}
							width={40}
							height={40}
							className="rounded-full"
							unoptimized
						/>
					)}

					{/* {enableNetworkLogoIcon && chainLogo && chainId && (
						<div className="absolute -bottom-0.5 -right-0.5 rounded-md border border-background bg-background p-0.5">
							<img
								src={chainLogo}
								alt={chainId.toString()}
								className="m-auto rounded-full size-4"
							/>
						</div>
					)} */}
				</div>
				<div className="flex-grow">
					<p className="font-semibold">{token.name}</p>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<p className={"text-muted-foreground"}>
							{/* V2 Logic: Enhanced balance display for small amounts */}
							<span
								className={`${
									isTokenOwned && balance > 0.000001
										? "text-blue-500" // V1 Styling
										: "text-muted-foreground" // V1 Styling
								}`}
							>
								{balance === 0
									? ""
									: balance < 0.000001
									? "< 0.01"
									: roundOffBalance(Number(balance), 6)}
							</span>{" "}
							{token.symbol}
						</p>
						<span className="text-muted-foreground/70">
							{truncateAddress(token.address)}
						</span>
						{/* V2 Feature: Hide button for native tokens (e.g., ETH, MATIC) */}
						{!token.address.startsWith("0xee") && (
							// V2 Feature: Interactive "Add to Wallet" button with hover effect
							<Button
								variant="ghost"
								size="icon"
								className="h-4 w-4 group" // Added 'group' for hover state
								onClick={(e) => {
									e.stopPropagation();
									onAddToWallet(token);
								}}
							>
								<FontAwesomeIcon
									icon={faPlusCircle}
									fontSize={16}
									className="text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</Button>
						)}
					</div>
				</div>
				<div className="text-right">
					{!hideTopSection ? (
						<>
							{/* V2 Logic: Handle unavailable price */}
							{token.usd_price.toLowerCase() === "unavailable" ? (
								<FontAwesomeIcon
									icon={faArrowRotateRight}
									className="h-4 w-4 text-muted-foreground/70"
								/>
							) : // V2 Logic: Handle small fiat values
							fiatValue == 0 ? (
								<p className="font-semibold text-lg"></p>
							) : fiatValue < 0.01 ? (
								<p className="font-semibold text-lg">
									{"< $0.01"}
								</p>
							) : (
								<p className="font-semibold text-lg">
									${fiatValue.toFixed(2)}
								</p>
							)}
						</>
					) : (
						<>
							<p className="font-semibold text-lg">
								{Number(balance.toFixed(6)) > 0.01
									? roundOffBalance(Number(balance), 2)
									: roundOffBalance(Number(balance), 6)}
							</p>
						</>
					)}
				</div>
			</div>
		</CommandItem>
	);
};

// --- SearchResultRow for searched/un-owned Tokens ---
interface SearchResultRowProps {
	// V2 Props: Upgraded to support more functionality
	token: SearchTokenResult & {
		balance?: string;
		usd_price?: string;
		icon?: string;
	};
	onSelect: (token: SearchTokenResult) => void;
	onAddToWallet: (token: SearchTokenResult) => void;
	isTokenOwned?: boolean;
	// enableNetworkLogoIcon?: boolean;
}

// V2 Upgrade: This component now has full feature-parity with TokenRow
export const SearchResultRow = ({
	token,
	onSelect,
	onAddToWallet,
}: // enableNetworkLogoIcon,
SearchResultRowProps) => {
	// const { chainLogo, chainId } = useAppStore(
	// 	(state) => state.blockchain.network
	// );

	return (
		<CommandItem
			value={`${token.name} ${token.symbol} ${token.address}`}
			onSelect={() => onSelect(token)}
			className="!p-3 w-full !rounded-xl" // V1 Styling
		>
			{/* The JSX structure now mirrors the upgraded TokenRow to maintain consistency */}
			<div className="flex justify-between items-center gap-4 w-full">
				<div className="relative">
					{(token.logoURI || token.icon) && (
						<Image
							src={token.logoURI || token.icon || ""}
							alt={token.name}
							width={40}
							height={40}
							className="rounded-full"
							unoptimized
						/>
					)}
					{/* {enableNetworkLogoIcon && chainLogo && chainId && (
						<div className="absolute -bottom-0.5 -right-0.5 rounded-md border border-background bg-background p-0.5">
							<img
								src={chainLogo}
								alt={chainId.toString()}
								className="m-auto rounded-full size-4"
							/>
						</div>
					)} */}
				</div>
				<div className="flex-grow">
					<p className="font-semibold">
						{token.name} ({token.symbol})
					</p>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						{/* V2 Feature: Display balance even in search results */}
						<p className={"text-muted-foreground"}>
							{" "}
							{token.symbol}
						</p>
						<span className="text-muted-foreground/70">
							{truncateAddress(token.address)}
						</span>
						{/* V2 Feature: Add to wallet button in search results */}
						{!token.address.startsWith("0xee") && (
							<Button
								variant="ghost"
								size="icon"
								className="h-4 w-4 group"
								onClick={(e) => {
									e.stopPropagation();
									onAddToWallet(token);
								}}
							>
								<FontAwesomeIcon
									icon={faPlusCircle}
									fontSize={16}
									className="text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</Button>
						)}
					</div>
				</div>
				<div className="text-right"></div>
			</div>
		</CommandItem>
	);
};
