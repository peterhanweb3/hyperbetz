"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import {
	AffiliateRate,
	GetDownlineResponse,
} from "@/types/affiliate/affiliate.types";

export interface UseAffiliateDashboardResult {
	downlineData: GetDownlineResponse | null;
	affiliateRates: AffiliateRate[];
	isLoading: boolean;
	isClaiming: boolean;
	isClaimDisabled: boolean;
	handleClaim: () => Promise<void>;
	refresh: (force?: boolean) => Promise<void>;
}

export default function useAffiliateDashboard(): UseAffiliateDashboardResult {
	const { user } = useDynamicAuth();
	const isAuthenticated = !!user;

	// Get data from slices
	const downlineSlice = useAppStore((state) => state.affiliate.downline);
	const ratesSlice = useAppStore((state) => state.affiliate.rates);
	const claimSlice = useAppStore((state) => state.affiliate.claim);
	const managerSlice = useAppStore((state) => state.affiliate.manager);

	// Select actions
	const initializeManager = useAppStore(
		(state) => state.affiliate.manager.initialize
	);
	const refreshAll = useAppStore((state) => state.affiliate.manager.refreshAll);

	// Initialize manager on mount or when auth status changes
	useEffect(() => {
		// Initialize with current auth status
		initializeManager(isAuthenticated);
	}, [isAuthenticated, initializeManager]);

	const downlineData = downlineSlice.data;
	const affiliateRates = ratesSlice.data;
	const isLoading = managerSlice.status === "loading";
	const isClaiming = claimSlice.isClaiming;
	const handleClaim = claimSlice.claimBonus;

	const refresh = async (force: boolean = true) => {
		await refreshAll(force);
	};

	const isClaimDisabled =
		isClaiming ||
		isLoading ||
		!downlineData ||
		downlineData.total_unclaim <= 0;

	return {
		downlineData,
		affiliateRates,
		isLoading,
		isClaiming,
		isClaimDisabled,
		handleClaim,
		refresh,
	};
}
