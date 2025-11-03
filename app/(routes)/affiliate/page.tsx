// "use client";

// import { Suspense } from "react";
// import { DashboardTab } from "@/components/features/affiliate/dashboard-tab/dashboard-tab";
// import { AffiliateFallback } from "@/components/features/affiliate/affiliate-fallback";
// import { useDynamicAuth } from "@/hooks/useDynamicAuth";
// import { Button } from "@/components/ui/button";
// import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { RatesTab } from "@/components/features/affiliate/rates-tab/rates-tab";
// import { CalculatorTab } from "@/components/features/affiliate/calculator-tab/calculator-tab";
// // import { ReferralsTab } from "@/components/features/affiliate/referral-tab";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// export default function AffiliatePage() {
// 	const { user, isLoading } = useDynamicAuth();

// 	// Loading state placeholder (reuse primary skeleton theme but lighter here)
// 	if (isLoading) {
// 		return (
// 			<div className="container mx-auto py-8">
// 				<div className="h-8 w-56 bg-muted rounded-lg animate-pulse mb-6" />
// 				<AffiliateFallback />
// 			</div>
// 		);
// 	}

// 	if (!user) {
// 		return (
// 			<div className="container mx-auto py-16 max-w-3xl">
// 				<div className="flex flex-col items-center justify-center text-center gap-6">
// 					<div className="space-y-2">
// 						<h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
// 							Referral Program
// 						</h1>
// 						<p className="text-muted-foreground text-sm">
// 							Log in to view your referral stats, bonuses and
// 							claim rewards.
// 						</p>
// 					</div>
// 					<div className="flex flex-col sm:flex-row items-center gap-4">
// 						<Button onClick={() => (window.location.href = "/")}>
// 							Go to Home
// 						</Button>
// 						<DynamicWidget />
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="container mx-auto py-8">
// 			<h1 className="text-3xl font-semibold tracking-tight mb-6">
// 				Referral Program
// 			</h1>
// 			<Suspense fallback={<AffiliateFallback />}>
// 				<Tabs defaultValue="dashboard" className="w-full">
// 					{/* Update the grid columns to accommodate the new tab */}
// 					<TabsList className="grid w-full grid-cols-3 md:w-[600px]">
// 						<TabsTrigger value="dashboard">Dashboard</TabsTrigger>
// 						<TabsTrigger value="rates">Rates</TabsTrigger>
// 						<TabsTrigger value="calculator">Calculator</TabsTrigger>
// 						{/* <-- NEW TRIGGER */}
// 					</TabsList>

// 					<TabsContent value="dashboard" className="mt-6">
// 						<DashboardTab />
// 					</TabsContent>

// 					<TabsContent value="rates" className="mt-6">
// 						<RatesTab />
// 					</TabsContent>

// 					<TabsContent value="calculator" className="mt-6">
// 						<CalculatorTab />
// 					</TabsContent>
// 				</Tabs>
// 			</Suspense>
// 		</div>
// 	);
// }

