"use client";

import { useAppStore } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { providerNameToSlug, categoryToSlug } from "@/lib/utils/provider-slug-mapping";

/**
 * The primary controller hook for managing the query state.
 * It provides actions that update both the Zustand store and the URL
 * query parameters in a single, synchronous operation, ensuring instant UI feedback.
 */
export const useQueryManager = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeFilters, searchQuery, sortBy, toggleFilter, setSearchQuery, setSortBy, clearAllFilters } = useAppStore(state => state.query);

  const updateUrl = useCallback(
    (newParams: URLSearchParams) => {
      // Use router.replace to update the URL without adding to the browser's history stack.
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleToggleFilter = (filterType: string, value: string) => {
    // DON'T call toggleFilter() here - calculate new state and just navigate
    // The syncStateFromPath will handle updating the store
    // toggleFilter(filterType, value); // REMOVED - causes race condition

    // 1. Calculate the next state of filters
    const newActiveFilters = { ...activeFilters };
    const currentValues = newActiveFilters[filterType] || [];
    const isRemoving = currentValues.includes(value);

    if (isRemoving) {
      newActiveFilters[filterType] = currentValues.filter(v => v !== value);
      if (newActiveFilters[filterType].length === 0) {
        delete newActiveFilters[filterType];
      }
    } else {
      newActiveFilters[filterType] = [...currentValues, value];
    }

    // 2. Navigate to the correct path based on active filters
    const providers = newActiveFilters['provider_name'] || [];
    const categories = newActiveFilters['category'] || [];

    let newPath = '/games';

    // Build path based on filters
    if (providers.length > 0) {
      const providerSlug = providerNameToSlug(providers[0]); // Use first provider
      newPath = `/games/${providerSlug}`;

      if (categories.length > 0) {
        const categorySlug = categoryToSlug(categories[0]); // Use first category
        newPath = `/games/${providerSlug}/${categorySlug}`;
      }
    } else if (categories.length > 0) {
      // Category only (no provider)
      const categorySlug = categoryToSlug(categories[0]);
      newPath = `/providers/${categorySlug}`;
    }

    // Add query params for search and sort if needed
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy !== "a-z") params.set("sort", sortBy);

    const queryString = params.toString();
    const finalPath = queryString ? `${newPath}?${queryString}` : newPath;

    // 3. Navigate to new path - the page will sync state from URL/path
    router.push(finalPath, { scroll: false });
  };

  // --- THE FIX IS HERE: FULLY IMPLEMENTED handleSort ---
  const handleSort = (newSortValue: string) => {
    setSortBy(newSortValue);

    const params = new URLSearchParams();
    // Reconstruct params from current state, but use the NEW sort value
    if (searchQuery) params.set("q", searchQuery);
    if (newSortValue && newSortValue !== "a-z") {
      // 'a-z' is default, no need to add to URL
      params.set("sort", newSortValue);
    }
    // Object.entries(activeFilters).forEach(([key, values]) => {
    //   values.forEach(v => params.append(key, v));
    // });
    updateUrl(params);
  };

  // --- Also implementing the other handlers for completeness ---
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sortBy !== "a-z") params.set("sort", sortBy);
    Object.entries(activeFilters).forEach(([key, values]) => {
      values.forEach(v => params.append(key, v));
    });
    updateUrl(params);
  };

  const handleClearFilters = () => {
    // DON'T call clearAllFilters() here - let the navigation handle it
    // clearAllFilters(); // REMOVED - causes race condition

    // Navigate to /games - the syncStateFromUrl will clear filters automatically
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy !== "a-z") params.set("sort", sortBy);

    const queryString = params.toString();
    const finalPath = queryString ? `/games?${queryString}` : '/games';

    router.push(finalPath, { scroll: false });
  };

  // Return only the handlers the UI needs.
  return {
    handleToggleFilter,
    handleClearFilters,
    handleSort,
    handleSearch,
    // ... add handlers for search and sort as needed
  };
};
