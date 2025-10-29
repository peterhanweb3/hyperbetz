"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import { BonusClaimsTab } from "@/components/features/bonus/claims-tab/bonus-claims-tab";
import { BonusFallback } from "@/components/features/bonus/bonus-fallback";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { Button } from "@/components/ui/button";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BonusRatesTab } from "@/components/features/bonus/rates-tab/bonus-rates-tab";
import { CalculatorTab } from "@/components/features/bonus/calculator-tab/calculator-tab";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";
import { useT } from "@/hooks/useI18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/pro-light-svg-icons";
import { BonusDashboardTab } from "@/components/features/bonus/dashboard-tab/bonus-dahboard-tab";

export default function BonusPage() {
	const t = useT();
	const { user, isLoading } = useDynamicAuth();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<string>("dashboard");

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

				setIndicatorStyle({
					width: buttonRect.width - 8,
					left: buttonRect.left - containerRect.left + 4,
				});
			}
		};

		if (activeTab) {
			updateIndicator();
		}

		window.addEventListener("resize", updateIndicator);

		return () => {
			window.removeEventListener("resize", updateIndicator);
		};
	}, [activeTab]);

	// Select needed actions from store
	const fetchDashboard = useAppStore(
		(state) => state.bonus.dashboard.fetchData
	);
	const fetchRates = useAppStore((state) => state.bonus.rates.fetchRates);

	// Manual refresh function
	const handleRefresh = async () => {
		setIsRefreshing(true);

		const results = {
			dashboard: false,
			rates: false,
		};

		try {
			await fetchDashboard(true);
			results.dashboard = true;
		} catch (error) {
			console.error("Failed to refresh dashboard data:", error);
		}

		try {
			await fetchRates(true);
			results.rates = true;
		} catch (error) {
			console.error("Failed to refresh rates data:", error);
		}

		const successCount = Object.values(results).filter(Boolean).length;
		const totalCount = Object.keys(results).length;

		if (successCount === totalCount) {
			toast.success(t("bonus.refreshAllSuccess"));
		} else if (successCount > 0) {
			toast.success(
				t("bonus.refreshPartial", {
					success: successCount,
					total: totalCount,
				})
			);
		} else {
			toast.error(t("bonus.refreshFailed"));
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
			<div className="container mx-auto py-16 max-w-3xl">
				<div className="flex flex-col items-center justify-center text-center gap-6">
					<div className="space-y-2">
						<h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
							{t("bonus.loginPromptTitle")}
						</h1>
						<p className="text-muted-foreground text-sm">
							{t("bonus.loginPromptSubtitle")}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row items-center gap-4">
						<Button onClick={() => (window.location.href = "/")}>
							{t("bonus.goHome")}
						</Button>
						<DynamicWidget />
					</div>
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
						disabled={isRefreshing}
						variant="outline"
						size="sm"
						className="flex items-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-colors"
					>
						<FontAwesomeIcon
							icon={faRefresh}
							fontSize={16}
							className={` ${isRefreshing ? "animate-spin" : ""}`}
						/>
						<span className="hidden xs:inline">
							{isRefreshing
								? t("bonus.refreshing")
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
