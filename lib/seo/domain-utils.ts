/**
 * Domain Detection Utilities
 * Dynamically detect the current domain/TLD for multi-domain SEO support
 */

import seoConfig from "@/config/seo/global-seo.config.json";

export type SupportedTLD = string;

/**
 * Get the current domain from various sources (server/client)
 * Priority: window -> env -> default
 * Note: Server-side domain detection happens in middleware via headers
 */
export function getCurrentDomain(): string {
	// 1. Client-side: Use window.location (most reliable on client)
	if (typeof window !== "undefined") {
		return window.location.hostname;
	}

	// 2. Server-side: Try environment variable
	if (process.env.NEXT_PUBLIC_SITE_DOMAIN) {
		return process.env.NEXT_PUBLIC_SITE_DOMAIN;
	}

	// 3. Try to extract from NEXT_PUBLIC_SITE_URL
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		try {
			const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
			return url.hostname;
		} catch {
			// Invalid URL, continue
		}
	}

	// 4. Fallback to default domain from config
	const defaultUrl = seoConfig.defaultDomain;
	try {
		const url = new URL(defaultUrl);
		return url.hostname;
	} catch {
		return "hyperbetz.games"; // Hard fallback
	}
}

/**
 * Get the full current URL (with protocol)
 */
export function getCurrentDomainWithProtocol(): string {
	const domain = getCurrentDomain();
	// Always use https in production
	const protocol =
		process.env.NODE_ENV === "production" ||
		!domain.includes("localhost")
			? "https"
			: "http";
	return `${protocol}://${domain}`;
}

/**
 * Check if the current domain is a supported TLD
 */
export function isSupportedTLD(domain: string): boolean {
	const cleanDomain = domain.split(":")[0]; // Remove port
	return (seoConfig.supportedTLDs as string[]).some(
		(tld) => tld === cleanDomain || tld === `www.${cleanDomain}`
	);
}

/**
 * Get canonical domain (removes www if present, unless www is the primary)
 */
export function getCanonicalDomain(domain: string): string {
	const cleanDomain = domain.split(":")[0]; // Remove port

	// Check if www version is in supported TLDs
	const hasWww = cleanDomain.startsWith("www.");
	const withoutWww = hasWww ? cleanDomain.slice(4) : cleanDomain;
	const withWww = hasWww ? cleanDomain : `www.${cleanDomain}`;

	// Prefer non-www version unless only www is supported
	const supportedTLDs = seoConfig.supportedTLDs as string[];

	if (supportedTLDs.includes(withoutWww)) {
		return withoutWww;
	}

	if (supportedTLDs.includes(withWww)) {
		return withWww;
	}

	// Fallback to cleaned domain
	return withoutWww;
}

/**
 * Build canonical URL for the current domain
 */
export function buildCanonicalURL(path: string, language?: string): string {
	const domain = getCurrentDomain();
	const canonicalDomain = getCanonicalDomain(domain);
	const protocol =
		process.env.NODE_ENV === "production" ||
		!canonicalDomain.includes("localhost")
			? "https"
			: "http";

	// Clean the path
	let cleanPath = path.startsWith("/") ? path : `/${path}`;

	// Remove language prefix from path if it exists
	if (language) {
		const langPattern = new RegExp(`^/${language}(/|$)`);
		cleanPath = cleanPath.replace(langPattern, "/");
	}

	// Build the URL
	const baseUrl = `${protocol}://${canonicalDomain}`;

	// For default language (en), don't add language prefix
	if (!language || language === seoConfig.defaultLang) {
		return `${baseUrl}${cleanPath}`;
	}

	// For other languages, add language prefix
	return `${baseUrl}/${language}${cleanPath === "/" ? "" : cleanPath}`;
}

/**
 * Build alternate URL for a specific language
 */
export function buildAlternateURL(
	path: string,
	language: string
): string {
	const domain = getCurrentDomain();
	const canonicalDomain = getCanonicalDomain(domain);
	const protocol =
		process.env.NODE_ENV === "production" ||
		!canonicalDomain.includes("localhost")
			? "https"
			: "http";

	// Clean the path (remove any existing language prefix)
	let cleanPath = path.startsWith("/") ? path : `/${path}`;

	// Remove any existing language prefix
	const languages = Object.keys(seoConfig.languages);
	for (const lang of languages) {
		const langPattern = new RegExp(`^/${lang}(/|$)`);
		if (langPattern.test(cleanPath)) {
			cleanPath = cleanPath.replace(langPattern, "/");
			break;
		}
	}

	// Build the URL
	const baseUrl = `${protocol}://${canonicalDomain}`;

	// For default language (en), don't add language prefix
	if (language === seoConfig.defaultLang) {
		return `${baseUrl}${cleanPath}`;
	}

	// For other languages, add language prefix
	return `${baseUrl}/${language}${cleanPath === "/" ? "" : cleanPath}`;
}

/**
 * Get all available language codes from the config
 */
export function getAvailableLanguages(): string[] {
	return Object.keys(seoConfig.languages);
}

/**
 * Language configuration interface
 */
interface LanguageConfig {
	name: string;
	nativeName: string;
	hreflang: string;
	direction: string;
	localizedTerms: Record<string, string>;
}

/**
 * Get language configuration
 */
export function getLanguageConfig(language: string): LanguageConfig | null {
	const config = seoConfig.languages as Record<string, LanguageConfig>;
	return config[language] || null;
}

/**
 * Detect language from URL path
 */
export function detectLanguageFromPath(pathname: string): string {
	const pathSegments = pathname.split("/").filter(Boolean);

	if (pathSegments.length > 0) {
		const firstSegment = pathSegments[0].toLowerCase();
		const languages = getAvailableLanguages();

		if (languages.includes(firstSegment)) {
			return firstSegment;
		}
	}

	return seoConfig.defaultLang;
}
