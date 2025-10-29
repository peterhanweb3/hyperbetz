import { useState, useEffect } from "react";

/**
 * Calculate time remaining until next 14:00 UTC
 */
const useCountdownTimer = () => {
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			const utcNow = new Date(
				now.getTime() + now.getTimezoneOffset() * 60000
			);

			// Get today's 14:00 UTC
			const targetTime = new Date(utcNow);
			targetTime.setUTCHours(14, 0, 0, 0);

			// If we've passed 14:00 UTC today, target tomorrow's 14:00 UTC
			if (utcNow >= targetTime) {
				targetTime.setUTCDate(targetTime.getUTCDate() + 1);
			}

			const diff = targetTime.getTime() - utcNow.getTime();

			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			return `${String(hours).padStart(2, "0")}:${String(
				minutes
			).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		};

		// Initial calculation
		setTimeLeft(calculateTimeLeft());

		// Update every second
		const interval = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return timeLeft;
};

export default useCountdownTimer;
