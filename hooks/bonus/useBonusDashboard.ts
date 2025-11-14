"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
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
	const { user } = useDynamicAuth();
	const isAuthenticated = !!user;

	// Get data from slices
	const dashboardSlice = useAppStore((state) => state.bonus.dashboard);
	const ratesSlice = useAppStore((state) => state.bonus.rates);
	const claimSlice = useAppStore((state) => state.bonus.claim);
	const managerSlice = useAppStore((state) => state.bonus.manager);

	// Select actions
	const initializeManager = useAppStore(
		(state) => state.bonus.manager.initialize
	);
	const refreshAll = useAppStore((state) => state.bonus.manager.refreshAll);

	// Initialize manager on mount or when auth status changes
	useEffect(() => {
		// Initialize with current auth status
		initializeManager(isAuthenticated);
	}, [isAuthenticated, initializeManager]);

	const bonusData = dashboardSlice.bonusData;
	const bonusRates = ratesSlice.data;
	const isLoading = managerSlice.status === "loading";
	const isClaiming = claimSlice.isClaiming;
	const handleClaim = claimSlice.claimBonus;
	const lastClaimAmount = claimSlice.lastClaimAmount;

	const refresh = async (force: boolean = true) => {
		await refreshAll(force);
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