"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import { DashboardTab } from "@/components/features/affiliate/dashboard-tab/dashboard-tab";
import { AffiliateFallback } from "@/components/features/affiliate/affiliate-fallback";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { Button } from "@/components/ui/button";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RatesTab } from "@/components/features/affiliate/rates-tab/rates-tab";
import { CalculatorTab } from "@/components/features/affiliate/calculator-tab/calculator-tab";
// import { RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/store";
import { useT } from "@/hooks/useI18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/pro-light-svg-icons";
// import { ReferralsTab } from "@/components/features/affiliate/referral-tab";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function AffiliatePage() {
	const t = useT();
	const { user, isLoading } = useDynamicAuth();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [refreshCooldown, setRefreshCooldown] = useState(0);
	const [activeTab, setActiveTab] = useState<string>("dashboard");
	const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Pre-calculated widths for each tab (approximate, will be refined by useEffect)
	const getTabStyle = (tab: string) => {
		switch (tab) {
			case "dashboard":
				return { width: 115, left: 4 }; // "Dashboard" button width
			case "rates":
				return { width: 156, left: 112 }; // "Commission Rates" button width
			case "calculator":
				return { width: 104, left: 272 }; // "Calculator" button width
			default:
				return { width: 104, left: 4 };
		}
	};

	const [indicatorStyle, setIndicatorStyle] = useState(
		getTabStyle(activeTab)
	);
	const tabsRef = useRef<HTMLDivElement>(null); // Update sliding indicator position (only for fine-tuning, not initial display)
	useEffect(() => {
		const updateIndicator = () => {
			if (!tabsRef.current) return;

			const activeButton = tabsRef.current.querySelector(
				`[data-value="${activeTab}"]`
			) as HTMLElement;

			if (activeButton) {
				const containerRect = tabsRef.current.getBoundingClientRect();
				const buttonRect = activeButton.getBoundingClientRect();

				setIndicatorStyle({
					width: buttonRect.width - 8, // Account for padding
					left: buttonRect.left - containerRect.left + 4, // Account for container padding
				});
			}
		};

		// Only update on tab change (not initial load since we have defaults)
		if (activeTab) {
			updateIndicator();
		}

		window.addEventListener("resize", updateIndicator);

		return () => {
			window.removeEventListener("resize", updateIndicator);
		};
	}, [activeTab]); // Select needed actions from store to avoid getState in render
	const fetchDownline = useAppStore(
		(state) => state.affiliate.downline.fetchDownline
	);
	const fetchRates = useAppStore((state) => state.affiliate.rates.fetchRates);
	const fetchReferrals = useAppStore(
		(state) => state.affiliate.referrals.fetchReferrals
	);

	// Manual refresh function
	const handleRefresh = async () => {
		// If already refreshing or in cooldown, do nothing
		if (isRefreshing || refreshCooldown > 0) return;

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

		// Track success/failure for each refresh operation
		const results = {
			downline: false,
			rates: false,
			referrals: false,
		};

		// Refresh each data source independently
		try {
			await fetchDownline(true);
			results.downline = true;
		} catch (error) {
			console.error("Failed to refresh downline data:", error);
		}

		try {
			await fetchRates(true);
			results.rates = true;
		} catch (error) {
			console.error("Failed to refresh rates data:", error);
		}

		try {
			await fetchReferrals(true);
			results.referrals = true;
		} catch (error) {
			console.error("Failed to refresh referrals data:", error);
		}

		setIsRefreshing(false);
	};
	// Loading state placeholder (reuse primary skeleton theme but lighter here)
	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="h-8 w-56 bg-muted rounded-lg animate-pulse mb-6" />
				<AffiliateFallback />
			</div>
		);
	}
	if (!user) {
		return (
			<div className="container mx-auto py-16 max-w-3xl">
				<div className="flex flex-col items-center justify-center text-center gap-6">
					<div className="space-y-2">
						<h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
							{t("affiliate.loginPromptTitle")}
						</h1>
						<p className="text-muted-foreground text-sm">
							{t("affiliate.loginPromptSubtitle")}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row items-center gap-4">
						<Button onClick={() => (window.location.href = "/")}>
							{t("affiliate.goHome")}
						</Button>
						<DynamicWidget />
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="min-h-screen bg-background">
			<div className="py-4 sm:py-6 space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
				{/* Header Section with Refresh Button */}
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="space-y-2 sm:space-y-4">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
							{t("affiliate.title")}
						</h1>
					</div>
					<Button
						onClick={handleRefresh}
						disabled={isRefreshing || refreshCooldown > 0}
						variant="outline"
						size="sm"
						className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
					>
						{/* <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            /> */}
						<FontAwesomeIcon
							icon={faRefresh}
							fontSize={16}
							className={` ${isRefreshing ? "animate-spin" : ""}`}
						/>
						<span className="hidden xs:inline">
							{isRefreshing
								? t("affiliate.refreshing")
								: refreshCooldown > 0
								? `${refreshCooldown}s`
								: t("affiliate.refresh")}
						</span>
					</Button>
				</div>

				<Suspense fallback={<AffiliateFallback />}>
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
									className="absolute h-[calc(100%-8px)] top-1 rounded-md bg-background shadow-sm border border-border/50 z-0 transition-all duration-300 ease-out"
									style={{
										width: indicatorStyle.width,
										transform: `translateX(${indicatorStyle.left}px)`,
									}}
								/>

								{/* Tab buttons */}
								<div className="relative z-10 flex w-full sm:w-auto">
									<button
										data-value="dashboard"
										onClick={() =>
											setActiveTab("dashboard")
										}
										className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "dashboard"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("affiliate.tabs.dashboard")}
									</button>
									<button
										data-value="rates"
										onClick={() => setActiveTab("rates")}
										className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "rates"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("affiliate.tabs.rates")}
									</button>
									<button
										data-value="calculator"
										onClick={() =>
											setActiveTab("calculator")
										}
										className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-md relative flex-1 sm:flex-initial ${
											activeTab === "calculator"
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{t("affiliate.tabs.calculator")}
									</button>
								</div>
							</div>
						</div>

						{/* Tab Content */}
						<div className="min-h-[400px] sm:min-h-[600px]">
							<TabsContent value="dashboard" className="mt-0">
								<DashboardTab />
							</TabsContent>
							<TabsContent value="rates" className="mt-0">
								<RatesTab />
							</TabsContent>
							<TabsContent value="calculator" className="mt-0">
								<CalculatorTab />
							</TabsContent>
						</div>
					</Tabs>
				</Suspense>
			</div>
		</div>
	);
}
