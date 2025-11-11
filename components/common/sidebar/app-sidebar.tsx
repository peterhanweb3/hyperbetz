"use client";

import { ComponentProps, useMemo, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/store/store";
import { getNavData } from "@/data/side-bar-data";
import { selectNavDataForGames } from "@/store/selectors/query/query.selectors";
// import { Gift, Dices, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavMain } from "@/components/common/sidebar/nav-main";
import { useTranslations } from "@/lib/locale-provider";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	// SidebarRail,
	SidebarMenuButton,
	useSidebar,
} from "@/components/ui/sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faPaperPlane } from "@fortawesome/pro-light-svg-icons";
import type { Game } from "@/types/games/gameList.types";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";

// Child component that isolates Dynamic Context updates
const ProtectedActionButtons = memo(function ProtectedActionButtons({
	onAuthedAction,
	tSidebar,
	onNavigate,
}: {
	onAuthedAction: (tab: "deposit" | "withdraw") => void;
	tSidebar: ReturnType<typeof useTranslations>;
	onNavigate: () => void;
}) {
	const { primaryWallet, setShowAuthFlow } = useDynamicContext();

	const handleClick = useCallback(
		(tab: "deposit" | "withdraw") => {
			if (!primaryWallet) {
				setShowAuthFlow?.(true);
				return;
			}
			onAuthedAction(tab);
			onNavigate();
		},
		[primaryWallet, setShowAuthFlow, onAuthedAction, onNavigate]
	);

	return (
		<div className="flex gap-2  py-2">
			<Button
				variant="outline"
				size="sm"
				className="flex-1 bg-primary/20 text-[11px] border-primary/50 hover:bg-primary/40 text-foreground shimmer-effect transition-all duration-300"
				onClick={() => handleClick("deposit")}
			>
				{tSidebar("deposit")}
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="flex-1  bg-destructive/30 text-[11px] border-destructive/50 hover:bg-destructive/50 text-foreground shimmer-effect transition-all duration-300"
				onClick={() => handleClick("withdraw")}
			>
				{tSidebar("withdraw")}
			</Button>
		</div>
	);
});

const AppSidebarComponent = ({ ...props }: ComponentProps<typeof Sidebar>) => {
	// i18n
	const tSidebar = useTranslations("sidebar");

	// Get current pathname for active state detection
	const pathname = usePathname();
	const router = useRouter();

	// Auth state to tailor navigation
	const { isLoggedIn } = useDynamicAuth();

	// Sidebar state for mobile navigation
	const { isMobile, setOpenMobile } = useSidebar();

	// Close sidebar on mobile when navigating
	const handleMobileNavigation = useCallback(() => {
		if (isMobile) {
			setOpenMobile(false);
		}
	}, [isMobile, setOpenMobile]);

	// Store subscriptions using selectors to avoid global store re-renders
	const allGames = useAppStore((state) => state.game.list.games) as
		| Game[]
		| undefined;
	const navDataRaw = useAppStore(selectNavDataForGames);

	// OPTIMIZED: Memoize navigation data to prevent recreation on every render
	const navData = useMemo(
		() =>
			getNavData({
				categories: navDataRaw.categories,
				providers: navDataRaw.providers,
				pathname,
				isLoggedIn,
			}),
		[navDataRaw.categories, navDataRaw.providers, pathname, isLoggedIn]
	);

	// OPTIMIZED: Memoize URL parameter update function (avoid unstable useSearchParams)
	const updateUrlParams = useCallback(
		(tab: string) => {
			// Use window.location.search to avoid depending on useSearchParams identity
			if (typeof window === "undefined") {
				return;
			}
			const currentSearch = window.location.search;
			const params = new URLSearchParams(currentSearch);
			params.set("tab", tab);
			router.push(`${pathname}?${params.toString()}`);
		},
		[pathname, router]
	);

	return (
		<Sidebar
			collapsible="icon"
			{...props}
			className="border-r w-[calc(var(--sidebar-width)+2dvw)] border-border/20 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 font-poppins sidebar-stable sidebar-transition sidebar-no-flicker"
		>
			{/* Sidebar Header with logo and title */}
			{/* <div className="flex items-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:pt-3 p-4"> */}
			<div className="group-data-[collapsible=icon]:hidden flex items-center p-4">
				<Link
					href="/"
					aria-label="Hyperbetz Home"
					className="m-auto"
					onClick={handleMobileNavigation}
				>
					<Image
						src="/assets/site/Hyperbetz-logo.png"
						alt="Hyperbetz Logo"
						width={192}
						height={48}
						priority
						className="h-12 w-auto"
					/>
				</Link>
			</div>
			<SidebarHeader className="border-b border-border/20 py-2 px-4 pr-7 bg-card/20">
				{/* Quick Actions with enhanced styling */}
				<div className="group-data-[collapsible=icon]:hidden">
					<ProtectedActionButtons
						onAuthedAction={(tab) => updateUrlParams(tab)}
						tSidebar={tSidebar}
						onNavigate={handleMobileNavigation}
					/>
				</div>

				{/* Telegram Button with enhanced styling */}
				<div className="py-2 group-data-[collapsible=icon]:hidden">
					<Button
						className="w-full shadow-lg shadow-accent/30 transition-all duration-300 text-foreground bg-sky-600"
						asChild
					>
						<a
							href="https://t.me/hyperbetz_bot/hyperbetz"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleMobileNavigation}
						>
							<FontAwesomeIcon
								icon={faPaperPlane}
								fontSize={16}
								className="mr-1"
							/>
							{tSidebar("playOnTelegram")}
						</a>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="px-2 scrollbar-thin overflow-y-auto">
				<NavMain
					items={navData.navMain}
					gameCategories={navData.gameCategories}
					staticGameCategories={navData.staticGameCategories}
					providers={navData.providers}
					allGames={allGames}
					// aboutSection={navData.aboutSection}
				/>
			</SidebarContent>{" "}
			<SidebarFooter className="border-t border-border/20 bg-card/20">
				{/* Daily Bonus Button with pulsing animation */}
				<div className="group-data-[collapsible=icon]:px-0! px-2 py-3">
					<SidebarMenuButton
						tooltip={tSidebar("dailyBonus")}
						className="w-full bg-primary hover:bg-primary/90 text-foreground/80 font-semibold shadow-lg shadow-primary/40 animate-daily-bonus-pulse transition-all duration-300"
						asChild
					>
						<Link href="/bonus" onClick={handleMobileNavigation}>
							<FontAwesomeIcon
								icon={faGift}
								fontSize={16}
								className="mr-2"
							/>
							{tSidebar("dailyBonus")}
						</Link>
					</SidebarMenuButton>
				</div>

				{/* {isLoggedIn && <NavUser user={navData.user} />} */}
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

// Export memoized component to prevent unnecessary re-renders
export const AppSidebar = memo(AppSidebarComponent);
AppSidebar.displayName = "AppSidebar";
