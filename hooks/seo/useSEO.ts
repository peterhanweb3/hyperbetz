/**
 * useSEO Hook
 * React hook for managing SEO in client components
 */

"use client";

import { usePathname } from "next/navigation";
import { useMemo, useEffect } from "react";
import {
	detectRegionFromPath,
	getRegionConfig,
} from "@/lib/seo/seo-config-loader";

export function useSEO() {
	const pathname = usePathname();

	const region = useMemo(() => detectRegionFromPath(pathname), [pathname]);
	const regionConfig = useMemo(() => getRegionConfig(region), [region]);

	// Track page views for analytics
	useEffect(() => {
		if (typeof window !== "undefined" && (window as any).gtag) {
			(window as any).gtag("config", regionConfig.ga4Id || "", {
				page_path: pathname,
			});
		}
	}, [pathname, regionConfig.ga4Id]);

	return {
		region,
		regionConfig,
		pathname,
		canonicalUrl: `${regionConfig.canonicalBase}${pathname}`,
		language: regionConfig.language,
		currency: regionConfig.currency,
		timezone: regionConfig.timezone,
	};
}

/**
 * useBreadcrumbs Hook
 * Generate breadcrumb data from current path
 */
export function useBreadcrumbs() {
	const pathname = usePathname();

	const breadcrumbs = useMemo(() => {
		const paths = pathname.split("/").filter(Boolean);
		const crumbs = [{ name: "Home", url: "/" }];

		let currentPath = "";
		paths.forEach((path, index) => {
			// Skip region code
			if (index === 0 && path.length === 2) {
				currentPath += `/${path}`;
				return;
			}

			currentPath += `/${path}`;
			const name = path
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			crumbs.push({ name, url: currentPath });
		});

		return crumbs;
	}, [pathname]);

	return breadcrumbs;
}

/**
 * useStructuredData Hook
 * Inject structured data into the page
 */
export function useStructuredData(schema: Record<string, any> | null) {
	useEffect(() => {
		if (!schema || typeof window === "undefined") return;

		const scriptId = "structured-data";
		let script = document.getElementById(scriptId) as HTMLScriptElement;

		if (!script) {
			script = document.createElement("script");
			script.id = scriptId;
			script.type = "application/ld+json";
			document.head.appendChild(script);
		}

		script.textContent = JSON.stringify(schema);

		return () => {
			// Cleanup on unmount
			const existingScript = document.getElementById(scriptId);
			if (existingScript) {
				existingScript.remove();
			}
		};
	}, [schema]);
}

export default useSEO;
