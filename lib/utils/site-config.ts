/**
 * Site Configuration Utility
 * Dynamically gets site name from environment or domain
 *
 * Usage: Use {siteName} in translation JSON files and it will be automatically replaced
 */

// Site name mapping based on domain
const DOMAIN_TO_SITE_NAME: Record<string, string> = {
  'hyperbetz.games': 'HyperBetz',
  'www.hyperbetz.games': 'HyperBetz',
  'localhost': 'HyperBetz', // Default for local development
  // Add your other domains here:
  // 'site2.com': 'Site2Name',
  // 'site3.com': 'Site3Name',
};

/**
 * Get site name from environment variable or domain
 */
export function getSiteName(): string {
  // 1. Try environment variable first (highest priority)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_NAME) {
    return process.env.NEXT_PUBLIC_SITE_NAME;
  }

  // 2. Try to detect from window.location (client-side)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const siteName = DOMAIN_TO_SITE_NAME[hostname];
    if (siteName) return siteName;
  }

  // 3. Fallback to default
  return 'HyperBetz';
}

/**
 * Replace {siteName} placeholder in translations
 */
export function interpolateSiteName(text: string): string {
  const siteName = getSiteName();
  return text.replace(/{siteName}/g, siteName);
}

/**
 * Recursively interpolate site name in translation object
 */
export function interpolateTranslations(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return interpolateSiteName(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => interpolateTranslations(item));
  }

  if (obj && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateTranslations(value);
    }
    return result;
  }

  return obj;
}
