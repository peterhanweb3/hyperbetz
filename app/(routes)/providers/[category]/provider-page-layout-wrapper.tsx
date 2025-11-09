"use client";

import { useEffect } from "react";
import { ProviderPageLayout } from "@/components/features/query-display/provider-page-layout";
import { useAppStore } from "@/store/store";
import { Skeleton } from "@/components/ui/skeleton";

const VendorPageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-20 w-full rounded-lg" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(12)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export function ProviderPageLayoutWrapper({ category }: { category: string }) {
  const gameStatus = useAppStore(state => state.game.list.status);
  const initializeProviderList = useAppStore(state => state.game.providers.initializeProviderList);

  // Initialize provider icons when component mounts
  useEffect(() => {
    initializeProviderList();
  }, [initializeProviderList]);

  // If the data is not yet successfully loaded, render skeleton
  if (gameStatus !== "success") {
    return <VendorPageSkeleton />;
  }

  // Pass the category from URL to the layout component
  return <ProviderPageLayout categoryFromPath={category} />;
}
