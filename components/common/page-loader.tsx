"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SEO-Friendly Page Loader
 * - Shows on initial page load
 * - Doesn't block content (content is still in DOM for crawlers)
 * - Smooth fade out animation
 */
export function PageLoader() {
	const [isLoading, setIsLoading] = useState(true);
	const [shouldRender, setShouldRender] = useState(true);

	useEffect(() => {
		// Minimum loading time for smooth UX (500ms)
		const minLoadTime = 500;
		const startTime = Date.now();

		// Wait for page to be fully loaded
		const handleLoad = () => {
			const elapsed = Date.now() - startTime;
			const remainingTime = Math.max(0, minLoadTime - elapsed);

			setTimeout(() => {
				setIsLoading(false);
				// Remove from DOM after fade animation completes
				setTimeout(() => setShouldRender(false), 400);
			}, remainingTime);
		};

		// Check if page is already loaded
		if (document.readyState === "complete") {
			handleLoad();
		} else {
			window.addEventListener("load", handleLoad);
			return () => window.removeEventListener("load", handleLoad);
		}
	}, []);

	// Don't render after fade out completes
	if (!shouldRender) return null;

	return (
		<div
			className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-400 ${
				isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
			}`}
			aria-hidden="true"
		>
			<div className="flex flex-col items-center gap-6">
				{/* Logo with pulse animation */}
				<div className="animate-pulse">
					<Image
						src="/assets/site/meme-win-logo.png"
						alt="Meme Win"
						width={200}
						height={200}
						priority
						className="w-48 h-auto"
					/>
				</div>

				{/* Loading dots animation */}
				<div className="flex gap-2">
					{[0, 1, 2].map((index) => (
						<div
							key={index}
							className="w-3 h-3 bg-primary rounded-full animate-bounce"
							style={{
								animationDelay: `${index * 0.15}s`,
								animationDuration: "0.8s",
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
