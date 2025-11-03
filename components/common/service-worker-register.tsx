"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for caching and offline support
 */
export function ServiceWorkerRegister() {
	useEffect(() => {
		// Only register in production
		if (
			typeof window !== "undefined" &&
			"serviceWorker" in navigator &&
			process.env.NODE_ENV === "production"
		) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					// Check for updates periodically
					setInterval(() => {
						registration.update();
					}, 60000); // Check every minute
				})
				.catch((error) => {
					console.error("Service Worker registration failed:", error);
				});
		}
	}, []);

	return null; // This component doesn't render anything
}
