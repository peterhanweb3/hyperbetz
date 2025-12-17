"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface GameCarouselSkeletonProps {
	showTitle?: boolean;
}

export const GameCarouselSkeleton = ({
	showTitle = true,
}: GameCarouselSkeletonProps) => {
	return (
		<div className="space-y-6">
			{/* Title Skeleton */}
			{showTitle && (
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-9 w-20" />
				</div>
			)}

			{/* Carousel Skeleton */}
			<div className="relative">
				<div className="flex gap-4 overflow-hidden">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="shrink-0 w-64">
							<div className="space-y-3">
								{/* Game Image Skeleton */}
								<Skeleton className="h-40 w-full rounded-lg" />
								
								{/* Game Title Skeleton */}
								<Skeleton className="h-4 w-3/4" />
								
								{/* Game Category Skeleton */}
								<Skeleton className="h-3 w-1/2" />
								
								{/* Game Rating/Badge Skeleton */}
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-12" />
									<Skeleton className="h-5 w-8" />
								</div>
							</div>
						</div>
					))}
				</div>
				
				{/* Navigation Button Skeletons */}
				<Skeleton className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" />
				<Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" />
			</div>
		</div>
	);
};
