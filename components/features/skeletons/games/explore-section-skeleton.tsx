import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ExploreSectionSkeleton = ({
	totalItems = 8,
}: {
	totalItems?: number;
}) => {
	const duplicatedItems = [...Array(totalItems * 2)].length;
	return (
		<>
			{" "}
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

				.explore-infinite-scroll-container {
					overflow-x: clip;
					position: relative;
					width: 100%;
				}

				.explore-infinite-scroll-track {
					display: flex;
					width: max-content;
					animation-timing-function: linear;
					animation-iteration-count: infinite;
				}

				.explore-scroll-right-to-left {
					animation: scroll-right-to-left 60s linear infinite;
				}

				.explore-item {
					flex-shrink: 0;
					width: 200px;
					margin-right: 12px;
				}

				@media (min-width: 640px) {
					.explore-item {
						margin-right: 16px;
					}
				}

				.explore-infinite-scroll-track:hover {
					animation-play-state: paused;
				}

				.explore-infinite-scroll-container:hover
					.explore-infinite-scroll-track {
					animation-play-state: paused;
				}

				/* Disable all transitions and animations on moving cards to prevent pulse effect */
				.explore-infinite-scroll-track * {
					transition: none !important;
					animation: none !important;
				}

				.explore-infinite-scroll-track .group > div {
					transform: none !important;
					scale: 1 !important;
					box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
				}

				.explore-infinite-scroll-track .group .absolute {
					opacity: 1 !important;
				}

				/* Re-enable effects only when carousel is paused */
				.explore-infinite-scroll-track:hover * {
					transition: all 0.3s ease !important;
				}

				.explore-infinite-scroll-track:hover .group:hover > div {
					transform: scale(1.05) !important;
					box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
						0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
				}

				.explore-infinite-scroll-track:hover .group:hover .absolute {
					opacity: 1 !important;
				}
			`}</style>
			<div className="w-full mb-6 mt-6">
				{/* Section Header Skeleton */}
				<div className="flex items-center gap-4 mb-4">
					<div className="relative">
						<Skeleton className="w-6 h-6 rounded-full bg-linear-to-br from-muted/50 to-muted/30" />
						<div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
					</div>
					<div>
						<Skeleton className="h-8 w-32 bg-linear-to-br from-muted/50 to-muted/30" />
					</div>
				</div>

				{/* Mobile Layout - Fixed Grid Skeleton */}
				<div className="sm:hidden">
					<div className="grid grid-cols-2 gap-3 px-2">
						{Array.from({ length: 8 }).map((_, index) => (
							<div key={index} className="group relative">
								<div
									className="relative overflow-hidden rounded-xl w-full shadow-lg"
									style={{ aspectRatio: "5/4.5" }}
								>
									{/* Background Skeleton */}
									<Skeleton className="absolute inset-0 rounded-xl bg-linear-to-br from-muted/50 to-muted/30" />
									<div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />

									{/* Icon Skeleton */}
									<div className="absolute top-3 left-1/2 transform -translate-x-1/2">
										<Skeleton className="w-10 h-10 rounded-full bg-linear-to-br from-muted/40 to-muted/20" />
									</div>

									{/* Content Skeleton */}
									<div className="absolute bottom-0 left-0 right-0 p-3">
										<div className="text-center space-y-2">
											<Skeleton className="h-4 w-20 mx-auto bg-linear-to-br from-muted/40 to-muted/20" />
											<Skeleton className="h-6 w-16 mx-auto rounded-md bg-linear-to-br from-muted/40 to-muted/20" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Desktop Layout - Single Row Skeleton */}
				<div className="hidden sm:block">
					<div className="explore-infinite-scroll-container">
						<div className="explore-infinite-scroll-track explore-scroll-right-to-left ">
							{Array.from({ length: duplicatedItems }).map(
								(_, index) => (
									<div key={index} className="explore-item">
										<div className="group relative cursor-pointer">
											<div
												className="relative overflow-x-hidden rounded-2xl w-full shadow-lg"
												style={{ aspectRatio: "4/4" }}
											>
												{/* Background Skeleton */}
												<Skeleton className="absolute inset-0 rounded-2xl bg-linear-to-br from-muted/50 to-muted/30" />
												<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />

												{/* Icon Container Skeleton */}
												<div className="absolute top-10 left-1/2 transform -translate-x-1/2">
													<Skeleton className="w-12 h-12 rounded-full bg-linear-to-br from-muted/40 to-muted/20" />
												</div>

												{/* Content Area Skeleton */}
												<div className="absolute bottom-10 left-0 right-0 p-3">
													<div className="text-center">
														<Skeleton className="h-7 w-24 mx-auto rounded-lg bg-linear-to-br from-muted/40 to-muted/20" />
													</div>
												</div>
											</div>
										</div>
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
