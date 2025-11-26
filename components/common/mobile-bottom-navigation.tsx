"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHouse,
	faGamepad,
	faChartLineUp,
	faUser,
	IconDefinition,
} from "@fortawesome/pro-light-svg-icons";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-provider";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import MobileLoginDropdown from "./header/mobile-login-dropdown";
import { EmailVerificationModal } from "../features/auth/email-verification-modal";

interface NavigationItem {
	id: string;
	label: string;
	icon: IconDefinition;
	path: string;
	requiresAuth?: boolean;
}

export function MobileBottomNavigation() {
	const tNav = useTranslations("navigation");
	const router = useRouter();
	const pathname = usePathname();
	const { isLoggedIn } = useDynamicAuth();
	const { setShowAuthFlow } = useDynamicContext();
	const [emailModalOpen, setEmailModalOpen] = useState(false);

	const navigationItems: NavigationItem[] = [
		{
			id: isLoggedIn ? "lobby" : "home",
			label: isLoggedIn ? tNav("lobby") : tNav("home"),
			icon: faHouse,
			path: isLoggedIn ? "/lobby" : "/",
		},
		{
			id: "games",
			label: tNav("games"),
			icon: faGamepad,
			path: "/games",
		},
		{
			id: "providers",
			label: "Providers",
			icon: faChartLineUp,
			path: "/providers",
		},
	];

	// Only add profile item when logged in
	if (isLoggedIn) {
		navigationItems.push({
			id: "profile",
			label: tNav("profile"),
			icon: faUser,
			path: "/profile",
			requiresAuth: true,
		});
	}

	const handleNavigation = (item: NavigationItem) => {
		if (item.requiresAuth && !isLoggedIn) {
			// Could trigger login modal here if needed
			return;
		}

		// Special handling for home button - redirect to lobby if logged in
		if (item.id === "home") {
			router.push(isLoggedIn ? "/lobby" : "/");
			return;
		}

		router.push(item.path);
	};

	const isActive = (path: string) => {
		// Special handling for home button active state
		if (path === "/" && !isLoggedIn) {
			return pathname === "/";
		}
		if (path === "/lobby" && isLoggedIn) {
			return pathname === "/lobby" || pathname === "/";
		}
		if (path === "/") {
			return pathname === "/" || pathname === "/lobby";
		}
		return pathname.startsWith(path);
	};

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
			aria-label="Mobile navigation"
		>
			{/* Navigation Container */}
			<div
				className="relative backdrop-blur-lg border-t"
				style={{
					background: "var(--background)",
					borderColor: "var(--border)",
					boxShadow: `0 -4px 20px oklch(from var(--ring) l c h / 0.15)`,
					// Make room for iOS home indicator without lifting the bar
					height: "calc(60px + env(safe-area-inset-bottom, 0px))",
					paddingBottom: "env(safe-area-inset-bottom, 0px)",
				}}
			>
				{/* Gradient overlay for modern glass effect */}
				<div
					className="absolute inset-0 opacity-50"
					style={{
						background: `linear-gradient(to top, 
							oklch(from var(--card) l c h / 0.8) 0%, 
							oklch(from var(--card) l c h / 0.4) 100%)`,
					}}
				/>

				{/* Navigation items */}
				<div className="relative flex items-center justify-around h-full px-2">
					{navigationItems.map((item) => {
						const active = isActive(item.path);
						const disabled = item.requiresAuth && !isLoggedIn;

						return (
							<button
								key={item.id}
								onClick={() => handleNavigation(item)}
								disabled={disabled}
								className={cn(
									"relative flex flex-col items-center justify-center",
									"min-w-0 flex-1 py-2 px-2",
									"transition-all duration-300 ease-out",
									"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
									"active:scale-95"
								)}
								style={{
									borderRadius: "var(--radius-lg)",
								}}
								aria-label={`Navigate to ${item.label}`}
								aria-current={active ? "page" : undefined}
							>
								{/* Active background with gradient */}
								{active && (
									<div
										className="absolute inset-1 rounded-lg opacity-100 transition-opacity duration-300"
										style={{
											background: "var(--primary)",
											boxShadow: `0 2px 8px oklch(from var(--primary) l c h / 0.3), 
												inset 0 1px 0 oklch(from var(--primary) l c h / 0.2)`,
										}}
									/>
								)}

								{/* Hover background */}
								{!active && (
									<div
										className="absolute inset-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200"
										style={{
											background: `oklch(from var(--muted) l c h / 0.5)`,
										}}
									/>
								)}

								{/* Icon container */}
								<div
									className={cn(
										"relative flex items-center justify-center mb-1",
										"transition-all duration-300 ease-out",
										active
											? "scale-110"
											: "scale-100 hover:scale-105"
									)}
								>
									<FontAwesomeIcon
										icon={item.icon}
										className="w-6 h-6"
										style={{
											fontSize: "24px",
											color: active
												? "var(--text-foreground)"
												: "var(--muted-foreground)",
											filter: active
												? "drop-shadow(0 1px 2px oklch(from var(--primary) l c h / 0.3))"
												: "none",
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
										color: active
											? "var(--text-foreground)"
											: "var(--muted-foreground)",
										textShadow: active
											? "0 1px 2px oklch(from var(--primary) l c h / 0.3)"
											: "none",
									}}
								>
									{item.label}
								</span>

								{/* Ripple effect overlay */}
								<div className="absolute inset-0 rounded-lg overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 transition-opacity duration-200 hover:opacity-100" />
								</div>
							</button>
						);
					})}

					{/* Login/Profile section */}
					{!isLoggedIn && (
						<div className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-2">
							<MobileLoginDropdown
								setEmailModalOpen={setEmailModalOpen}
								setShowAuthFlow={setShowAuthFlow}
								type="bottom"
							/>
						</div>
					)}
				</div>
			</div>

			{/* Email Verification Modal */}
			<EmailVerificationModal
				isOpen={emailModalOpen}
				onClose={() => setEmailModalOpen(false)}
			/>
		</nav>
	);
}
