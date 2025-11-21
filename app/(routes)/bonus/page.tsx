"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import { BonusDashboardTab } from "@/components/features/bonus/dashboard-tab/bonus-dashboard-tab";
import { BonusClaimsTab } from "@/components/features/bonus/claims-tab/bonus-claims-tab";
import { BonusFallback } from "@/components/features/bonus/bonus-fallback";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BonusRatesTab } from "@/components/features/bonus/rates-tab/bonus-rates-tab";
import { CalculatorTab } from "@/components/features/bonus/calculator-tab/calculator-tab";
import { useAppStore } from "@/store/store";
import { useT } from "@/hooks/useI18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/pro-light-svg-icons";
import useBonusClaims from "@/hooks/bonus/useBonusClaims";

export default function BonusPage() {
	const t = useT();
	const { user, isLoading } = useDynamicAuth();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [refreshCooldown, setRefreshCooldown] = useState(0);
	const [activeTab, setActiveTab] = useState<string>(
		user ? "dashboard" : "rates"
	);
	const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Pre-calculated widths for each tab
	const getTabStyle = (tab: string) => {
		switch (tab) {
			case "dashboard":
				return { width: 115, left: 4 };
			case "claims":
				return { width: 90, left: 123 };
			case "rates":
				return { width: 80, left: 217 };
			case "calculator":
				return { width: 110, left: 301 };
			default:
				return { width: 104, left: 4 };
		}
	};

	const [indicatorStyle, setIndicatorStyle] = useState(
		getTabStyle(activeTab)
	);
	const tabsRef = useRef<HTMLDivElement>(null);

	// Update sliding indicator position
	useEffect(() => {
		const updateIndicator = () => {
			if (!tabsRef.current) return;

			const activeButton = tabsRef.current.querySelector(
				`[data-value="${activeTab}"]`
			) as HTMLElement;

			if (activeButton) {
				const containerRect = tabsRef.current.getBoundingClientRect();
				const buttonRect = activeButton.getBoundingClientRect();

				// Calculate position relative to container
				const left = buttonRect.left - containerRect.left;

				setIndicatorStyle({
					width: buttonRect.width,
					left: left,
				});
			}
		};

		// Use requestAnimationFrame to ensure DOM is ready
		requestAnimationFrame(() => {
			updateIndicator();
		});

		window.addEventListener("resize", updateIndicator);

		return () => {
			window.removeEventListener("resize", updateIndicator);
		};
	}, [activeTab]);

	// Select needed actions from store
	const refreshAll = useAppStore((state) => state.bonus.manager.refreshAll);

	// Get claims refresh function from hook
	const { refresh: refreshClaims } = useBonusClaims();

	// Cleanup cooldown timer on unmount
	useEffect(() => {
		return () => {
			if (cooldownTimerRef.current) {
				clearInterval(cooldownTimerRef.current);
			}
		};
	}, []);

	// Set default tab to dashboard when user logs in
	const prevUserRef = useRef(user);
	useEffect(() => {
		const prevUser = prevUserRef.current;
		prevUserRef.current = user;

		// If user just logged in, set tab to dashboard
		if (user && !prevUser) {
			console.log("User logged in, setting tab to dashboard...");
			setActiveTab("dashboard");
		}
	}, [user]);

	// Manual refresh function with cooldown
	const handleRefresh = async () => {
		// If already refreshing or in cooldown, do nothing
		if (isRefreshing) return;

		setIsRefreshing(true);
		setRefreshCooldown(10); // Start 10 second cooldown

		// Start countdown timer
		cooldownTimerRef.current = setInterval(() => {
			setRefreshCooldown((prev) => {
				if (prev <= 1) {
					if (cooldownTimerRef.current) {
						clearInterval(cooldownTimerRef.current);
						cooldownTimerRef.current = null;
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		// Refresh all bonus data
		try {
			console.log("Refreshing all bonus data...");
			await Promise.all([refreshAll(true), refreshClaims()]);
		} catch (error) {
			console.error("Failed to refresh bonus data:", error);
		}

		setIsRefreshing(false);
	};

	// Loading state placeholder
	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="h-8 w-56 bg-muted rounded-lg animate-pulse mb-6" />
				<BonusFallback />
			</div>
		);
	}
	if (!user) {
		return (
			<div className="min-h-screen bg-background">
				<div className="py-4 sm:py-6 space-y-6 sm:space-y-8">
					{/* Header Section */}
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="space-y-2 sm:space-y-4">
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
								{t("bonus.title")}
							</h1>
						</div>
					</div>

					<Suspense fallback={<BonusFallback />}>
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							{/* Tab Navigation - Only show Rates and Calculator */}
							<div className="flex mb-6 sm:mb-8 overflow-x-auto">
								<div
									ref={tabsRef}
									className="relative inline-flex p-1 bg-muted/50 rounded-lg border border-border/50 min-w-full sm:min-w-0"
								>
									{/* Sliding background indicator */}
									<div
										className="absolute h-[calc(100%-8px)] top-1 left-1 rounded-md bg-background shadow-sm border border-border/50 z-0 transition-all duration-300 ease-out"
										style={{
											width: `calc(${indicatorStyle.width}px - 8px)`,
											transform: `translateX(${
												indicatorStyle.left - 4
											}px)`,
										}}
									/>

									{/* Tab buttons - Only Rates and Calculator visible */}
									<div className="relative z-10 flex w-full sm:w-auto">
										<button
											data-value="rates"
											onClick={() =>
												setActiveTab("rates")
											}
											className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
												activeTab === "rates"
													? "text-foreground"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											{t("bonus.tabs.rates")}
										</button>
										<button
											data-value="calculator"
											onClick={() =>
												setActiveTab("calculator")
											}
											className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
												activeTab === "calculator"
													? "text-foreground"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											{t("bonus.tabs.calculator")}
										</button>
									</div>
								</div>
							</div>

							{/* Tab Content */}
							<div className="min-h-[400px] sm:min-h-[600px]">
								<TabsContent value="rates" className="mt-0">
									<BonusRatesTab />
								</TabsContent>
								<TabsContent
									value="calculator"
									className="mt-0"
								>
									<CalculatorTab context="bonus" />
								</TabsContent>
							</div>
						</Tabs>
					</Suspense>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="py-4 sm:py-6 space-y-6 sm:space-y-8">
				{/* Header Section with Refresh Button */}
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="space-y-2 sm:space-y-4">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
							{t("bonus.title")}
						</h1>
					</div>
					<Button
						onClick={handleRefresh}
						disabled={isRefreshing || refreshCooldown > 0}
						variant="outline"
						size="sm"
						className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-colors disabled:opacity-50"
					>
						<FontAwesomeIcon
							icon={faRefresh}
							fontSize={16}
							className={` ${isRefreshing ? "animate-spin" : ""}`}
						/>
						<span className="hidden xs:inline">
							{isRefreshing
								? t("bonus.refreshing")
								: refreshCooldown > 0
								? `${refreshCooldown}s`
								: t("bonus.refresh")}
						</span>
					</Button>
				</div>

				<Suspense fallback={<BonusFallback />}>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						{/* Clean Tab Navigation with sliding indicator */}
						<div className="flex mb-6 sm:mb-8 overflow-x-auto">
							<div
								ref={tabsRef}
								className="relative inline-flex p-1 bg-muted/50 rounded-lg border border-border/50 min-w-full sm:min-w-0"
							>
								{/* Sliding background indicator */}
								<div
									className="absolute h-[calc(100%-8px)] top-1 left-1 rounded-md bg-background shadow-sm border border-border/50 z-0 transition-all duration-300 ease-out"
									style={{
										width: `calc(${indicatorStyle.width}px - 8px)`,
										transform: `translateX(${
											indicatorStyle.left - 4
										}px)`,
									}}
								/>

								{/* Tab buttons */}
								<div className="relative z-10 flex w-full sm:w-auto">
									<button
										data-value="dashboard"
										onClick={() =>
											setActiveTab("dashboard")
										}
										className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "dashboard"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("bonus.tabs.dashboard")}
									</button>
									<button
										data-value="claims"
										onClick={() => setActiveTab("claims")}
										className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "claims"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("bonus.tabs.claims")}
									</button>
									<button
										data-value="rates"
										onClick={() => setActiveTab("rates")}
										className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "rates"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("bonus.tabs.rates")}
									</button>
									<button
										data-value="calculator"
										onClick={() =>
											setActiveTab("calculator")
										}
										className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "calculator"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("bonus.tabs.calculator")}
									</button>
								</div>
							</div>
						</div>

						{/* Tab Content */}
						<div className="min-h-[400px] sm:min-h-[600px]">
							<TabsContent value="dashboard" className="mt-0">
								<BonusDashboardTab />
							</TabsContent>
							<TabsContent value="claims" className="mt-0">
								<BonusClaimsTab />
							</TabsContent>
							<TabsContent value="rates" className="mt-0">
								<BonusRatesTab />
							</TabsContent>
							<TabsContent value="calculator" className="mt-0">
								<CalculatorTab context="bonus" />
							</TabsContent>
						</div>
					</Tabs>
				</Suspense>
			</div>
		</div>
	);
}
