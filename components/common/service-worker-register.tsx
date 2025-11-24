"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for caching and offline support
 */
export function ServiceWorkerRegister() {
	useEffect(() => {
		// Unregister existing service workers to fix caching issues
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					registration.unregister();
					console.log("Service Worker unregistered");
				}
			});
		}
	}, []);

	return null; // This component doesn't render anything
}
