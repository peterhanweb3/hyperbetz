"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

interface BreakpointColumns {
	base?: number;
	sm?: number;
	md?: number;
	lg?: number;
	xl?: number;
	"2xl"?: number;
	"3xl"?: number;
	"4xl"?: number;
}

interface DynamicGameCarouselListSkeletonProps {
	totalRows?: number;
	totalColumns?: BreakpointColumns | number;
}

export default function DynamicGameCarouselListSkeleton({
	totalRows = 3,
	totalColumns = { base: 2, sm: 3, md: 4, lg: 5, xl: 6, "2xl": 7, "3xl": 8 },
}: DynamicGameCarouselListSkeletonProps) {
	// Convert legacy number to object format
	const columnsConfig: BreakpointColumns = useMemo(() => {
		return typeof totalColumns === "number"
			? {
					base: 2,
					sm: 3,
					md: 4,
					lg: 5,
					xl: Math.min(totalColumns, 12),
					"2xl": Math.min(totalColumns, 12),
					"3xl": Math.min(totalColumns, 12),
			  }
			: totalColumns;
	}, [totalColumns]);

	// Detect current breakpoint and number of items to show
	const [itemsToShow, setItemsToShow] = useState(
		columnsConfig.base || columnsConfig.sm || 2
	);

	useEffect(() => {
		const updateItemsToShow = () => {
			const width = window.innerWidth;

			// Tailwind default breakpoints
			if (width >= 1920) {
				// 4xl (custom breakpoint from globals.css)
				setItemsToShow(
					columnsConfig["4xl"] ||
						columnsConfig["3xl"] ||
						columnsConfig["2xl"] ||
						columnsConfig.xl ||
						columnsConfig.lg ||
						8
				);
			} else if (width >= 1536) {
				// 3xl (custom from globals.css)
				setItemsToShow(
					columnsConfig["3xl"] ||
						columnsConfig["2xl"] ||
						columnsConfig.xl ||
						columnsConfig.lg ||
						8
				);
			} else if (width >= 1280) {
				// 2xl
				setItemsToShow(
					columnsConfig["2xl"] ||
						columnsConfig.xl ||
						columnsConfig.lg ||
						7
				);
			} else if (width >= 1024) {
				// xl
				setItemsToShow(columnsConfig.xl || columnsConfig.lg || 6);
			} else if (width >= 768) {
				// lg (Tailwind's lg is 1024, but we use 768 for more granular control)
				setItemsToShow(columnsConfig.lg || columnsConfig.md || 5);
			} else if (width >= 640) {
				// md
				setItemsToShow(columnsConfig.md || columnsConfig.sm || 4);
			} else if (width >= 480) {
				// sm
				setItemsToShow(columnsConfig.sm || columnsConfig.base || 3);
			} else {
				// base
				setItemsToShow(columnsConfig.base || 2);
			}
		};

		updateItemsToShow();
		window.addEventListener("resize", updateItemsToShow);

		return () => window.removeEventListener("resize", updateItemsToShow);
	}, [columnsConfig]);

	// Build grid class based on current items to show
	const getGridClass = (cols: number): string => {
		const gridMap: Record<number, string> = {
			1: "grid-cols-1",
			2: "grid-cols-2",
			3: "grid-cols-3",
			4: "grid-cols-4",
			5: "grid-cols-5",
			6: "grid-cols-6",
			7: "grid-cols-7",
			8: "grid-cols-8",
			9: "grid-cols-9",
			10: "grid-cols-10",
			11: "grid-cols-11",
			12: "grid-cols-12",
		};
		return gridMap[Math.min(Math.max(cols, 1), 12)] || "grid-cols-5";
	};

	return (
		<div className="space-y-12">
			{[...Array(totalRows)].map((_, i) => (
				<div key={i} className="w-full space-y-4">
					<div className="relative w-48">
						<Skeleton className="h-8 w-48 rounded-xl bg-linear-to-br from-muted/50 to-muted/30" />
						<div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
					</div>
					<div
						className={cn("grid gap-4", getGridClass(itemsToShow))}
					>
						{[...Array(itemsToShow)].map((_, j) => (
							<div key={j} className="relative">
								<Skeleton className="h-48 w-full rounded-2xl bg-linear-to-br from-muted/40 to-muted/20" />
								<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
