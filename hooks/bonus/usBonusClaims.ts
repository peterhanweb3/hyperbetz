"use client";

import { useState, useEffect, useCallback } from "react";
import ApiService from "@/services/apiService";
import {
	UnclaimedBonus,
	GetMemberUnclaimedBonusResponse,
} from "@/types/bonus/bonus.types";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

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

	const { user } = useDynamicAuth();
	const username = user?.username;

	const fetchUnclaimedBonus = useCallback(
		async (isRefresh = false) => {
			const token = getAuthToken();

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
		fetchUnclaimedBonus();
	}, [fetchUnclaimedBonus]);

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
