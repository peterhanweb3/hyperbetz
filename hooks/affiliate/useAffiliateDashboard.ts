"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/store";
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
	const downlineSlice = useAppStore((state) => state.affiliate.downline);
	const ratesSlice = useAppStore((state) => state.affiliate.rates);
	const claimSlice = useAppStore((state) => state.affiliate.claim);

	// Select actions once to avoid reaching for getState
	const initDownline = useAppStore(
		(state) => state.affiliate.downline.initialize
	);
	const initRates = useAppStore((state) => state.affiliate.rates.initialize);
	const fetchDownline = useAppStore(
		(state) => state.affiliate.downline.fetchDownline
	);
	const fetchRates = useAppStore((state) => state.affiliate.rates.fetchRates);

	// Use proper useEffect for initialization to prevent multiple calls
	useEffect(() => {
		// Initialize both slices only once when component mounts
		if (!downlineSlice.isInitialized) {
			initDownline(false);
		}

		if (!ratesSlice.isInitialized) {
			initRates(false);
		}
	}, [
		downlineSlice.isInitialized,
		ratesSlice.isInitialized,
		initDownline,
		initRates,
	]);

	const downlineData = downlineSlice.data;
	const affiliateRates = ratesSlice.data;
	const isLoading =
		downlineSlice.status === "loading" || ratesSlice.status === "loading";
	const isClaiming = claimSlice.isClaiming;
	const handleClaim = claimSlice.claimBonus;
	const refresh = async (force: boolean = true) => {
		try {
			await fetchDownline(force);
		} catch (error) {
			console.error("Failed to fetch downline:", error);
		}

		try {
			await fetchRates(force);
		} catch (error) {
			console.error("Failed to fetch rates:", error);
		}
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
