/**
 * useSEO Hook
 * React hook for managing SEO in client components
 * Language-based SEO system
 */

"use client";

import { usePathname } from "next/navigation";
import { useMemo, useEffect } from "react";
import {
	detectLanguageFromPath,
	getSEOConfig,
} from "@/lib/utils/seo/seo-config-loader";

export function useSEO() {
	const pathname = usePathname();
	const config = getSEOConfig();

	const language = useMemo(
		() => detectLanguageFromPath(pathname),
		[pathname]
	);

	// Track page views for analytics
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (typeof window !== "undefined" && (window as any).gtag) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).gtag(
				"config",
				config.analytics.ga4.measurementId || "",
				{
					page_path: pathname,
				}
			);
		}
	}, [pathname, config.analytics.ga4.measurementId]);

	return {
		language,
		pathname,
		canonicalUrl:
			language === "en"
				? `${config.defaultDomain}${pathname}`
				: `${config.defaultDomain}/${language}${pathname.replace(
						`/${language}`,
						""
				  )}`,
		metaTitleSuffix: config.metaTitleSuffix,
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
		paths.forEach((path) => {
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
export function useStructuredData(schema: Record<string, unknown> | null) {
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
