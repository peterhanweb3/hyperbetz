"use client";

// import { Wallet, LogOut } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Dynamic SDK and Auth Hook
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import React from "react";
import { EmailVerificationModal } from "./email-verification-modal";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftFromBracket, faWallet } from "@fortawesome/pro-light-svg-icons";
// A small helper component for displaying labeled information consistently.
const InfoRow = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<div>
		<p className="text-xs text-muted-foreground mb-1">{label}</p>
		{children}
	</div>
);

export const WalletConnect = () => {
	const { user, isLoggedIn, isWalletConnected, logout } = useDynamicAuth();
	const { setShowAuthFlow } = useDynamicContext();
	const t = useTranslations("auth.walletConnect");

	// --- EMAIL VERIFICATION MODAL ---
	// This state controls the visibility of the email verification modal.
	const [isOpen, setIsOpen] = React.useState(false);

	const handleWalletConnect = () => {
		setShowAuthFlow(true);
	};

	// --- LOGGED-IN STATE ---
	// This state renders a themed card with user information.
	if (isLoggedIn && user) {
		return (
			<Card>
				<CardContent className="p-4 space-y-4">
					{/* Top section: Avatar, Name, and Disconnect Button */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
								{/* <Wallet className="w-5 h-5 text-muted-foreground" /> */}
								<FontAwesomeIcon
									icon={faWallet}
									fontSize={20}
									className="text-muted-foreground"
								/>
							</div>
							<div>
								<p className="font-medium text-foreground">
									{user.nickname || t("player")}
								</p>
								<p className="text-sm text-muted-foreground">
									{isWalletConnected
										? t("walletConnected")
										: t("emailConnected")}
								</p>
							</div>
						</div>
						<Button
							onClick={logout}
							variant="destructive"
							size="sm"
						>
							{/* <LogOut className="w-4 h-4 md:mr-2" /> */}
							<FontAwesomeIcon
								icon={faLeftFromBracket}
								fontSize={16}
								className="md:mr-2"
							/>
							<span className="hidden md:inline">
								{t("disconnect")}
							</span>
						</Button>
					</div>

					<Separator />

					{/* Bottom section: Wallet Address and Balance */}
					<div className="space-y-3">
						{user.walletAddress && (
							<InfoRow label="Wallet Address">
								<p className="text-sm font-mono text-foreground">{`${user.walletAddress.slice(
									0,
									6
								)}...${user.walletAddress.slice(-4)}`}</p>
							</InfoRow>
						)}

						<InfoRow label="Balance">
							<p className="text-lg font-semibold text-foreground">
								${user.balance.toFixed(2)}
							</p>
						</InfoRow>
					</div>
				</CardContent>
			</Card>
		);
	}

	// --- LOGGED-OUT STATE ---
	// This state renders custom buttons for connection.
	return (
		<>
			<Button variant="outline" onClick={() => setIsOpen(true)}>
				{t("loginWithEmail")}
			</Button>
			{isOpen && (
				<EmailVerificationModal
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
				/>
			)}
			<Button
				variant="default"
				onClick={handleWalletConnect}
				className="flex items-center gap-2"
			>
				{/* <Wallet className="w-4 h-4" /> */}
				<FontAwesomeIcon icon={faWallet} fontSize={16} />
				{t("connectWalletBtn")}
			</Button>
		</>
	);
};

export default WalletConnect;
