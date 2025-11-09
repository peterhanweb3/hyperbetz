"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/store";
import { QueryPageLayout } from "@/components/features/query-display/page-layout";

export function GamesPageLayoutWrapper({ slug }: { slug: string[] }) {
  const syncStateFromPath = useAppStore(state => state.query.syncStateFromPath);

  useEffect(() => {
    // Parse slug to determine provider and/or category
    // slug[0] could be provider name
    // slug[1] could be category
    if (slug && slug.length > 0) {
      syncStateFromPath(slug);
    }
  }, [slug, syncStateFromPath]);

  return <QueryPageLayout />;
}
