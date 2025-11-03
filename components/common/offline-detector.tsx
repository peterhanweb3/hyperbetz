"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifiSlash, faCircleCheck } from "@fortawesome/pro-light-svg-icons";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";

export function OfflineDetector() {
	const [isOnline, setIsOnline] = useState(true);
	const [showNotification, setShowNotification] = useState(false);

	const { refreshUserData } = useDynamicAuth();

	useEffect(() => {
		// Check initial online status
		setIsOnline(navigator.onLine);

		const handleOnline = () => {
			setIsOnline(true);
			setShowNotification(true);
			refreshUserData();
			setTimeout(() => {
				setShowNotification(false);
			}, 3000);
		};

		const handleOffline = () => {
			setIsOnline(false);
			setShowNotification(true);
			// Keep showing "You are offline" notification (don't auto-hide)
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	if (!showNotification) return null;

	return (
		<div
			className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ${
				isOnline
					? "bg-green-500/90 text-white"
					: "bg-destructive/90 text-white"
			} animate-fade-in-up`}
		>
			<div className="flex items-center gap-3">
				<FontAwesomeIcon
					icon={isOnline ? faCircleCheck : faWifiSlash}
					className={`w-4 h-4 ${isOnline ? "" : "animate-pulse"}`}
				/>
				<span className="text-sm font-medium">
					{isOnline ? "Back online" : "You are offline"}
				</span>
			</div>
		</div>
	);
}
