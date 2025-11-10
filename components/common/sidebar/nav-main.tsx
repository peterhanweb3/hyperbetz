"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowRight,
	faChevronRight,
	IconDefinition,
} from "@fortawesome/pro-light-svg-icons";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Game } from "@/types/games/gameList.types";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getShuffledTopProviders } from "@/lib/utils/top-providers.utils";
import { saveToCache, loadFromCache, cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-provider";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { useTransactionModal } from "@/hooks/walletProvider/use-transaction-modal";
import { Separator } from "@/components/ui/separator";

// Types
export type NavItem = {
	title: string;
	url: string;
	icon?: IconDefinition;
	isActive: boolean;
	badge?: string;
	badgeVariant?: "default" | "secondary" | "destructive" | "outline";
	items?: { title: string; url: string; players?: string }[];
};
export type GameCategory = {
	title: string;
	url: string;
	icon?: IconDefinition;
	count?: number;
	badge?: string;
	badgeVariant?: "default" | "secondary" | "destructive" | "outline";
};
export type Provider = { title: string; url: string; count?: number };
export type AboutSection = {
	title: string;
	url: string;
	icon?: IconDefinition;
	isActive: boolean;
};
interface NavMainProps {
	items: NavItem[];
	gameCategories?: GameCategory[];
	staticGameCategories?: GameCategory[];
	providers?: Provider[];
	allGames?: Game[];
	aboutSection?: AboutSection;
}

const PROVIDERS_CACHE_KEY = "nav-main-shuffled-providers";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h
const MAX_CATEGORY_PROVIDERS = 48; // keep hover card DOM manageable

const normalizeCategoryKey = (value: string) => value.trim().toUpperCase();

export function NavMain({
	items,
	gameCategories = [],
	staticGameCategories = [],
	providers = [],
	allGames = [],
	aboutSection,
}: NavMainProps) {
	const tSidebar = useTranslations("sidebar");
	const tNav = useTranslations("navigation");
	const tGames = useTranslations("games");
	const router = useRouter();
	const { isLoggedIn, login } = useDynamicAuth();
	const { openModal } = useTransactionModal();

	const getShuffledProvidersWithCache = useCallback(() => {
		const cached = loadFromCache<{
			providers: Provider[];
			remaining: number;
		}>(PROVIDERS_CACHE_KEY, CACHE_DURATION);
		if (cached) {
			return {
				providers: cached.providers.map((p) => ({
					...p,
					count:
						providers.find(
							(c) =>
								c.title.toLowerCase() === p.title.toLowerCase()
						)?.count ?? p.count,
				})),
				remaining: cached.remaining,
			};
		}
		const shuffled = getShuffledTopProviders(providers);
		const data = {
			providers: shuffled.providers.map((p) => ({
				title: p.name,
				url: p.url,
				count: p.count,
			})),
			remaining: shuffled.remaining,
		};
		saveToCache(PROVIDERS_CACHE_KEY, data);
		return data;
	}, [providers]);
	const { toggleSidebar, open, isMobile, setOpenMobile } = useSidebar();
	const [isTrendingNowOpen, setIsTrendingNowOpen] = useState(true);

	useEffect(() => {
		if (!open) {
			setIsTrendingNowOpen(false);
		}
	}, [open]);

	// Close sidebar on mobile when navigating
	const handleMobileNavigation = useCallback(() => {
		if (isMobile) {
			setOpenMobile(false);
		}
	}, [isMobile, setOpenMobile]);

	const { providers: limitedProviders, remaining: remainingProvidersCount } =
		useMemo(
			() =>
				providers.length
					? getShuffledProvidersWithCache()
					: { providers: [], remaining: 0 },
			[providers.length, getShuffledProvidersWithCache]
		);

	const launchSpecificGame = (name: string) => {
		handleMobileNavigation();
		const game = allGames.find(
			(g) => g.game_name.toLowerCase() === name.toLowerCase()
		);
		if (!game) {
			router.push(
				`/games?q=${encodeURIComponent(
					name.toLowerCase().replace(/\s+/g, "")
				)}`
			);
			return;
		}
		if (!isLoggedIn) {
			login();
			return;
		}
		const qp = new URLSearchParams({
			vendor: game.vendor_name,
			gameType: game.own_game_type,
			gpId: String(game.gp_id),
		}).toString();
		router.push(`/play/${game.game_id}?${qp}`);
	};

	const handleStaticCategoryClick = (
		c: GameCategory,
		e: React.MouseEvent
	) => {
		e.preventDefault();
		handleMobileNavigation();
		const k = c.title.toLowerCase();
		if (k === "games.swap") {
			if (isLoggedIn) {
				openModal("swap");
			} else {
				login();
			}
		} else if (k === "games.vr")
			launchSpecificGame("Gonzo's Quest Megaways");
		else if (k === "games.futures") launchSpecificGame("Stock Market");
		else if (k === "games.poker") router.push("/games?q=poker");
		else if (k === "games.lottery") router.push("/games?q=lottery");
		else router.push(c.url);
	};

	const providersByCategory = useMemo(() => {
		if (!allGames?.length)
			return {} as Record<
				string,
				{
					list: Array<{ provider_name: string; count: number }>;
					total: number;
				}
			>;

		const lookup = new Map<string, Map<string, number>>();

		for (const game of allGames) {
			if (!game) continue;
			const rawCategory = game.category ? String(game.category) : "";
			const providerName = game.provider_name?.trim();
			if (!rawCategory || !providerName) continue;

			const categoryKey = normalizeCategoryKey(rawCategory);
			let categoryProviders = lookup.get(categoryKey);
			if (!categoryProviders) {
				categoryProviders = new Map();
				lookup.set(categoryKey, categoryProviders);
			}

			categoryProviders.set(
				providerName,
				(categoryProviders.get(providerName) || 0) + 1
			);
		}

		const result: Record<
			string,
			{
				list: Array<{ provider_name: string; count: number }>;
				total: number;
			}
		> = {};

		lookup.forEach((providerMap, categoryKey) => {
			const sorted = Array.from(providerMap.entries())
				.map(([provider_name, count]) => ({ provider_name, count }))
				.sort((a, b) => b.count - a.count);

			result[categoryKey] = {
				list: sorted.slice(0, MAX_CATEGORY_PROVIDERS),
				total: sorted.length,
			};
		});

		return result;
	}, [allGames]);

	// Suppress hover cards from auto-opening until the user moves the mouse (used after launching a game)
	const [suppressHoverCards, setSuppressHoverCards] = useState(false);
	const lastSuppressPositionRef = useRef<{ x: number; y: number } | null>(
		null
	);
	useEffect(() => {
		if (!suppressHoverCards) return;
		const handlePointerMove = (e: PointerEvent) => {
			const last = lastSuppressPositionRef.current;
			if (!last) {
				setSuppressHoverCards(false);
				return;
			}
			const dx = Math.abs(e.clientX - last.x);
			const dy = Math.abs(e.clientY - last.y);
			if (dx + dy > 3) {
				setSuppressHoverCards(false);
				lastSuppressPositionRef.current = null;
			}
		};
		document.addEventListener("pointermove", handlePointerMove);
		return () =>
			document.removeEventListener("pointermove", handlePointerMove);
	}, [suppressHoverCards]);

	const CategoryProvidersList = ({
		providers,
		totalProviders,
		categoryTitle,
		onClose,
		onGameTrigger,
	}: {
		providers: Array<{ provider_name: string; count: number }>;
		totalProviders?: number;
		categoryTitle: string;
		onClose?: () => void;
		onGameTrigger?: (e: React.MouseEvent) => void;
	}) => {
		const handleProviderClick = (
			providerName: string,
			e: React.MouseEvent
		) => {
			e.preventDefault();
			onGameTrigger?.(e);
			handleMobileNavigation();
			if (categoryTitle.toUpperCase() === "LIVE CASINO") {
				if (!isLoggedIn) {
					onClose?.();
					login();
					return;
				}
				router.replace(`/getLobby/${decodeURIComponent(providerName)}`);
			} else {
				// Convert to SEO-friendly URL format (lowercase with hyphens)
				const seoProvider = providerName
					.toLowerCase()
					.trim()
					.replace(/\s+/g, "-")
					.replace(/\./g, "");
				const seoCategory = categoryTitle
					.toLowerCase()
					.trim()
					.replace(/\s+/g, "-");
				router.push(`/games/${seoProvider}/${seoCategory}`);
			}
		};
		// Add custom Evolution provider for Live Casino category
		const isLiveCasino = categoryTitle.toUpperCase() === "LIVE CASINO";
		const hasEvolution = providers.some(
			(p) => p.provider_name.toLowerCase() === "evolution"
		);
		const displayProviders =
			isLiveCasino && !hasEvolution
				? [{ provider_name: "Evolution", count: 0 }, ...providers]
				: providers;

		const providerCount = totalProviders ?? displayProviders.length;
		const isTruncated = providerCount > displayProviders.length;
		return (
			<div
				className={cn(
					"h-[90dvh] flex flex-col w-72 mb-2 bg-sidebar border border-border/60 rounded-xl shadow-sm"
				)}
			>
				<div className="px-4 py-1 border-b border-border/60 bg-muted/20 rounded-t-xl flex-shrink-0">
					<h4 className="font-semibold text-foreground text-sm uppercase">
						{categoryTitle} Providers
					</h4>
					<div className="flex justify-between items-center mb-1">
						<p className="text-xs text-muted-foreground mt-1">
							{providerCount} provider
							{providerCount !== 1 ? "s" : ""} available
						</p>
						{isTruncated && (
							<p className="text-[11px] text-muted-foreground/80">
								Showing top {displayProviders.length}
							</p>
						)}
						<Link
							href={
								gameCategories.find(
									(c) =>
										c.title.toUpperCase() ===
										categoryTitle.toUpperCase()
								)?.url || "/"
							}
							prefetch={false}
							onClick={handleMobileNavigation}
						>
							<span className="border rounded-2xl text-[11px] px-2 py-1 hover:bg-muted/40 hover:text-foreground">
								View all
							</span>
						</Link>
						{/* <button className="text-xs">View all</button> */}
					</div>
				</div>
				<div className="flex-1 overflow-hidden">
					{displayProviders.length ? (
						<ScrollArea className="flex-1 h-full">
							<div className="space-y-1.5 p-2 pr-2 pb-6">
								{displayProviders.map((p) => (
									<div
										key={p.provider_name}
										onClick={(e) =>
											handleProviderClick(
												p.provider_name,
												e
											)
										}
										className="group rounded-lg bg-muted/10 hover:bg-muted/20 border border-border hover:border-primary/50 cursor-pointer py-2 px-2 flex items-center justify-between"
									>
										<div className="flex items-center gap-3 min-w-0">
											<span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
											<span className="text-sm font-medium text-foreground truncate">
												{p.provider_name}
											</span>
										</div>
										<div className="flex items-center gap-2 ml-2 flex-shrink-0">
											{p.count && (
												<span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
													{p.count}
												</span>
											)}
											<svg
												className="w-4 h-4 text-foreground/60"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
					) : (
						<div className="flex-1 flex items-center justify-center">
							<p className="text-sm text-muted-foreground">
								No providers
							</p>
						</div>
					)}
				</div>
			</div>
		);
	};

	const resolveTitle = (title: string) => {
		if (title.includes(".")) {
			const [ns, ...rest] = title.split(".");
			const key = rest.join(".");
			if (ns === "navigation") return tNav(key);
			if (ns === "sidebar") return tSidebar(key);
		}
		return title;
	};

	const renderLink = (item: NavItem) => (
		<SidebarMenuItem key={item.title}>
			<SidebarMenuButton
				asChild
				isActive={item.isActive}
				tooltip={item.items ? undefined : resolveTitle(item.title)}
				className="group-data-[collapsible=icon]:bg-accent/80"
			>
				<Link
					href={item.url}
					className="flex items-center justify-between w-full font-semibold lg:px-4 lg:py-2 tracking-wide"
					prefetch={false}
					onClick={handleMobileNavigation}
				>
					<div className="flex items-center gap-5">
						{item.icon && (
							<FontAwesomeIcon
								icon={item.icon}
								className="text-foreground"
							/>
						)}
						<span className="tracking-wide leading-snug">
							{resolveTitle(item.title)}
						</span>
					</div>
					{item.badge && (
						<Badge
							variant={item.badgeVariant || "default"}
							className="ml-auto text-xs"
						>
							{resolveTitle(item.badge)}
						</Badge>
					)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);

	const renderCollapsible = (item: NavItem) => (
		<Collapsible
			asChild
			defaultOpen={item.isActive}
			className="group/collapsible"
			key={item.title}
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						tooltip={resolveTitle(item.title)}
						className="group-data-[collapsible=icon]:bg-accent/80 "
					>
						{item.icon && (
							<FontAwesomeIcon
								icon={item.icon}
								className="text-foreground"
							/>
						)}
						<span>{resolveTitle(item.title)}</span>
						<FontAwesomeIcon
							icon={faChevronRight}
							className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
						/>
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.items?.map((sub) => (
							<SidebarMenuSubItem key={sub.title}>
								<SidebarMenuSubButton asChild>
									<Link
										href={sub.url}
										className="flex justify-between items-center w-full"
										prefetch={false}
										onClick={handleMobileNavigation}
									>
										<span>{sub.title}</span>
										{sub.players && (
											<span className="text-xs text-primary font-mono">
												{sub.players}
											</span>
										)}
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);

	const StaticCategoryItem = ({ category }: { category: GameCategory }) => {
		const displayTitle = (() => {
			if (category.title.includes(".")) {
				const [ns, ...rest] = category.title.split(".");
				const key = rest.join(".");
				if (ns === "games") return tGames(key);
			}
			const k = category.title.toUpperCase();
			if (k === "POKER") return tGames("poker");
			if (k === "LOTTERY") return tGames("lottery");
			if (k === "FUTURES") return tGames("futures");
			if (k === "SWAP") return tGames("swap");
			if (k === "VR") return tGames("vr");
			return category.title;
		})();
		const isAction = ["games.swap", "games.vr", "games.futures"].includes(
			category.title.toLowerCase()
		);
		return (
			<SidebarMenuItem key={category.title}>
				<SidebarMenuButton
					tooltip={displayTitle}
					asChild={!isAction}
					onClick={
						isAction
							? (e) => {
									handleStaticCategoryClick(category, e);
							  }
							: undefined
					}
					className="lg:px-4 lg:py-1 tracking-wide font-semibold cursor-pointer group-data-[collapsible=icon]:bg-accent/80 "
				>
					{isAction ? (
						<div className="flex items-center tracking-wide justify-between w-full">
							<div className="flex items-center gap-5">
								{category.icon && (
									<FontAwesomeIcon
										icon={category.icon}
										className="text-foreground"
									/>
								)}
								<span className="leading-0">
									{displayTitle}
								</span>
							</div>
							{category.count && (
								<span className="text-xs text-muted-foreground count-badge">
									{category.count === 696969 ? (
										<FontAwesomeIcon icon={faArrowRight} />
									) : (
										category.count
									)}
								</span>
							)}
						</div>
					) : (
						<Link
							href={category.url}
							className="flex items-center tracking-wide justify-between w-full"
							prefetch={false}
							onClick={handleMobileNavigation}
						>
							<div className="flex items-center gap-5">
								{category.icon && (
									<FontAwesomeIcon
										icon={category.icon}
										className="text-foreground"
									/>
								)}
								<span className="leading-0">
									{displayTitle}
								</span>
							</div>
							{category.count && (
								<span className="text-xs text-muted-foreground count-badge">
									{category.count === 696969 ? (
										<FontAwesomeIcon icon={faArrowRight} />
									) : (
										category.count
									)}
								</span>
							)}
						</Link>
					)}
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	};

	const GameCategoryItem = ({ category }: { category: GameCategory }) => {
		const categoryProviders =
			providersByCategory[normalizeCategoryKey(category.title)];
		const providersForCategory = categoryProviders?.list ?? [];
		const totalProviders =
			categoryProviders?.total ?? providersForCategory.length;
		// Controlled open state so clicking inside does NOT instantly close
		const [open, setOpen] = useState(false);
		const triggerRef = useRef<HTMLDivElement | null>(null);
		const contentRef = useRef<HTMLDivElement | null>(null);
		const ignoreNextCloseRef = useRef(false);
		const hoverIntentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
		const lastMousePositionRef = useRef<{ x: number; y: number } | null>(
			null
		);
		const isMovingTowardsContentRef = useRef(false);

		// Radix will attempt to close on pointer leave; we selectively accept open=true only.
		const handleRadixOpenChange = (next: boolean) => {
			if (next) {
				setOpen(true);
				return;
			}
			// We ignore close requests; real close handled by global pointer tracking below
			if (!ignoreNextCloseRef.current) return;
			ignoreNextCloseRef.current = false;
		};

		// Helper to check if mouse is moving towards the hover card (triangular safe zone)
		const isMovingTowardsCard = (
			mouseX: number,
			mouseY: number
		): boolean => {
			const tRect = triggerRef.current?.getBoundingClientRect();
			const cRect = contentRef.current?.getBoundingClientRect();
			const last = lastMousePositionRef.current;

			if (!tRect || !cRect || !last) return false;

			// Calculate movement vector
			const dx = mouseX - last.x;
			const dy = mouseY - last.y;

			// If movement is very small, don't change state
			if (Math.abs(dx) < 2 && Math.abs(dy) < 2)
				return isMovingTowardsContentRef.current;

			// Define the safe zone triangle points
			// Point A: current mouse position
			// Point B: top-right corner of trigger or top-left of content
			// Point C: bottom-right corner of trigger or bottom-left of content
			// const contentLeft = cRect.left;
			const contentTop = cRect.top;
			const contentBottom = cRect.bottom;

			// Check if mouse is moving towards the content area (rightward with appropriate Y)
			const movingRight = dx > 0;
			const yInContentRange =
				mouseY >= contentTop - 50 && mouseY <= contentBottom + 50;

			return movingRight && yInContentRange;
		};

		// Pointer tracking: close only when pointer is outside BOTH trigger and content
		// AND not moving towards the content
		useEffect(() => {
			if (!open) return;
			const handlePointerMove = (e: PointerEvent) => {
				const x = e.clientX;
				const y = e.clientY;
				const tRect = triggerRef.current?.getBoundingClientRect();
				const cRect = contentRef.current?.getBoundingClientRect();

				// Update movement tracking
				if (lastMousePositionRef.current) {
					isMovingTowardsContentRef.current = isMovingTowardsCard(
						x,
						y
					);
				}
				lastMousePositionRef.current = { x, y };

				const insideTrigger =
					tRect &&
					x >= tRect.left &&
					x <= tRect.right &&
					y >= tRect.top &&
					y <= tRect.bottom;
				const insideContent =
					cRect &&
					x >= cRect.left &&
					x <= cRect.right &&
					y >= cRect.top &&
					y <= cRect.bottom;

				// Create a buffer zone between trigger and content
				const inBufferZone =
					tRect &&
					cRect &&
					x >= tRect.right &&
					x <= cRect.left + 20 &&
					y >= Math.min(tRect.top, cRect.top) - 20 &&
					y <= Math.max(tRect.bottom, cRect.bottom) + 20;

				// Don't close if:
				// 1. Inside trigger or content
				// 2. In buffer zone between them
				// 3. Moving towards the content
				if (
					insideTrigger ||
					insideContent ||
					inBufferZone ||
					isMovingTowardsContentRef.current
				) {
					return;
				}

				setOpen(false);
				lastMousePositionRef.current = null;
				isMovingTowardsContentRef.current = false;
			};
			document.addEventListener("pointermove", handlePointerMove);
			return () => {
				document.removeEventListener("pointermove", handlePointerMove);
			};
		}, [open]);

		// Cleanup timeout on unmount
		useEffect(() => {
			return () => {
				if (hoverIntentTimeoutRef.current) {
					clearTimeout(hoverIntentTimeoutRef.current);
				}
			};
		}, []);

		// Handle mouse enter with intent detection
		const handleMouseEnter = () => {
			if (suppressHoverCards) return;

			// Clear any existing timeout
			if (hoverIntentTimeoutRef.current) {
				clearTimeout(hoverIntentTimeoutRef.current);
			}

			// Add a small delay before opening to detect intent
			hoverIntentTimeoutRef.current = setTimeout(() => {
				setOpen(true);
				lastMousePositionRef.current = null;
				isMovingTowardsContentRef.current = false;
			}, 100); // 100ms delay for intent detection
		};

		// Handle mouse leave from trigger
		const handleMouseLeave = (e: React.MouseEvent) => {
			// Clear the opening timeout if user leaves quickly
			if (hoverIntentTimeoutRef.current) {
				clearTimeout(hoverIntentTimeoutRef.current);
				hoverIntentTimeoutRef.current = null;
			}

			// Initialize mouse tracking
			lastMousePositionRef.current = { x: e.clientX, y: e.clientY };

			// Don't close immediately - let the pointer tracking handle it
		};

		// Open on keyboard focus of trigger for accessibility
		const handleTriggerFocus = () => setOpen(true);
		const handleTriggerBlur = () => {
			// Close only if focus moved completely outside trigger + content
			requestAnimationFrame(() => {
				const active = document.activeElement;
				if (
					contentRef.current &&
					(active === contentRef.current ||
						contentRef.current.contains(active))
				) {
					return;
				}
				if (triggerRef.current?.contains(active)) return;
				setOpen(false);
			});
		};

		// Ensure clicks inside content don't immediately trigger close attempts
		const preventCloseOnMouseDown = (e: React.MouseEvent) => {
			ignoreNextCloseRef.current = true;
			// Stop propagation so Radix doesn't think we've left hoverable area prematurely
			e.stopPropagation();
		};

		const displayTitle = (() => {
			const k = category.title.toUpperCase();
			if (k === "SLOT") return tGames("slots");
			if (k === "SPORTS") return tGames("sports");
			if (k === "LIVE CASINO") return tGames("liveCasino");
			return category.title;
		})();

		return (
			<SidebarMenuItem key={category.title}>
				<div className="flex items-center w-full">
					<HoverCard
						openDelay={150}
						closeDelay={200}
						open={open}
						onOpenChange={handleRadixOpenChange}
					>
						<HoverCardTrigger asChild>
							<div
								className="flex-1"
								ref={triggerRef}
								onMouseEnter={handleMouseEnter}
								onMouseLeave={handleMouseLeave}
							>
								<SidebarMenuButton asChild>
									<Link
										href={category.url}
										className="flex items-center lg:px-4 lg:py-2 tracking-wide font-semibold justify-between w-full hover:bg-muted/30 transition-all duration-200 rounded-lg group-data-[collapsible=icon]:bg-accent/80"
										prefetch={false}
										onFocus={handleTriggerFocus}
										onBlur={handleTriggerBlur}
										onClick={handleMobileNavigation}
									>
										<div className="flex items-center gap-5">
											{category.icon && (
												<FontAwesomeIcon
													icon={category.icon}
													className="text-foreground"
												/>
											)}
											<span className="leading-0">
												{displayTitle}
											</span>
										</div>
										<div className="flex items-center gap-3">
											{category.badge && (
												<Badge
													variant={
														category.badgeVariant ||
														"secondary"
													}
													className="text-xs bg-primary text-foreground"
												>
													{category.badge}
												</Badge>
											)}
											{category.count && (
												<span className="text-xs text-muted-foreground count-badge">
													{category.count}
												</span>
											)}
										</div>
									</Link>
								</SidebarMenuButton>
							</div>
						</HoverCardTrigger>
						<HoverCardContent
							side="right"
							align="start"
							className="w-auto p-0 bg-transparent border-none shadow-none"
							sideOffset={0}
							ref={contentRef}
							onMouseDown={preventCloseOnMouseDown}
							onMouseEnter={() => {
								setOpen(true);
								// Clear tracking when entering content
								isMovingTowardsContentRef.current = false;
							}}
						>
							<CategoryProvidersList
								providers={providersForCategory}
								totalProviders={totalProviders}
								categoryTitle={category.title}
								onClose={() => setOpen(false)}
								onGameTrigger={(e) => {
									lastSuppressPositionRef.current = {
										x: e.clientX,
										y: e.clientY,
									};
									setSuppressHoverCards(true);
								}}
							/>
						</HoverCardContent>
					</HoverCard>
				</div>
			</SidebarMenuItem>
		);
	};

	return (
		<div className="group-data-[collapsible=icon]:space-y-4 -space-y-1">
			{items.length > 0 && (
				<SidebarGroup className="group-data-[collapsible=icon]:p-0!">
					<SidebarGroupLabel className="text-primary font-semibold group-data-[collapsible=icon]:hidden">
						{tSidebar("navigation")}
					</SidebarGroupLabel>
					<SidebarMenu className="group-data-[collapsible=icon]:gap-2">
						{items.map((item) =>
							item.items?.length
								? renderCollapsible(item)
								: renderLink(item)
						)}
					</SidebarMenu>
				</SidebarGroup>
			)}
			<Separator className="!w-[90%] mx-auto my-1 group-data-[collapsible=icon]:mb-4" />
			{(gameCategories.length > 0 || staticGameCategories.length > 0) && (
				<SidebarGroup className="group-data-[collapsible=icon]:p-0!">
					<SidebarGroupLabel className="text-primary group-data-[collapsible=icon]:hidden">
						{tSidebar("games")}
					</SidebarGroupLabel>
					<SidebarMenu className="group-data-[collapsible=icon]:gap-2">
						{gameCategories.map((c) => (
							<GameCategoryItem key={c.title} category={c} />
						))}
						{staticGameCategories.map((c) => (
							<StaticCategoryItem key={c.title} category={c} />
						))}
					</SidebarMenu>
				</SidebarGroup>
			)}
			<Separator className="!w-[90%] mx-auto my-1 group-data-[collapsible=icon]:mb-4" />
			{providers.length > 0 && (
				<SidebarGroup className="group-data-[collapsible=icon]:p-0!">
					<Collapsible
						asChild
						open={isTrendingNowOpen}
						onOpenChange={setIsTrendingNowOpen}
						className="group/collapsible"
					>
						<SidebarMenuItem className="list-none">
							<CollapsibleTrigger asChild>
								<SidebarMenuButton
									tooltip="Trending Now"
									onClick={() => {
										if (!open) {
											toggleSidebar();
											setIsTrendingNowOpen(true);
										} else {
											setIsTrendingNowOpen(
												!isTrendingNowOpen
											);
										}
									}}
									className="group-data-[collapsible=icon]:bg-accent/80"
								>
									<span className="group-data-[collapsible=icon]:hidden text-primary text-xs font-semibold">
										{tSidebar("trendingNow")}
									</span>
									<FontAwesomeIcon
										icon={faChevronRight}
										className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
									/>
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub className="border-none mx-0 px-0">
									<div className="space-y-1.5 w-full overflow-y-auto">
										{limitedProviders.map(
											(p) =>
												p.url && ( // This check ensures the Link is only rendered if p.url is not undefined or an empty string
													<SidebarMenuSubItem
														key={p.title}
														className="list-none"
													>
														<div className="w-full">
															<SidebarMenuSubButton
																asChild
																className="h-auto py-1.5"
															>
																<Link
																	href={p.url}
																	className="flex font-medium tracking-wider items-center justify-between w-full hover:bg-muted/30 transition-all duration-300"
																	prefetch={
																		false
																	}
																	onClick={
																		handleMobileNavigation
																	}
																>
																	<span className="text-sm text-foreground">
																		{
																			p.title
																		}
																	</span>
																	{p.count && (
																		<span className="text-xs text-foreground/80 bg-primary/20 px-2 py-0.5 rounded-full">
																			{
																				p.count
																			}
																		</span>
																	)}
																</Link>
															</SidebarMenuSubButton>
														</div>
													</SidebarMenuSubItem>
												)
										)}
										{remainingProvidersCount > 0 && (
											<SidebarMenuSubItem className="list-none">
												<div className="w-full">
													<SidebarMenuSubButton
														asChild
														size="sm"
														className="!h-auto !min-h-[1.75rem] !items-start !py-1"
													>
														<Link
															href="/providers"
															className="flex items-center justify-between w-full hover:bg-primary/20 transition-all duration-300 border-t border-border/50 py-2 mt-4 gap-2"
															prefetch={false}
															onClick={
																handleMobileNavigation
															}
														>
															<span className="text-sm text-foreground font-medium leading-tight flex-1 break-words">
																{tSidebar(
																	"allTopProviders"
																)}
															</span>
															<div className="flex items-center gap-2 flex-shrink-0">
																<span className="text-xs text-foreground/80 bg-primary/20 px-2 py-0.5 rounded-full whitespace-nowrap">
																	+
																	{
																		remainingProvidersCount
																	}
																</span>
																<FontAwesomeIcon
																	icon={
																		faChevronRight
																	}
																	fontSize={
																		12
																	}
																	className="text-foreground"
																/>
															</div>
														</Link>
													</SidebarMenuSubButton>
												</div>
											</SidebarMenuSubItem>
										)}
									</div>
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				</SidebarGroup>
			)}
			{aboutSection && (
				<>
					<Separator className="!w-[90%] mx-auto my-1 group-data-[collapsible=icon]:mb-4" />
					<SidebarGroup className="group-data-[collapsible=icon]:p-0!">
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={aboutSection.isActive}
									tooltip={tNav("about")}
									className="group-data-[collapsible=icon]:bg-accent/80 font-semibold lg:px-4 lg:py-2 tracking-wide"
								>
									<Link
										href={aboutSection.url}
										className="flex items-center justify-between w-full"
										prefetch={false}
										onClick={handleMobileNavigation}
									>
										<div className="flex items-center gap-5">
											{aboutSection.icon && (
												<FontAwesomeIcon
													icon={aboutSection.icon}
													className="text-foreground"
												/>
											)}
											<span className="tracking-wide leading-snug">
												{tNav("about")}
											</span>
										</div>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				</>
			)}
		</div>
	);
}
