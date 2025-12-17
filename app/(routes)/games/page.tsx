"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/store";
import { QueryPageLayout } from "@/components/features/query-display/page-layout";
import { QueryPageSkeleton } from "@/components/features/skeletons/query-display/query-page-skeleton";

function GamesPageClient() {
  // We only need the one action now.
  const syncStateFromUrl = useAppStore(state => state.query.syncStateFromUrl);
  const searchParams = useSearchParams();

  useEffect(() => {
    // --- THE CORE FIX ---
    // On every render where `searchParams` has changed, we command the store
    // to rebuild its state based on the new URL.
    syncStateFromUrl(searchParams);

    // This dependency array is now correct. The effect will re-sync the state
    // every time the URL changes, solving both the stale data and the reset problem.
  }, [searchParams, syncStateFromUrl]);

  return <QueryPageLayout />;
}

export default function AllGamesPage() {
  return (
    <Suspense fallback={<QueryPageSkeleton />}>
      <GamesPageClient />
    </Suspense>
  );
}
