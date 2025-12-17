import { useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to handle cross-tab logout synchronization
 * When a user logs out in one tab, all other tabs will be redirected to home
 */
export function useCrossTabLogout(isLoggedIn: boolean) {
	const previousLoginState = useRef<boolean>(isLoggedIn);

	const handleStorageChange = useCallback((event: StorageEvent) => {
		// Check if the logout was triggered (by monitoring auth-related keys)
		if (
			event.key === "hyperbetz_userData" &&
			event.oldValue !== null &&
			event.newValue === null
		) {
			// User data was removed (logout occurred in another tab)
			console.log(
				"Logout detected in another tab, redirecting to home..."
			);
			// Use window.location.href for full redirect (clears all params and routes)
			window.location.href = "/";
		}
	}, []);

	useEffect(() => {
		// Only set up listener if user is currently logged in
		if (!isLoggedIn) {
			previousLoginState.current = false;
			return;
		}

		previousLoginState.current = true;

		// Listen for storage changes from other tabs
		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, [isLoggedIn, handleStorageChange]);

	// Alternative: Use BroadcastChannel API for more reliable cross-tab communication
	useEffect(() => {
		if (!isLoggedIn) return;

		const channel = new BroadcastChannel("auth_channel");

		channel.onmessage = (event) => {
			if (event.data.type === "LOGOUT") {
				console.log(
					"Logout broadcast received, redirecting to home..."
				);
				// Use window.location.href for full redirect (clears all params and routes)
				window.location.href = "/";
			}
		};

		return () => {
			channel.close();
		};
	}, [isLoggedIn]);
}

/**
 * Broadcast logout to all tabs
 * Call this function when user logs out
 */
export function broadcastLogout() {
	try {
		const channel = new BroadcastChannel("auth_channel");
		channel.postMessage({ type: "LOGOUT", timestamp: Date.now() });
		channel.close();
	} catch (error) {
		console.error("Failed to broadcast logout:", error);
	}
}
