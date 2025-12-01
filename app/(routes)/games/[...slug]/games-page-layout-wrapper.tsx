"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/store";
import { QueryPageLayout } from "@/components/features/query-display/page-layout";

export function GamesPageLayoutWrapper({ slug }: { slug: string[] }) {
	const syncStateFromPath = useAppStore(
		(state) => state.query.syncStateFromPath
	);
	const searchParams = useSearchParams();

	useEffect(() => {
		// Parse slug to determine provider and/or category
		// slug[0] could be provider name
		// slug[1] could be category
		// Also pass searchParams to read sort and search query
		if (slug && slug.length > 0) {
			// Convert ReadonlyURLSearchParams to URLSearchParams
			const params = new URLSearchParams(searchParams.toString());
			syncStateFromPath(slug, params);
		}
	}, [slug, searchParams, syncStateFromPath]);

	return <QueryPageLayout />;
}
