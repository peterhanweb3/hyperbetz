"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/store";
import {
	GetMemberBonusSuccessResponse,
	BonusRate,
} from "@/types/bonus/bonus.types";

export interface UseBonusDashboardResult {
	bonusData: GetMemberBonusSuccessResponse | null;
	bonusRates: BonusRate[];
	isLoading: boolean;
	isClaiming: boolean;
	isClaimDisabled: boolean;
	handleClaim: () => Promise<number | null>;
	refresh: (force?: boolean) => Promise<void>;
	lastClaimAmount: number | null;
}

export default function useBonusDashboard(): UseBonusDashboardResult {
	const dashboardSlice = useAppStore((state) => state.bonus.dashboard);
	const ratesSlice = useAppStore((state) => state.bonus.rates);
	const claimSlice = useAppStore((state) => state.bonus.claim);

	// Select actions once to avoid reaching for getState
	const initDashboard = useAppStore(
		(state) => state.bonus.dashboard.initialize
	);
	const initRates = useAppStore((state) => state.bonus.rates.initialize);
	const fetchDashboard = useAppStore(
		(state) => state.bonus.dashboard.fetchData
	);
	const fetchRates = useAppStore((state) => state.bonus.rates.fetchRates);

	// Use proper useEffect for initialization to prevent multiple calls
	useEffect(() => {
		// Initialize both slices only once when component mounts
		if (!dashboardSlice.isInitialized) {
			initDashboard(false);
		}

		if (!ratesSlice.isInitialized) {
			initRates(false);
		}
	}, [
		dashboardSlice.isInitialized,
		ratesSlice.isInitialized,
		initDashboard,
		initRates,
	]);

	const bonusData = dashboardSlice.bonusData;
	const bonusRates = ratesSlice.data;
	const isLoading =
		dashboardSlice.status === "loading" || ratesSlice.status === "loading";
	const isClaiming = claimSlice.isClaiming;
	const handleClaim = claimSlice.claimBonus;
	const lastClaimAmount = claimSlice.lastClaimAmount;
	const refresh = async (force: boolean = true) => {
		try {
			await Promise.all([fetchDashboard(force), fetchRates(force)]);
		} catch (error) {
			console.error("Failed to refresh bonus data:", error);
		}
	};
	const isClaimDisabled =
		isClaiming ||
		isLoading ||
		!bonusData ||
		bonusData.data.available_bonus <= 0;

	return {
		bonusData,
		bonusRates,
		isLoading,
		isClaiming,
		isClaimDisabled,
		handleClaim,
		lastClaimAmount,
		refresh,
	};
}
