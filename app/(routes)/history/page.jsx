"use client";

import { Suspense } from "react";
// import { ProfilePage } from "@/components/features/profile/profile-page";
import { HistoryPage } from "@/components/features/history/history-page";
import { QueryPageSkeleton } from "@/components/features/skeletons/query-display/query-page-skeleton";

export default function ProfilePageRoute() {
	return (
		<Suspense fallback={<QueryPageSkeleton />}>
			<HistoryPage />
		</Suspense>
	);
}
