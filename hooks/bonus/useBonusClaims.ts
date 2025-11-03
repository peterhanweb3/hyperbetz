"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ApiService from "@/services/apiService";
import {
	UnclaimedBonus,
	GetMemberUnclaimedBonusResponse,
} from "@/types/bonus/bonus.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";

export interface UseBonusClaimsResult {
	unclaimedBonusData: UnclaimedBonus[];
	totalData: string;
	pageInfo: string;
	isLoading: boolean;
	isRefreshing: boolean;
	error: string | null;
	currentPage: number;
	setPage: (page: number) => void;
	refresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export default function useBonusClaims(): UseBonusClaimsResult {
	const [unclaimedBonusData, setUnclaimedBonusData] = useState<
		UnclaimedBonus[]
	>([]);
	const [totalData, setTotalData] = useState("0");
	const [pageInfo, setPageInfo] = useState("1 of 1");
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const initialFetchDoneRef = useRef(false);
	const lastUsernameRef = useRef<string | undefined>(undefined);

	const { user, authToken: token } = useDynamicAuth();
	const username = user?.username;

	const fetchUnclaimedBonus = useCallback(
		async (isRefresh = false) => {
			if (!username || !token) {
				setError("Username or authentication token not found");
				setIsLoading(false);
				return;
			}

			if (isRefresh) {
				setIsRefreshing(true);
			} else {
				setIsLoading(true);
			}
			setError(null);

			try {
				const api = ApiService.getInstance();
				const response: GetMemberUnclaimedBonusResponse =
					await api.getMemberUnclaimedBonus(
						{
							username,
							page_number: currentPage,
							limit: ITEMS_PER_PAGE,
						},
						token
					);

				if (response.error) {
					setError(response.message);
					setUnclaimedBonusData([]);
					setTotalData("0");
					setPageInfo("1 of 1");
				} else {
					setUnclaimedBonusData(response.data || []);
					setTotalData(response.total_data || "0");
					setPageInfo(response.page || "1 of 1");
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to fetch unclaimed bonus data"
				);
				setUnclaimedBonusData([]);
				setTotalData("0");
				setPageInfo("1 of 1");
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[username, currentPage]
	);

	useEffect(() => {
		// Only fetch on initial mount when username and token are available
		// Don't refetch when username reference changes but value is the same
		if (username && token && !initialFetchDoneRef.current) {
			initialFetchDoneRef.current = true;
			lastUsernameRef.current = username;
			fetchUnclaimedBonus();
		}
		// If username value actually changed (not just reference), reset and fetch
		else if (username && token && lastUsernameRef.current !== username) {
			lastUsernameRef.current = username;
			fetchUnclaimedBonus();
		}
	}, [username, token, fetchUnclaimedBonus]);

	// Separate effect for page changes
	useEffect(() => {
		// If we've already fetched once and page changes, fetch again
		if (initialFetchDoneRef.current && currentPage > 1) {
			fetchUnclaimedBonus();
		}
	}, [currentPage, fetchUnclaimedBonus]);

	const refresh = useCallback(async () => {
		await fetchUnclaimedBonus(true);
	}, [fetchUnclaimedBonus]);

	const setPage = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	return {
		unclaimedBonusData,
		totalData,
		pageInfo,
		isLoading,
		isRefreshing,
		error,
		currentPage,
		setPage,
		refresh,
	};
}
