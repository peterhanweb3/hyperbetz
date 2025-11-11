/**
 * Site Configuration Utility
 * Dynamically gets site name from environment or domain
 *
 * Usage: Use {siteName} in translation JSON files and it will be automatically replaced
 */

// Site name mapping based on domain
const DOMAIN_TO_SITE_NAME: Record<string, string> = {
	"hyperbetz.games": "HyperBetz",
	"www.hyperbetz.games": "HyperBetz",
	localhost: "HyperBetz", // Default for local development
	// Add your other domains here:
	// 'site2.com': 'Site2Name',
	// 'site3.com': 'Site3Name',
};

/**
 * Get site name from environment variable or domain
 */
export function getSiteName(): string {
	// 1. Try environment variable first (highest priority)
	if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_NAME) {
		return process.env.NEXT_PUBLIC_SITE_NAME;
	}

	// 2. Try to detect from window.location (client-side)
	if (typeof window !== "undefined") {
		const hostname = window.location.hostname;
		const siteName = DOMAIN_TO_SITE_NAME[hostname];
		if (siteName) return siteName;
	}

	// 3. Fallback to default
	return "HyperBetz";
}

export function getSiteTLD(): string {
	// 1. Try environment variable first (highest priority)
	if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_TLD) {
		return process.env.NEXT_PUBLIC_SITE_TLD;
	}

	// 2. Check for local development environment
	if (
		typeof window !== "undefined" &&
		window.location.hostname === "localhost"
	) {
		return ".games";
	}

	// 3. Try client-side detection
	if (typeof window !== "undefined") {
		const hostname = window.location.hostname;
		return extractTLD(hostname);
	}

	// 3. Try server-side detection (from NEXT_PUBLIC_SITE_URL if available)
	if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) {
		try {
			const hostname = new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
			return extractTLD(hostname);
		} catch {
			// ignore invalid URL
		}
	}

	// 4. Default fallback
	return ".games";
}

/**
 * Extracts the TLD (like "com", "io", "co.in") from a hostname.
 * Example:
 *  - "www.hyperbetz.com" → "com"
 *  - "app.hyperbetz.io" → "io"
 *  - "beta.hyperbetz.co.in" → "co.in"
 */
function extractTLD(hostname: string): string {
	const parts = hostname.split(".");
	if (parts.length <= 1) return hostname; // for localhost etc.

	// Handle known 2-level country-code TLDs (common cases)
	const lastTwo = parts.slice(-2).join(".");
	const ccTLDs = ["co.in", "com.au", "co.uk", "co.nz", "com.br", "co.za"];
	if (ccTLDs.includes(lastTwo)) return lastTwo;

	// Otherwise, return last segment
	return parts[parts.length - 1];
}

export function getSiteDomain(): string {
	// 1. Try to detect from window.location (client-side)
	if (typeof window !== "undefined") {
		return window.location.hostname;
	}

	// 2. Fallback to default
	return "hyperbetz.games";
}

/**
 * Replace {siteName} placeholder in translations
 */
export function interpolateSiteName(text: string): string {
	const siteName = getSiteName();
	return text.replace(/{siteName}/g, siteName);
}

/**
 * Replace {siteTLD} placeholder in translations
 */
export function interpolateSiteTLD(text: string): string {
	const siteTLD = getSiteTLD();
	return text.replace(/{siteTLD}/g, siteTLD);
}

/**
 * Recursively interpolate site name in translation object
 */
export function interpolateTranslations(obj: unknown): unknown {
	if (typeof obj === "string") {
		// Apply both siteName and siteTLD interpolation
		return interpolateSiteTLD(interpolateSiteName(obj));
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => interpolateTranslations(item));
	}

	if (obj && typeof obj === "object") {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = interpolateTranslations(value);
		}
		return result;
	}

	return obj;
}
