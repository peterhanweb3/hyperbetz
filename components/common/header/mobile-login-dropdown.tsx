import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { faUser, faWallet } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function MobileLoginDropdown({
	setEmailModalOpen,
	setShowAuthFlow,
	type,
}: {
	setEmailModalOpen: (open: boolean) => void;
	setShowAuthFlow: (show: boolean) => void;
	type: "top" | "bottom";
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{type == "top" ? (
					<Button
						variant="outline"
						className="min-[800px]:hidden text-sm"
					>
						Login/Sign Up
					</Button>
				) : (
					<button
						className={cn(
							"relative flex flex-col items-center justify-center",
							"min-w-0 flex-1 py-2 px-2",
							"transition-all duration-300 ease-out",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
							"active:scale-95 w-full"
						)}
						style={{
							borderRadius: "var(--radius-lg)",
						}}
						aria-label="Login or Sign Up"
					>
						{/* Hover background */}
						<div
							className="absolute inset-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200"
							style={{
								background: `oklch(from var(--muted) l c h / 0.5)`,
							}}
						/>

						{/* Icon container */}
						<div
							className={cn(
								"relative flex items-center justify-center mb-1",
								"transition-all duration-300 ease-out",
								"scale-100 hover:scale-105"
							)}
						>
							<FontAwesomeIcon
								icon={faUser}
								className="w-6 h-6"
								style={{
									fontSize: "24px",
									color: "var(--muted-foreground)",
									filter: "none",
								}}
							/>
						</div>

						{/* Label */}
						<span
							className={cn(
								"relative text-xs font-medium leading-tight",
								"truncate max-w-full transition-colors duration-300"
							)}
							style={{
								fontSize: "12px",
								color: "var(--muted-foreground)",
								textShadow: "none",
							}}
						>
							Profile
						</span>

						{/* Ripple effect overlay */}
						<div className="absolute inset-0 rounded-lg overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 transition-opacity duration-200 hover:opacity-100" />
						</div>
					</button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end">
				<DropdownMenuLabel>Choose Login Method</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => setEmailModalOpen(true)}
					className="flex items-center gap-2 py-3"
				>
					{/* <User className="h-4 w-4" /> */}
					<FontAwesomeIcon icon={faUser} fontSize={20} />
					<div className="flex flex-col">
						<span className="font-medium">Login with Email</span>
						<span className="text-xs text-muted-foreground">
							Quick email verification
						</span>
					</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<div className="p-2">
					<div className="text-xs text-muted-foreground mb-2 px-2">
						Or connect your wallet:
					</div>
					<Button
						variant="default"
						onClick={() => setShowAuthFlow(true)}
						className="w-full flex items-center gap-2"
						size="sm"
					>
						{/* <Wallet className="w-4 h-4" /> */}
						<FontAwesomeIcon icon={faWallet} fontSize={22} />
						Connect Wallet
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
