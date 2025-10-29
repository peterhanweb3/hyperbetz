"use client";

import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Copy,
	Wallet,
	LogOut,
	Trophy,
	Activity,
	Shield,
	Users,
	Link2,
	TrendingUp,
	Clock,
	MapPin,
	Phone,
	Mail,
	ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/lib/locale-provider";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

export function ProfilePage() {
	const { user, isLoading, logout, accountStatus } = useDynamicAuth();
	const [copiedAddress, setCopiedAddress] = useState(false);
	const [copiedReferral, setCopiedReferral] = useState(false);
	const t = useTranslations("profile");
	const router = useRouter();

	const handleCopyAddress = async () => {
		if (user?.walletAddress) {
			try {
				await navigator.clipboard.writeText(user.walletAddress);
				setCopiedAddress(true);
				toast.success(t("copySuccess"));
				setTimeout(() => setCopiedAddress(false), 2000);
			} catch {
				toast.error(t("copyFailed"));
			}
		}
	};

	const handleCopyReferral = async () => {
		if (user?.referralId) {
			try {
				const referralLink = `${window.location.origin}/?ref=${user.referralId}`;
				await navigator.clipboard.writeText(referralLink);
				setCopiedReferral(true);
				toast.success("Referral link copied!");
				setTimeout(() => setCopiedReferral(false), 2000);
			} catch {
				toast.error("Failed to copy referral link");
			}
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (isLoading) {
		// The loading skeleton matching the new 3-column grid layout
		return (
			<div>
				<div className="space-y-6">
					<div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{/* Profile card skeleton */}
						<Card className="relative overflow-hidden border-0 shadow-lg">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
							<div className="absolute bottom-0 left-0 w-24 h-24  bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl" />

							<CardContent className="relative p-6">
								<div className="flex flex-col items-center gap-4">
									<div className="relative">
										<div className="h-20 w-20 bg-muted rounded-full animate-pulse" />
										<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-muted rounded-full animate-pulse" />
									</div>
									<div className="text-center space-y-2">
										<div className="h-6 w-48 bg-muted rounded animate-pulse" />
										<div className="h-4 w-32 bg-muted rounded animate-pulse" />
										<div className="h-4 w-64 bg-muted rounded animate-pulse" />
									</div>
								</div>
								<div className="mt-4 p-3 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl border border-primary/10">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
											<div className="space-y-2">
												<div className="h-3 w-24 bg-muted rounded animate-pulse" />
												<div className="h-5 w-40 bg-muted rounded animate-pulse" />
											</div>
										</div>
										<div className="h-8 w-8 bg-muted rounded animate-pulse" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Multiple card skeletons for the grid */}
						{[...Array(5)].map((_, i) => (
							<Card key={i}>
								<CardHeader>
									<div className="h-6 w-32 bg-muted rounded animate-pulse" />
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="h-20 bg-muted rounded-lg animate-pulse" />
									<div className="space-y-2">
										<div className="h-12 bg-muted rounded-lg animate-pulse" />
										<div className="h-12 bg-muted rounded-lg animate-pulse" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
					<div className="text-center space-y-2">
						<h1 className="text-2xl font-semibold text-muted-foreground">
							{t("loggedOutTitle")}
						</h1>
						<p className="text-muted-foreground">
							{t("loggedOutSubtitle")}
						</p>
					</div>
					<div className="flex items-center">
						<Button
							variant="default"
							onClick={() => (window.location.href = "/")}
							className="bg-primary mr-2"
						>
							{t("goHome")}
						</Button>
						<DynamicWidget />
					</div>
				</div>
			</div>
		);
	}
	return (
		<div>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-semibold">{t("myProfile")}</h1>
					<Button
						onClick={logout}
						variant="outline"
						size="sm"
						className="gap-2"
					>
						<LogOut className="h-4 w-4" />
						{t("logout")}
					</Button>
				</div>

				{/* Changed grid layout to be responsive and fill the page */}
				<div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
					{/* Profile Info Card */}
					<Card className="relative overflow-hidden border-0 shadow-lg md:col-span-2 xl:col-span-1">
						{/* ... (rest of the Profile Info Card JSX is identical) */}
						<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
						<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl" />
						<CardContent className="relative">
							<div className="flex items-start gap-6">
								<div className="relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75"></div>
									<Avatar className="relative h-20 w-20 border-2">
										<AvatarImage
											src={user.avatar}
											alt={user.username}
										/>
										<AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary to-secondary text-foreground">
											{getInitials(user.nickname)}
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3 mb-2">
										<h2 className="text-3xl font-semibold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
											{user.nickname}
										</h2>
										<Badge
											variant="secondary"
											className="text-xs px-3 py-1 bg-success/10 text-success border-success/20"
										>
											{accountStatus === "authenticated"
												? `${user.status}`
												: t("pendingRegistration")}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{user.email == "-"
											? t("noEmailProvided")
											: user.email}
									</p>
								</div>
							</div>
							<div className="mt-6 p-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border border-primary/10 hover:border-primary/20 transition-colors">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl">
											<Wallet className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="text-sm font-semibold text-foreground mb-1">
												{t("walletAddress")}
											</p>
											<code className="text-xs rounded-lg border border-border/50">
												{user.walletAddress
													? `${user.walletAddress.slice(
															0,
															8
													  )}...${user.walletAddress.slice(
															-8
													  )}`
													: t("notConnected")}
											</code>
										</div>
									</div>
									{user.walletAddress && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleCopyAddress}
											className="h-10 w-10 p-0 hover:bg-primary/10 hover:scale-105 transition-all"
										>
											<Copy
												className={`h-4 w-4 ${
													copiedAddress
														? "text-success"
														: "text-muted-foreground"
												}`}
											/>
										</Button>
									)}
								</div>
							</div>
							{/* <CardContent className="relative space-y-4"> */}
							<div className="p-3 mt-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
								<p className="text-xs text-muted-foreground mb-2">
									Your Referral Code
								</p>
								<div className="flex items-center justify-between gap-2">
									<code className="text-sm font-mono font-semibold text-purple-500 px-3 py-1 bg-background/50 rounded-lg">
										{user.referralId || "N/A"}
									</code>
									{user.referralId && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												navigator.clipboard.writeText(
													user.referralId
												);
												setCopiedReferral(true);
												toast.success(
													"Referral code copied!"
												);
												setTimeout(
													() =>
														setCopiedReferral(
															false
														),
													2000
												);
											}}
											className="h-8 w-8 p-0 hover:bg-purple-500/10"
										>
											<Copy
												className={`h-4 w-4 ${
													copiedReferral
														? "text-success"
														: "text-purple-500"
												}`}
											/>
										</Button>
									)}
								</div>
							</div>
							{/* </CardContent> */}
						</CardContent>
					</Card>

					{/* Balance Overview */}
					<Card className="relative overflow-hidden border-0 shadow-lg md:col-span-2 xl:col-span-1">
						{/* ... (JSX for Balance Overview is identical) */}
						<CardHeader>
							<h3 className="text-lg font-semibold">
								<Wallet className="h-5 w-5 inline-block mr-2" />
								{t("balanceOverview")}
							</h3>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="text-center p-2 bg-success/10 rounded-lg">
								<p className="text-sm text-foreground mb-1">
									{t("currentBalance")}
								</p>
								<p className="text-2xl font-semibold text-primary">
									${user.balance?.toFixed(2) || "0.00"}
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="text-center p-3 bg-muted/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-1">
										{t("totalDeposits")}
									</p>
									<p className="text-lg font-semibold text-foreground">
										{user.depositTotal || "0"}
									</p>
								</div>
								<div className="text-center p-3 bg-muted/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-1">
										{t("totalWithdrawals")}
									</p>
									<p className="text-lg font-semibold text-foreground">
										{user.withdrawTotal || "0"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Connected Wallets */}
					{user.socialData && user.socialData.length > 0 && (
						<Card className="md:col-span-2 xl:col-span-1">
							<CardHeader>
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<Link2 className="h-5 w-5 text-cyan-500" />
									Connected Accounts
								</h3>
							</CardHeader>
							<CardContent className="space-y-3">
								{user.socialData.map((social, index) => (
									<div
										key={social.id || index}
										className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
									>
										<div className="p-2 bg-cyan-500/10 rounded-lg">
											{social.format === "blockchain" && (
												<Wallet className="h-4 w-4 text-cyan-500" />
											)}
											{social.format === "email" && (
												<Mail className="h-4 w-4 text-cyan-500" />
											)}
											{social.format === "oauth" && (
												<Shield className="h-4 w-4 text-cyan-500" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{social.oauthDisplayName ||
													social.email ||
													social.walletName ||
													"Connected Account"}
											</p>
											<p className="text-xs text-muted-foreground capitalize">
												{social.format} •{" "}
												{social.oauthProvider ||
													social.walletProvider ||
													"Wallet"}
											</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}

					{/* Getting Started */}

					{/* Recent Activity */}
				</div>
				<div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-6">
					{/* Account Information */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Shield className="h-5 w-5 text-blue-500" />
								Account Details
							</h3>
						</CardHeader>
						<CardContent className="space-y-3">
							{user.country && (
								<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">
											Country
										</p>
										<p className="text-sm font-medium">
											{user.country}
										</p>
									</div>
								</div>
							)}
							{user.phone && user.phone !== "-" && (
								<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">
											Phone
										</p>
										<p className="text-sm font-medium">
											{user.phone}
										</p>
									</div>
								</div>
							)}
							{user.email && user.email !== "-" && (
								<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">
											Email
										</p>
										<p className="text-sm font-medium truncate">
											{user.email}
										</p>
									</div>
								</div>
							)}
							{user.lastLogin && (
								<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">
											Last Login
										</p>
										<p className="text-sm font-medium">
											{new Date(
												user.lastLogin
											).toLocaleDateString()}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Referral Program */}
					<Card className="relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10" />
						<CardHeader className="relative">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Users className="h-5 w-5 text-purple-500" />
								Referral Program
							</h3>
						</CardHeader>
						<CardContent className="relative space-y-4">
							<div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
								<p className="text-xs text-muted-foreground mb-2">
									Your Referral Link
								</p>
								<div className="flex items-center justify-between gap-2">
									<code className="text-sm font-mono font-semibold text-purple-500 px-3 py-1 bg-background/50 rounded-lg">
										{`${window.location.origin}/?ref=${user?.referralId}` ||
											"N/A"}
										{/* const shareUrl = `${window.location.origin}/?ref=${user?.referralId}`; */}
									</code>
									{user.referralId && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleCopyReferral}
											className="h-8 w-8 p-0 hover:bg-purple-500/10"
										>
											<Copy
												className={`h-4 w-4 ${
													copiedReferral
														? "text-success"
														: "text-purple-500"
												}`}
											/>
										</Button>
									)}
								</div>
							</div>
							<div className="space-y-2">
								<p className="text-xs text-muted-foreground">
									Invite friends and earn rewards for every
									successful referral!
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full gap-2 border-purple-500/30 hover:bg-purple-500/10"
									onClick={() => router.push("/affiliate")}
								>
									<TrendingUp className="h-4 w-4" />
									View Referral Stats
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Activity className="h-5 w-5 text-green-500" />
								Quick Actions
							</h3>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								variant="outline"
								className="w-full justify-start gap-2"
								onClick={() => router.push("/history")}
							>
								<Clock className="h-4 w-4" />
								Transaction History
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start gap-2"
								onClick={() =>
									router.push("/history?section=bet")
								}
							>
								<Trophy className="h-4 w-4" />
								Bet History
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start gap-2"
								onClick={() => router.push("/lobby")}
							>
								<ExternalLink className="h-4 w-4" />
								Go to Lobby
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
