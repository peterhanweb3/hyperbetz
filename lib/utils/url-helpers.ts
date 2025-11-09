/**
 * URL Helper Utilities
 * Provides consistent URL generation for SEO-friendly routes
 */

import { providerNameToSlug, categoryToSlug } from './provider-slug-mapping';

/**
 * Generate a SEO-friendly provider URL
 * @param providerName - The provider name (e.g., "PG Soft")
 * @returns URL path (e.g., "/games/pg-soft")
 */
export function getProviderUrl(providerName: string): string {
  const slug = providerNameToSlug(providerName);
  return `/games/${slug}`;
}

/**
 * Generate a SEO-friendly provider + category URL
 * @param providerName - The provider name (e.g., "PG Soft")
 * @param category - The category name (e.g., "SLOT")
 * @returns URL path (e.g., "/games/pg-soft/slot")
 */
export function getProviderCategoryUrl(providerName: string, category: string): string {
  const providerSlug = providerNameToSlug(providerName);
  const categorySlug = categoryToSlug(category);
  return `/games/${providerSlug}/${categorySlug}`;
}

/**
 * Generate a SEO-friendly category providers URL
 * @param category - The category name (e.g., "SLOT")
 * @returns URL path (e.g., "/providers/slot")
 */
export function getCategoryProvidersUrl(category: string): string {
  const slug = categoryToSlug(category);
  return `/providers/${slug}`;
}

/**
 * Normalize a string for URL use
 * @param str - The string to normalize
 * @returns Normalized string (lowercase, hyphenated, no special chars)
 */
export function normalizeForUrl(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/\./g, '')         // Remove dots
    .replace(/[^\w-]/g, '');    // Remove non-word chars except hyphens
}
