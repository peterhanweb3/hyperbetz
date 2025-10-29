import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import { Token } from "@/types/blockchain/swap.types";
import { SearchTokenResult } from "@/types/walletProvider/transaction-service.types";
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
// import { PlusCircle } from "lucide-react";

// --- Helper Functions ---
const truncateAddress = (address: string) =>
	`${address.slice(0, 6)}...${address.slice(-4)}`;
// const FallbackIcon = () => <div className="w-10 h-10 rounded-full bg-muted" />;

// --- TokenRow for Owned Tokens ---
interface TokenRowProps {
	hideTopSection?: boolean;
	token: Token;
	onSelect: (token: Token) => void;
	onAddToWallet: (token: Token) => void;
	isTokenOwned?: boolean; // Optional prop to indicate if the token is owned
}

export const TokenRow = ({
	hideTopSection = false,
	token,
	onSelect,
	onAddToWallet,
	isTokenOwned,
}: TokenRowProps) => {
	const balance = parseFloat(token.balance);
	const usdPrice = parseFloat(token.usd_price);
	const fiatValue =
		isNaN(balance) || isNaN(usdPrice) ? 0 : balance * usdPrice;
	return (
		<CommandItem
			value={`${token.name} ${token.symbol} ${token.address}`}
			onSelect={() => onSelect(token)}
			className="!p-3 w-full !rounded-xl"
		>
			<div className="flex justify-between items-center gap-4 w-full">
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
				<div className="flex-grow">
					<p className="font-semibold">{token.name}</p>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<p className={"text-muted-foreground"}>
							<span
								className={`${
									isTokenOwned
										? "text-blue-500"
										: "text-muted-foreground"
								}`}
							>
								{balance.toFixed(6)}
							</span>{" "}
							{token.symbol}{" "}
						</p>
						<span className="text-muted-foreground/70">
							{token.address.slice(0, 4)}...
							{token.address.slice(-4)}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4"
							onClick={(e) => {
								e.stopPropagation();
								onAddToWallet(token);
							}}
						>
							{/* <PlusCircle className="h-3 w-3 hover:text-primary" /> */}
							<FontAwesomeIcon
								icon={faPlusCircle}
								fontSize={16}
								className="hover:text-primary"
							/>
						</Button>
					</div>
				</div>
				<div className="text-right">
					{!hideTopSection ? (
						<p className={`font-semibold text-lg`}>
							${fiatValue.toFixed(4)}
						</p>
					) : (
						<p className={"text-muted-foreground"}>
							<span
								className={`${
									isTokenOwned
										? "text-blue-500"
										: "text-muted-foreground"
								}`}
							>
								{balance.toFixed(6)}
							</span>{" "}
							{token.symbol}{" "}
						</p>
					)}
				</div>
			</div>
		</CommandItem>
	);
};

interface SearchResultRowProps {
	token: SearchTokenResult;
	// Clicking the row will now directly select the token for the deposit/withdraw form.
	onSelect: (token: SearchTokenResult) => void;
}

export const SearchResultRow = ({ token, onSelect }: SearchResultRowProps) => {
	return (
		<CommandItem
			value={`${token.name} ${token.symbol} ${token.address}`}
			onSelect={() => onSelect(token)} // The entire row is now the selection trigger
			className="!p-3"
		>
			<div className="flex items-center gap-4 w-full">
				{token.logoURI && (
					<Image
						src={token.logoURI}
						alt={token.name}
						width={40}
						height={40}
						className="rounded-full"
						unoptimized
					/>
				)}
				<div className="flex-grow">
					<p className="font-semibold">
						{token.name} ({token.symbol})
					</p>
					<p className="text-xs text-muted-foreground">
						{truncateAddress(token.address)}
					</p>
				</div>
				{/* The "Import" button has been completely removed. */}
			</div>
		</CommandItem>
	);
};
