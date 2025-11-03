"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/store";
import { ReferralsSortOrder } from "@/store/slices/affiliate/referrals.slice";
import {
	GetDownlineResponse,
	DownlineEntry,
} from "@/types/affiliate/affiliate.types";

export type { ReferralsSortOrder } from "@/store/slices/affiliate/referrals.slice";

export interface UseAffiliateReferralsResult {
	data: GetDownlineResponse | null;
	isLoading: boolean;
	currentPage: number;
	sortOrder: ReferralsSortOrder;
	setPage: (page: number) => void;
	setSortOrder: (order: ReferralsSortOrder) => void;
	sortedData: DownlineEntry[];
}

export const useAffiliateReferrals = (): UseAffiliateReferralsResult => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Track if we're currently syncing to prevent loops
	const isSyncingRef = useRef(false);
	const isInitializedRef = useRef(false);

	// Select the entire slice and individual actions for stability.
	const referralsSlice = useAppStore((state) => state.affiliate.referrals);
	const {
		setPage: setPageStore,
		setSortOrder: setSortOrderStore,
		initialize,
		fetchReferrals,
	} = useAppStore((state) => state.affiliate.referrals);

	/**
	 * EFFECT 1: Initialize from URL on mount
	 */
	useEffect(() => {
		if (isInitializedRef.current) return;

		const urlPage = Number(searchParams.get("page")) || 1;
		const urlSort = searchParams.get("sort");

		let sortOrder: ReferralsSortOrder = "last_login"; // default

		// Map URL sort param to store sort order
		if (urlSort === "Z-A") {
			sortOrder = "nickname_desc";
		} else if (urlSort === "A-Z") {
			sortOrder = "nickname_asc";
		} else if (urlSort === "unclaimed_amount") {
			sortOrder = "unclaimed_amount";
		} else if (urlSort === "last_login") {
			sortOrder = "last_login";
		}

		// Initialize the store with URL values without triggering effects
		isSyncingRef.current = true;
		setPageStore(urlPage);
		setSortOrderStore(sortOrder);
		initialize(false);
		isInitializedRef.current = true;

		// Allow effects to run after a brief delay
		setTimeout(() => {
			isSyncingRef.current = false;
		}, 100);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	/**
	 * EFFECT 2: Sync URL when store state changes (from user interaction)
	 */
	useEffect(() => {
		if (!isInitializedRef.current || isSyncingRef.current) return;

		const params = new URLSearchParams(searchParams.toString());

		// Update page param
		if (referralsSlice.currentPage > 1) {
			params.set("page", String(referralsSlice.currentPage));
		} else {
			params.delete("page");
		}

		// Update sort param
		const currentSort = referralsSlice.sortOrder;
		if (currentSort === "nickname_desc") {
			params.set("sort", "Z-A");
		} else if (currentSort === "nickname_asc") {
			params.set("sort", "A-Z");
		} else if (currentSort === "unclaimed_amount") {
			params.set("sort", "unclaimed_amount");
		} else {
			params.delete("sort"); // default is last_login
		}

		const newQueryString = params.toString();
		const currentQueryString = searchParams.toString();

		if (newQueryString !== currentQueryString) {
			const newUrl = newQueryString
				? `${pathname}?${newQueryString}`
				: pathname;
			router.replace(newUrl, { scroll: false });
		}
	}, [
		referralsSlice.currentPage,
		referralsSlice.sortOrder,
		pathname,
		searchParams,
		router,
	]);

	/**
	 * EFFECT 3: Fetch data when page or sort changes
	 * Only fetch when:
	 * - Page changes
	 * - Sort changes to/from API-based sorts (last_login, unclaimed_amount)
	 * Do NOT fetch when switching between client-side nickname sorts
	 */
	useEffect(() => {
		if (!isInitializedRef.current) return;

		const isClientSideSort =
			referralsSlice.sortOrder === "nickname_asc" ||
			referralsSlice.sortOrder === "nickname_desc";

		// Only fetch if it's not a client-side sort
		// Client-side sorts will just re-sort existing data via getSortedData()
		if (!isClientSideSort) {
			fetchReferrals(true);
		}
	}, [referralsSlice.currentPage, referralsSlice.sortOrder, fetchReferrals]);

	// Memoize sorted data to prevent re-computation on every render.
	const sortedData = referralsSlice.getSortedData() as DownlineEntry[];

	// Construct the final data object to be returned.
	const dataWithSortedResults = referralsSlice.data
		? {
				...referralsSlice.data,
				data: sortedData,
		  }
		: null;

	// Wrapper functions that prevent syncing loops
	const setPage = (page: number) => {
		if (page !== referralsSlice.currentPage) {
			setPageStore(page);
		}
	};

	const setSortOrder = (order: ReferralsSortOrder) => {
		if (order !== referralsSlice.sortOrder) {
			setSortOrderStore(order);
		}
	};

	return {
		data: dataWithSortedResults,
		isLoading: referralsSlice.status === "loading",
		currentPage: referralsSlice.currentPage,
		sortOrder: referralsSlice.sortOrder,
		setPage,
		setSortOrder,
		sortedData,
	};
};
