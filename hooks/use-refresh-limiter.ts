import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

/**
 * Custom hook to prevent DDOS attacks by rate-limiting refresh/refetch actions
 * @param cooldownSeconds - The cooldown period in seconds (default: 10)
 * @returns Object containing the canRefresh state and handleRefresh function
 */
export function useRefreshLimiter(cooldownSeconds: number = 10) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [canRefresh, setCanRefresh] = useState(true);
	const lastRefreshTime = useRef<number>(0);

	const handleRefresh = useCallback(
		async (refreshAction: () => Promise<void>) => {
			const now = Date.now();
			const timeSinceLastRefresh = (now - lastRefreshTime.current) / 1000;

			if (
				timeSinceLastRefresh < cooldownSeconds &&
				lastRefreshTime.current !== 0
			) {
				const remainingTime = Math.ceil(
					cooldownSeconds - timeSinceLastRefresh
				);
				toast.warning(
					`Please wait ${remainingTime} second${
						remainingTime > 1 ? "s" : ""
					} before refreshing again`
				);
				return false;
			}

			setIsRefreshing(true);
			setCanRefresh(false);
			lastRefreshTime.current = now;

			try {
				await refreshAction();
				// toast.success("Refreshed successfully");

				// Re-enable refresh after cooldown period
				setTimeout(() => {
					setCanRefresh(true);
				}, cooldownSeconds * 1000);

				return true;
			} catch (error) {
				console.error("Refresh error:", error);
				toast.error("Failed to refresh. Please try again.");
				// Re-enable immediately on error
				setCanRefresh(true);
				return false;
			} finally {
				setIsRefreshing(false);
			}
		},
		[cooldownSeconds]
	);

	return {
		isRefreshing,
		canRefresh,
		handleRefresh,
	};
}
