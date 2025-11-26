"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Local Components & Hooks
// import { ThemeToggle } from "../../theme/theme-toggle";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SearchModal } from "@/components/features/search/search-modal";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useRouter } from "next/navigation";
import WalletConnect from "../../features/auth/wallet-connect";
import { EmailVerificationModal } from "../../features/auth/email-verification-modal";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { capitalize, cn } from "@/lib/utils";
import { useAppStore } from "@/store/store";
import { useSidebar } from "../../ui/sidebar";
import { useTranslations } from "@/lib/locale-provider";
import { LanguageChangerModal } from "@/components/common/language-changer-modal";
import { useRefreshLimiter } from "@/hooks/use-refresh-limiter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBars,
	faChartLineUp,
	faChevronDown,
	faComment,
	faGlobe,
	faHome,
	faMagnifyingGlass,
	faRightFromBracket,
	// faSquareList,
	faUser,
	faUsers,
	faWallet,
	faArrowsRotate,
	faGift,
} from "@fortawesome/pro-light-svg-icons";
import MobileLoginDropdown from "./mobile-login-dropdown";

export function PageHeader({ className }: { className?: string }) {
	const tHeader = useTranslations("header");
	const tNavigation = useTranslations("navigation");
	// const tApp = useTranslations("app");
	const [searchOpen, setSearchOpen] = useState(false);
	const [emailModalOpen, setEmailModalOpen] = useState(false);
	const [languageModalOpen, setLanguageModalOpen] = useState(false);
	const { user, isLoggedIn, isLoading, logout, refreshUserData } =
		useDynamicAuth();
	const { setShowAuthFlow } = useDynamicContext();
	const openTransactionModal = useAppStore(
		(state) => state.uiDefinition.modal.openTransactionModal
	);
	const {
		toggleChat,
		messageCount,
		isOpen: isChatOpen,
	} = useAppStore((state) => state.uiDefinition.chat);
	const { toggleSidebar, open } = useSidebar();
	const router = useRouter();

	// Initialize refresh limiter with 10 second cooldown
	const { isRefreshing, canRefresh, handleRefresh } = useRefreshLimiter(10);

	const handleLogout = () => {
		logout();
		// router.push("/"); // Redirect to home after logout
	};

	const handleCashirClick = () => {
		openTransactionModal("walletInfo");
	};

	const handleRefreshUserInfo = async () => {
		await handleRefresh(async () => {
			await refreshUserData();
		});
	};

	const UserMenu = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex items-center gap-2 h-10 px-2 text-left"
				>
					<Avatar className="w-9 h-9">
						<AvatarImage src={user?.avatar} alt={user?.nickname} />
						<AvatarFallback>
							{user?.nickname?.slice(0, 2).toUpperCase() || ".."}
						</AvatarFallback>
					</Avatar>
					<div className="hidden md:grid">
						<span className="font-medium text-sm truncate">
							{capitalize(user?.nickname) || "Player"}
						</span>
						<span className="text-xs text-muted-foreground">
							VIP {capitalize(user?.vipLevel) || "Bronze"}
						</span>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{capitalize(user?.nickname)}
						</p>
						<span className="text-xs text-muted-foreground">
							VIP {capitalize(user?.vipLevel) || "Bronze"}
						</span>
						{/* <p className="text-xs leading-none text-muted-foreground">
							{capitalize(user?.email)}
						</p> */}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => router.push("/profile")}>
						<FontAwesomeIcon
							icon={faUser}
							fontSize={20}
							aria-hidden="true"
						/>
						<span>{tHeader("profile")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleCashirClick}>
						<FontAwesomeIcon
							icon={faWallet}
							fontSize={20}
							aria-hidden="true"
						/>
						<span>{tHeader("cashier")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/history?section=bet")}
					>
						<FontAwesomeIcon
							icon={faChartLineUp}
							fontSize={20}
							aria-hidden="true"
						/>
						<span>{tHeader("winLoss")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/affiliate")}>
						<FontAwesomeIcon
							icon={faUsers}
							fontSize={20}
							aria-hidden="true"
						/>
						<span>{tHeader("affiliate")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/bonus")}>
						<FontAwesomeIcon
							icon={faGift}
							fontSize={20}
							aria-hidden="true"
						/>
						<span>{tHeader("turnoverBonus")}</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup className="block lg:hidden">
					<DropdownMenuItem>
						{/* <ThemeToggle className="flex " /> */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									aria-label="Language"
									onClick={() => setLanguageModalOpen(true)}
								>
									{/* <Languages className="h-4 w-4" /> */}
									<FontAwesomeIcon
										icon={faGlobe}
										className="w-5 h-5"
									/>
									<span className="sr-only">Language</span>
								</Button>
							</DropdownMenuTrigger>
						</DropdownMenu>
						<Button
							variant="outline"
							size="icon"
							onClick={toggleChat}
							aria-label={`${tHeader("liveChat")}${
								messageCount > 0
									? ` - ${messageCount} unread messages`
									: ""
							}`}
							className="relative md:hidden"
						>
							<FontAwesomeIcon
								icon={faComment}
								className="w-5 h-5"
								aria-hidden="true"
							/>
							{!isChatOpen && messageCount > 0 && (
								<span className="absolute -top-1 -right-1 bg-primary text-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
									{messageCount > 99 ? "99+" : messageCount}
								</span>
							)}
							<span className="sr-only">Live Chat</span>
						</Button>
						<Button
							className="md:hidden"
							variant="outline"
							size="icon"
							onClick={() => setSearchOpen(true)}
							aria-label="Search"
						>
							<FontAwesomeIcon
								icon={faMagnifyingGlass}
								className="w-4 h-4"
								aria-hidden="true"
							/>
						</Button>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="block lg:hidden" />
				<DropdownMenuItem
					onClick={handleLogout}
					className="text-destructive"
				>
					<FontAwesomeIcon
						icon={faRightFromBracket}
						className="mr-2 w-5 h-5"
						aria-hidden="true"
					/>
					<span>{tHeader("logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	// const MobileLoginDropdown = ({
	// 	setEmailModalOpen,
	// 	setShowAuthFlow,
	// }: {
	// 	setEmailModalOpen: (open: boolean) => void;
	// 	setShowAuthFlow: (show: boolean) => void;
	// }) => (
	// 	<DropdownMenu>
	// 		<DropdownMenuTrigger asChild>
	// 			<Button variant="outline" className="md:hidden text-sm">
	// 				Login/Sign Up
	// 			</Button>
	// 		</DropdownMenuTrigger>
	// 		<DropdownMenuContent className="w-56" align="end">
	// 			<DropdownMenuLabel>Choose Login Method</DropdownMenuLabel>
	// 			<DropdownMenuSeparator />
	// 			<DropdownMenuItem
	// 				onClick={() => setEmailModalOpen(true)}
	// 				className="flex items-center gap-2 py-3"
	// 			>
	// 				{/* <User className="h-4 w-4" /> */}
	// 				<FontAwesomeIcon icon={faUser} fontSize={20} />
	// 				<div className="flex flex-col">
	// 					<span className="font-medium">Login with Email</span>
	// 					<span className="text-xs text-muted-foreground">
	// 						Quick email verification
	// 					</span>
	// 				</div>
	// 			</DropdownMenuItem>
	// 			<DropdownMenuSeparator />
	// 			<div className="p-2">
	// 				<div className="text-xs text-muted-foreground mb-2 px-2">
	// 					Or connect your wallet:
	// 				</div>
	// 				<Button
	// 					variant="default"
	// 					onClick={() => setShowAuthFlow(true)}
	// 					className="w-full flex items-center gap-2"
	// 					size="sm"
	// 				>
	// 					{/* <Wallet className="w-4 h-4" /> */}
	// 					<FontAwesomeIcon icon={faWallet} fontSize={22} />
	// 					Connect Wallet
	// 				</Button>
	// 			</div>
	// 		</DropdownMenuContent>
	// 	</DropdownMenu>
	// );

	const LoadingSkeletons = () => (
		<>
			<Skeleton className="h-9 w-28 rounded-md" />
			<div className="flex items-center gap-2">
				<Skeleton className="h-8 w-8 rounded-full" />
				<div className="hidden md:grid gap-1">
					<Skeleton className="h-4 w-16 rounded-md" />
					<Skeleton className="h-3 w-12 rounded-md" />
				</div>
			</div>
		</>
	);
	return (
		<header
			role="banner"
			className={cn(
				"flex h-16 shrink-0 mx-auto bg-sidebar/90 backdrop-blur-lg sticky top-0 items-center lg:justify-between gap-2 border-b",
				open
					? "md:w-[calc(100dvw-var(--sidebar-width))]"
					: "md:w-[calc(100dvw-var(--sidebar-width-icon))]",
				className
			)}
		>
			{/* Left Side: Brand Logo & Title */}
			<nav
				className="flex items-center gap-2 cursor-pointer"
				aria-label="Main navigation"
			>
				<Button
					className="p-2"
					variant={"outline"}
					size="icon"
					aria-label={tHeader("toggleSidebar")}
					onClick={() => {
						toggleSidebar();
					}}
				>
					<FontAwesomeIcon
						icon={faBars}
						className="w-6 h-6"
						aria-hidden="true"
					/>
					<span className="sr-only">{tHeader("toggleSidebar")}</span>
				</Button>

				<Button
					className="hidden lg:flex"
					variant="outline"
					size="icon"
					onClick={() => router.replace(isLoggedIn ? "/lobby" : "/")}
					aria-label={
						isLoggedIn ? tNavigation("lobby") : tNavigation("home")
					}
				>
					<FontAwesomeIcon
						icon={faHome}
						className="w-4 h-4"
						aria-hidden="true"
					/>
				</Button>
				{!isLoggedIn && (
					<Button
						className="lg:hidden"
						variant="outline"
						size="icon"
						onClick={() => setSearchOpen(true)}
						aria-label="Search"
					>
						<FontAwesomeIcon
							icon={faMagnifyingGlass}
							className="w-4 h-4"
							aria-hidden="true"
						/>
					</Button>
				)}
			</nav>

			<Button
				className="flex lg:hidden "
				variant="outline"
				size="icon"
				onClick={() => router.replace(isLoggedIn ? "/lobby" : "/")}
				aria-label={
					isLoggedIn ? tNavigation("lobby") : tNavigation("home")
				}
			>
				<FontAwesomeIcon
					icon={faHome}
					className="w-4 h-4"
					aria-hidden="true"
				/>
			</Button>

			{/* Center: Global search (desktop only) */}
			<div className="hidden xl:flex flex-1 max-w mr-6">
				<Input
					type="search"
					placeholder={tHeader("searchPlaceholder")}
					aria-label={tHeader("searchPlaceholder")}
					className="w-full"
					onKeyDown={(e) => {
						if (e.key === "Enter") setSearchOpen(true);
					}}
					onFocus={() => setSearchOpen(true)}
				/>
			</div>

			{/* Right Side: User Actions & Theme */}
			<div className="flex ml-auto lg:ml-0 items-center gap-3">
				{/* Mobile search trigger - First in mobile */}

				{/* Live Chat Button - Second in mobile, always visible regardless of auth status */}
				{/* {!isLoading && (
					<Button
						variant="outline"
						size="icon"
						onClick={toggleChat}
						className="relative md:hidden"
					>
						<MessageCircle className="w-5 h-5" />
						{!isChatOpen && messageCount > 0 && (
							<span className="absolute -top-1 -right-1 bg-primary text-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{messageCount > 99 ? "99+" : messageCount}
							</span>
						)}
						<span className="sr-only">Live Chat</span>
					</Button>
				)} */}

				{isLoading ? (
					<LoadingSkeletons />
				) : isLoggedIn ? (
					<>
						{/* Refresh Button */}
						<Button
							variant="outline"
							size="icon"
							onClick={handleRefreshUserInfo}
							disabled={!canRefresh || isRefreshing}
							className="relative"
							aria-label={
								isRefreshing
									? "Refreshing user info"
									: "Refresh user info"
							}
						>
							<FontAwesomeIcon
								icon={faArrowsRotate}
								className={cn(
									"w-4 h-4",
									isRefreshing && "animate-spin"
								)}
								aria-hidden="true"
							/>
							<span className="sr-only">Refresh</span>
						</Button>

						{/* Wallet Control - Single Button (merged) */}
						<Button
							onClick={() => openTransactionModal("walletInfo")}
							aria-label={`Open wallet - Current balance: ${(
								user?.balance ?? 0
							).toFixed(2)} USD`}
							className="flex items-center gap-1.5 rounded-full p-0 bg-transparent hover:bg-transparent shadow-none
								focus-visible:ring-0 focus-visible:ring-offset-0"
						>
							{/* Left: Balance pill */}
							<span
								className="flex items-center gap-2 rounded-md px-3 md:px-3.5 py-1 md:py-1.5
								bg-gradient-to-r from-primary to-[color-mix(in_oklab,theme(colors.primary)/100%,black_15%)]
								text-foreground shadow-md hover:shadow-lg transition-shadow"
								aria-hidden="true"
							>
								<span className="text-sm md:text-base font-semibold">
									$ {(user?.balance ?? 0).toFixed(2)} USD
								</span>
								<FontAwesomeIcon
									icon={faChevronDown}
									className="w-5 h-5 sm:block"
									aria-hidden="true"
								/>
							</span>
						</Button>
						{/* <Button variant="ghost" size="icon">
							<Bell className="w-5 h-5" />
							<span className="sr-only">Notifications</span>
						</Button> */}
						{/* <Separator orientation="vertical" className="h-6" /> */}
						{/* User Menu - Last in mobile */}
						<UserMenu />
					</>
				) : (
					<>
						{/* {sdfsssssssddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss} */}
						<Button
							variant="outline"
							size="icon"
							aria-label="Change language"
							onClick={() => setLanguageModalOpen(true)}
							className="flex lg:hidden"
						>
							<FontAwesomeIcon
								icon={faGlobe}
								className="w-5 h-5"
								aria-hidden="true"
							/>
							<span className="sr-only">Language</span>
						</Button>
						{/* Mobile login dropdown */}
						<MobileLoginDropdown
							setEmailModalOpen={setEmailModalOpen}
							setShowAuthFlow={setShowAuthFlow}
							type="top"
						/>
						{/* Desktop login - hidden on mobile */}
						<div className="hidden min-[800px]:flex md:gap-2">
							<WalletConnect />
						</div>
					</>
				)}

				{/* Desktop Live Chat Button - hidden on mobile */}
				{!isLoading && (
					<Button
						variant="outline"
						size="icon"
						onClick={toggleChat}
						aria-label={`${tHeader("liveChat")}${
							messageCount > 0
								? ` - ${messageCount} unread messages`
								: ""
						}`}
						className="relative hidden lg:flex"
					>
						<FontAwesomeIcon
							icon={faComment}
							className="w-5 h-5"
							aria-hidden="true"
						/>
						{!isChatOpen && messageCount > 0 && (
							<span
								className="absolute -top-1 -right-1 bg-primary text-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
								aria-label={`${messageCount} unread messages`}
							>
								{messageCount > 99 ? "99+" : messageCount}
							</span>
						)}
						<span className="sr-only">{tHeader("liveChat")}</span>
					</Button>
				)}
				{/* Language Switcher */}
				<Button
					variant="outline"
					size="icon"
					aria-label="Change language"
					onClick={() => setLanguageModalOpen(true)}
					className="hidden lg:flex"
				>
					<FontAwesomeIcon
						icon={faGlobe}
						className="w-5 h-5"
						aria-hidden="true"
					/>
					<span className="sr-only">Language</span>
				</Button>
				{/* <ThemeToggle className="hidden lg:flex" /> */}
			</div>
			<SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
			<EmailVerificationModal
				isOpen={emailModalOpen}
				onClose={() => setEmailModalOpen(false)}
			/>
			<LanguageChangerModal
				open={languageModalOpen}
				onOpenChange={setLanguageModalOpen}
			/>
		</header>
	);
}
