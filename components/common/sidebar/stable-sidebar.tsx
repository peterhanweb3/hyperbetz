"use client";

import {
	ComponentProps,
	useMemo,
	useCallback,
	memo,
	useRef,
	useEffect,
	useState,
} from "react";
import { useAppStore } from "@/store/store";
import { getNavData } from "@/data/side-bar-data";
import { selectNavDataForGames } from "@/store/selectors/query/query.selectors";
import { Button } from "@/components/ui/button";
import { NavMain } from "@/components/common/sidebar/nav-main";
import { useTranslations } from "@/lib/locale-provider";
import Image from "next/image";
import Link from "next/link";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faPaperPlane } from "@fortawesome/pro-light-svg-icons";

/**
 * Ultra-optimized sidebar that minimizes re-renders by:
 * 1. Avoiding volatile Next.js hooks
 * 2. Using stable references for everything
 * 3. Only updating when absolutely necessary
 */
const StableSidebarComponent = ({
	...props
}: ComponentProps<typeof Sidebar>) => {
	const renderCount = useRef(0);
	renderCount.current += 1;

	if (process.env.NODE_ENV !== "production") {
		// console.log(
		// 	`🎯 StableSidebar render #${renderCount.current}:`,
		// 	new Date().toISOString()
		// );
	}

	// i18n - cached reference
	const tSidebar = useTranslations("sidebar");

	// Get current route info from window instead of hooks (more stable)
	const [currentPath, setCurrentPath] = useState(() => {
		if (typeof window !== "undefined") {
			return window.location.pathname;
		}
		return "/";
	});

	// Listen for route changes only when necessary
	useEffect(() => {
		const handleRouteChange = () => {
			const newPath = window.location.pathname;
			if (newPath !== currentPath) {
				setCurrentPath(newPath);
				if (process.env.NODE_ENV !== "production") {
					console.log("🛣️ Route changed to:", newPath);
				}
			}
		};

		// Use a more stable route change detection
		const interval = setInterval(handleRouteChange, 1000);

		return () => clearInterval(interval);
	}, [currentPath]);

	// Store subscriptions with ultra-stable references
	const allGames = useAppStore((state) => state.game.list.games);
	const navDataRaw = useAppStore(selectNavDataForGames);

	// Track store changes
	const prevGamesRef = useRef(allGames);
	const prevNavDataRef = useRef(navDataRaw);

	if (prevGamesRef.current !== allGames) {
		if (process.env.NODE_ENV !== "production") {
			console.log("🏪 Games changed:", allGames?.length);
		}
		prevGamesRef.current = allGames;
	}

	if (prevNavDataRef.current !== navDataRaw) {
		if (process.env.NODE_ENV !== "production") {
			console.log("🏪 NavData changed:", navDataRaw);
		}
		prevNavDataRef.current = navDataRaw;
	}

	// Wallet state with minimal updates - CRITICAL: avoid destructuring
	const dynamicContext = useDynamicContext();
	const primaryWallet = useMemo(
		() => dynamicContext.primaryWallet,
		[dynamicContext.primaryWallet]
	);
	const setShowAuthFlow = useMemo(
		() => dynamicContext.setShowAuthFlow,
		[dynamicContext.setShowAuthFlow]
	);
	const isLoggedIn = useMemo(() => !!primaryWallet, [primaryWallet]);

	// Track dynamic context changes
	const prevContextRef = useRef(dynamicContext);
	if (prevContextRef.current !== dynamicContext) {
		if (process.env.NODE_ENV !== "production") {
			console.log("🚨 DYNAMIC CONTEXT OBJECT CHANGED");
		}
		prevContextRef.current = dynamicContext;
	}

	// Ultra-stable navigation data
	const navData = useMemo(() => {
		console.log("🏗️ Rebuilding nav data");
		if (process.env.NODE_ENV !== "production") {
			console.log("🏗️ Rebuilding nav data");
		}
		return getNavData({
			categories: navDataRaw.categories,
			providers: navDataRaw.providers,
			pathname: currentPath,
			isLoggedIn,
		});
	}, [navDataRaw.categories, navDataRaw.providers, currentPath, isLoggedIn]);

	// Stable handlers
	const handleProtectedAction = useCallback(
		(tab: "deposit" | "withdraw") => {
			if (!primaryWallet) {
				setShowAuthFlow?.(true);
				return;
			}

			// Direct navigation without hooks
			const params = new URLSearchParams(window.location.search);
			params.set("tab", tab);
			const newUrl = `${window.location.pathname}?${params.toString()}`;
			window.history.pushState({}, "", newUrl);
		},
		[primaryWallet, setShowAuthFlow]
	);

	return (
		<Sidebar
			collapsible="icon"
			{...props}
			className="border-r border-border/20 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 "
		>
			{/* Sidebar Header with logo and title */}
			<div className="flex items-center p-4">
				<Image
					src="/assets/site/Hyperbetz-logo.webp"
					alt="Hyperbetz Logo"
					width={192}
					height={48}
					priority={false}
					className="h-12 w-auto m-auto"
				/>
			</div>

			<SidebarHeader className="border-b border-border/20 bg-card/20">
				{/* Quick Actions with enhanced styling */}
				<div className="flex gap-2 px-4 py-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1 bg-primary/20 text-xs border-primary/50 hover:bg-primary/40 text-foreground shimmer-effect transition-all duration-300"
						onClick={() => handleProtectedAction("deposit")}
					>
						{tSidebar("deposit")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-1  bg-destructive/30 text-xs border-destructive/50 hover:bg-destructive/50 text-foreground shimmer-effect transition-all duration-300"
						onClick={() => handleProtectedAction("withdraw")}
					>
						{tSidebar("withdraw")}
					</Button>
				</div>

				{/* Telegram Button with enhanced styling */}
				<div className="px-4 py-2">
					<Button
						className="w-full shadow-lg shadow-accent/30 transition-all duration-300 text-foreground bg-sky-600"
						asChild
					>
						<a href="https://t.me/hyperbetz_bot/hyperbetz">
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
				/>
			</SidebarContent>

			<SidebarFooter className="border-t border-border/20 bg-card/20">
				{/* Daily Bonus Button with pulsing animation */}
				<div className="px-2 py-3">
					<Button
						className="w-full bg-primary hover:bg-primary/90 text-foreground/80 font-semibold shadow-lg shadow-primary/40 animate-daily-bonus-pulse transition-all duration-300"
						asChild
					>
						<Link href="/bonus">
							<FontAwesomeIcon
								icon={faGift}
								fontSize={16}
								className="mr-2"
							/>
							{tSidebar("dailyBonus")}
						</Link>
					</Button>
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};

// Export ultra-memoized component
export const StableSidebar = memo(StableSidebarComponent);
StableSidebar.displayName = "StableSidebar";
