import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProviderCarouselSkeletonProps {
	className?: string;
	isSingleRow?: boolean;
	totalItems?: number;
}

// Skeleton version of ProviderGridCard
const ProviderGridCardSkeleton = ({ className }: { className?: string }) => {
	// return (
	// 	<div className={cn("block h-full", className)}>
	// 		<div className="relative backdrop-blur-sm border border-border/50 rounded-xl shadow-sm h-full min-h-[200px] flex flex-col overflow-hidden">
	// 			{/* Subtle linear overlay */}
	// 			<div className="absolute inset-0 bg-linear-to-br from-muted/50 to-muted/30 animate-pulse"></div>

	// 			{/* Icon Section - Takes up 75% of the card */}
	// 			<div className="relative flex justify-center items-center px-3 py-3 h-3/4">
	// 				<div className="relative w-full h-full">
	// 					<div className="w-full h-full rounded-lg  shadow-sm flex items-center justify-center">
	// 						<Skeleton className="w-[85%] h-[85%] rounded-md bg-linear-to-br from-muted/40 to-muted/20" />
	// 					</div>
	// 				</div>
	// 			</div>

	// 			{/* Content Section - Takes up 25% of the card */}
	// 			<div className="relative h-1/4 p-3 pt-0 text-center flex flex-col justify-center items-center space-y-2">
	// 				<Skeleton className="h-4 w-24 bg-linear-to-br from-muted/40 to-muted/20" />
	// 				<Skeleton className="h-3 w-16 bg-linear-to-br from-muted/40 to-muted/20" />
	// 			</div>
	// 		</div>
	// 	</div>
	// );

	return (
		<div className={cn("block h-full", className)}>
			<div className="relative backdrop-blur-sm border border-border/50 rounded-xl shadow-sm h-full min-h-[200px] flex flex-col overflow-hidden">
				{/* Highlight linear overlay identical to Layout1 */}
				<div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse"></div>

				{/* Icon Section */}
				<div className="relative flex justify-center items-center px-3 py-3 h-3/4">
					<div className="relative w-full h-full">
						<div className="w-full h-full rounded-lg shadow-sm flex items-center justify-center">
							{/* Same muted linear as Layout1 */}
							<Skeleton className="w-[85%] h-[85%] rounded-md bg-linear-to-br from-muted/50 to-muted/30" />
						</div>
					</div>
				</div>

				{/* Content Section */}
				<div className="relative h-1/4 p-3 pt-0 text-center flex flex-col justify-center items-center space-y-2">
					{/* Matching Layout1 text bar gradients */}
					<Skeleton className="h-4 w-24 rounded-md bg-linear-to-br from-muted/40 to-muted/20" />
					<Skeleton className="h-3 w-16 rounded-md bg-linear-to-br from-muted/40 to-muted/20" />
				</div>
			</div>
		</div>
	);
};

export default function ProviderCarouselSectionSkeleton({
	className,
	isSingleRow = false,
	totalItems = 6,
}: ProviderCarouselSkeletonProps) {
	// Generate a base set of skeleton providers (default 6)
	const skeletonProviders = Array.from({ length: totalItems }, (_, i) => ({
		id: `skeleton-${i}`,
	}));

	// Duplicate each base set twice to keep a seamless loop without ballooning DOM nodes
	const repeatCount = 2;
	const displayFirstRow = Array.from(
		{ length: repeatCount },
		() => skeletonProviders
	).flat();
	const displaySecondRow = Array.from(
		{ length: repeatCount },
		() => skeletonProviders
	).flat();

	return (
		<>
			<style jsx>{`
				@keyframes scroll-right-to-left {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(-50%);
					}
				}

				@keyframes scroll-left-to-right {
					0% {
						transform: translateX(-50%);
					}
					100% {
						transform: translateX(0);
					}
				}

				.infinite-scroll-container {
					overflow: hidden;
					position: relative;
					width: 100%;
					padding: 2px 0px;
				}

				.infinite-scroll-track {
					display: flex;
					width: max-content;
					animation-timing-function: linear;
					animation-iteration-count: infinite;
				}

				.scroll-right-to-left {
					animation: scroll-right-to-left 120s linear infinite;
				}

				.scroll-left-to-right {
					animation: scroll-left-to-right 130s linear infinite;
				}

				.provider-item {
					flex-shrink: 0;
					width: 200px;
					margin-right: 12px;
				}

				@media (min-width: 640px) {
					.provider-item {
						margin-right: 16px;
					}
				}

				/* No hover effects for skeleton - keep animation consistent */
				.infinite-scroll-track * {
					transition: none !important;
					animation: none !important;
				}

				.infinite-scroll-track .skeleton-card {
					transform: none !important;
					scale: 1 !important;
					box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
				}
			`}</style>
			<div className={cn("w-full mb-6 mt-2", className)}>
				{/* SECTION HEADER SKELETON */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
					<div className="flex items-center gap-3">
						<div className="relative">
							<Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-md bg-linear-to-br from-muted/50 to-muted/30" />
							<div className="absolute inset-0 rounded-md bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
						</div>
						<div className="relative">
							<Skeleton className="h-6 sm:h-8 w-48 bg-linear-to-br from-muted/50 to-muted/30" />
							<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							disabled
							variant="outline"
							size="sm"
							className="text-xs sm:text-sm border-0! "
						>
							<Skeleton className="h-4 w-16 bg-linear-to-br from-muted/40 to-muted/20" />
						</Button>
					</div>
				</div>

				{/* DUAL ROW CONTAINER */}
				{isSingleRow ? (
					<div className="flex gap-2 md:gap-4 w-full">
						{Array.from({ length: 6 }).map((_, index) => (
							<ProviderGridCardSkeleton
								key={`single-row-skeleton-${index}`}
								className="flex-1 min-w-[150px]"
							/>
						))}
					</div>
				) : (
					<div className="space-y-3 sm:space-y-4">
						<div className="infinite-scroll-container">
							<div className="infinite-scroll-track scroll-right-to-left">
								{displayFirstRow.map((provider, index) => (
									<div
										key={`row1-${provider.id}-${index}`}
										className="provider-item skeleton-card"
									>
										<ProviderGridCardSkeleton />
									</div>
								))}
							</div>
						</div>

						<div className="infinite-scroll-container">
							<div className="infinite-scroll-track scroll-left-to-right">
								{displaySecondRow.map((provider, index) => (
									<div
										key={`row2-${provider.id}-${index}`}
										className="provider-item skeleton-card"
									>
										<ProviderGridCardSkeleton />
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
