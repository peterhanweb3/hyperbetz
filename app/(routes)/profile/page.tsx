"use client";

import { Suspense } from "react";
import { ProfilePage } from "@/components/features/profile/profile-page";
import { QueryPageSkeleton } from "@/components/features/skeletons/query-display/query-page-skeleton";

export default function ProfilePageRoute() {
  return (
    <Suspense fallback={<QueryPageSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}
