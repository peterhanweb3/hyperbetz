// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
// import { Building2 } from "lucide-react";
// import Autoplay from "embla-carousel-autoplay";
// import { useRef } from "react";
// import { ProviderGridCard } from "../query-display/provider-grid-card";

// interface ProviderCarouselSectionProps {
//   title: string;
//   providers: string[];
//   viewAllUrl: string;
// }

// export const ProviderCarouselSection = ({ title, providers, viewAllUrl }: ProviderCarouselSectionProps) => {
//   if (!providers || providers.length === 0) {
//     return null;
//   }

//   // Create autoplay plugin instances with refs for control
//   const autoplayPlugin1 = useRef(
//     Autoplay({
//       delay: 2500,
//       stopOnInteraction: false, // Don't stop on interaction initially
//       stopOnMouseEnter: false, // Don't stop on mouse enter initially
//       stopOnFocusIn: false, // Don't stop on focus
//     })
//   );

//   const autoplayPlugin2 = useRef(
//     Autoplay({
//       delay: 2800, // Slightly different delay for visual variety
//       stopOnInteraction: false,
//       stopOnMouseEnter: false,
//       stopOnFocusIn: false,
//     })
//   );

//   // Duplicate providers for seamless infinite scrolling
//   const duplicatedProviders = [...providers, ...providers, ...providers];

//   // Split providers into two rows
//   const midpoint = Math.ceil(duplicatedProviders.length / 2);
//   const firstRowProviders = duplicatedProviders.slice(0, midpoint);
//   const secondRowProviders = duplicatedProviders.slice(midpoint);

//   // Handle mouse interactions
//   const handleMouseEnter = (pluginRef: any) => {
//     pluginRef.current?.stop();
//   };

//   const handleMouseLeave = (pluginRef: any) => {
//     pluginRef.current?.play();
//   };

//   const handleClick = (pluginRef: any) => {
//     pluginRef.current?.stop();
//     // Restart after 5 seconds
//     setTimeout(() => {
//       pluginRef.current?.play();
//     }, 5000);
//   };

//   return (
//     <div className="w-full mb-6 mt-2">
//       {/* SECTION HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
//         <div className="flex items-center gap-3">
//           <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
//           <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
//             <Link href={viewAllUrl}>View All</Link>
//           </Button>
//         </div>
//       </div>

//       {/* DUAL ROW CAROUSEL CONTAINER */}
//       <div className="space-y-3 sm:space-y-4">
//         {/* FIRST ROW - LEFT TO RIGHT */}
//         <div onMouseEnter={() => handleMouseEnter(autoplayPlugin1)} onMouseLeave={() => handleMouseLeave(autoplayPlugin1)} onClick={() => handleClick(autoplayPlugin1)} className="cursor-pointer">
//           <Carousel
//             opts={{
//               align: "start",
//               loop: true, // Always enable loop for continuous scrolling
//               dragFree: true, // Allow free dragging
//             }}
//             plugins={[autoplayPlugin1.current]}
//             className="w-full">
//             <CarouselContent className="-ml-2 sm:-ml-4">
//               {firstRowProviders.map((providerName, index) => (
//                 <CarouselItem key={`row1-${providerName}-${index}`} className="pl-2 sm:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8">
//                   <ProviderGridCard name={providerName} />
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//           </Carousel>
//         </div>

//         {/* SECOND ROW - RIGHT TO LEFT */}
//         <div onMouseEnter={() => handleMouseEnter(autoplayPlugin2)} onMouseLeave={() => handleMouseLeave(autoplayPlugin2)} onClick={() => handleClick(autoplayPlugin2)} className="cursor-pointer">
//           <Carousel
//             opts={{
//               align: "start",
//               loop: true,
//               dragFree: true,
//               direction: "rtl", // Right to left movement
//             }}
//             plugins={[autoplayPlugin2.current]}
//             className="w-full">
//             <CarouselContent className="-ml-2 sm:-ml-4" dir="rtl">
//               {secondRowProviders.map((providerName, index) => (
//                 <CarouselItem key={`row2-${providerName}-${index}`} className="pl-2 sm:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8">
//                   <div dir="ltr">
//                     <ProviderGridCard name={providerName} />
//                   </div>
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//           </Carousel>
//         </div>
//       </div>
//     </div>
//   );
// };
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProviderGridCard } from "../query-display/provider-grid-card";
import { useAppStore } from "@/store/store";
import { memo, useMemo } from "react";
import {
	selectAllProviders,
	selectProvidersByCategory,
} from "@/store/selectors/query/query.selectors";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBuildings } from "@fortawesome/pro-light-svg-icons";

interface ProviderCarouselSectionProps {
	title: string;
	viewAllUrl: string;
	maxProviders?: number;
	Icon: IconDefinition;
	firstRowFilter: string;
	secondRowFilter: string;
	providers?: Array<{ name: string; count: number; icon_url?: string }>; // Optional override for providers
	onViewAllClick?: () => void;
}

export const ProviderCarouselSection = memo(function ProviderCarouselSection({
	title,
	viewAllUrl,
	maxProviders = 12,
	Icon = faBuildings,
	firstRowFilter,
	secondRowFilter,
	providers: overrideProviders,
	onViewAllClick,
}: ProviderCarouselSectionProps) {
	const tCommon = useTranslations("common");
	const enableAutoscroll =
		process.env.NEXT_PUBLIC_ENABLE_PROVIDER_ANIMATION === "true";

	// Selectors for each row
	const firstRowSelector = useMemo(
		() =>
			firstRowFilter && firstRowFilter !== "all"
				? selectProvidersByCategory(firstRowFilter)
				: selectAllProviders,
		[firstRowFilter]
	);
	const secondRowSelector = useMemo(
		() =>
			secondRowFilter && secondRowFilter !== "all"
				? selectProvidersByCategory(secondRowFilter)
				: selectAllProviders,
		[secondRowFilter]
	);

	// Get providers for each row
	const firstRowProvidersRaw = useAppStore(firstRowSelector);
	const secondRowProvidersRaw = useAppStore(secondRowSelector);

	// Prefer override if present (for search), else use store
	const firstRowProviders = useMemo(
		() =>
			overrideProviders
				? overrideProviders
				: firstRowProvidersRaw.slice(0, maxProviders),
		[overrideProviders, firstRowProvidersRaw, maxProviders]
	);
	const secondRowProviders = useMemo(
		() =>
			overrideProviders
				? overrideProviders
				: secondRowProvidersRaw.slice(0, maxProviders),
		[overrideProviders, secondRowProvidersRaw, maxProviders]
	);

	// For infinite scroll, duplicate
	const shouldUseInfiniteScroll = useMemo(
		() => enableAutoscroll && !overrideProviders,
		[enableAutoscroll, overrideProviders]
	);
	const displayFirstRow = useMemo(
		() =>
			shouldUseInfiniteScroll
				? [
						...firstRowProviders,
						...firstRowProviders,
						...firstRowProviders,
						...firstRowProviders,
				  ]
				: firstRowProviders,
		[shouldUseInfiniteScroll, firstRowProviders]
	);
	const displaySecondRow = useMemo(
		() =>
			shouldUseInfiniteScroll
				? [
						...secondRowProviders,
						...secondRowProviders,
						...secondRowProviders,
						...secondRowProviders,
				  ]
				: secondRowProviders,
		[shouldUseInfiniteScroll, secondRowProviders]
	);

	const combinedProviders = useMemo(() => {
		const providerMap = new Map<
			string,
			(typeof firstRowProviders)[number]
		>();
		[...firstRowProviders, ...secondRowProviders].forEach((provider) => {
			if (!providerMap.has(provider.name)) {
				providerMap.set(provider.name, provider);
			}
		});
		return Array.from(providerMap.values()).slice(0, maxProviders);
	}, [firstRowProviders, secondRowProviders, maxProviders]);

	if (
		(!firstRowProviders || firstRowProviders.length === 0) &&
		(!secondRowProviders || secondRowProviders.length === 0)
	) {
		return null;
	}

	return (
		<>
			{shouldUseInfiniteScroll && (
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

					/* Slower speed: increase duration to 120s and 130s */
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

					.infinite-scroll-track:hover {
						animation-play-state: paused;
					}

					.infinite-scroll-container:hover .infinite-scroll-track {
						animation-play-state: paused;
					}

					/* Disable all transitions and animations on moving cards to prevent pulse effect */
					.infinite-scroll-track * {
						transition: none !important;
						animation: none !important;
					}

					.infinite-scroll-track .group > div {
						transform: none !important;
						scale: 1 !important;
						box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
						border-color: hsl(var(--border) / 0.5) !important;
					}

					.infinite-scroll-track .group img {
						transform: none !important;
						scale: 1 !important;
					}

					.infinite-scroll-track .group h3 {
						color: hsl(var(--foreground)) !important;
					}

					.infinite-scroll-track .group .absolute {
						opacity: 0 !important;
					}

					/* Re-enable effects only when carousel is paused */
					.infinite-scroll-track:hover * {
						transition: all 0.3s ease !important;
					}

					.infinite-scroll-track:hover .group:hover > div {
						transform: scale(1.02) !important;
						box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
							0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
						border-color: hsl(var(--primary) / 0.3) !important;
					}

					.infinite-scroll-track:hover .group:hover img {
						transform: scale(1.05) !important;
					}

					.infinite-scroll-track:hover .group:hover h3 {
						color: hsl(var(--primary)) !important;
					}

					.infinite-scroll-track:hover .group:hover .absolute {
						opacity: 1 !important;
					}
				`}</style>
			)}
			<div className="w-full mb-6 mt-2">
				{/* SECTION HEADER */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={Icon as IconDefinition}
							fontSize={24}
							className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
						/>

						<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
							{title}
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<Button
							asChild
							variant="outline"
							size="sm"
							className="text-xs sm:text-sm"
						>
							<Link
								href={viewAllUrl}
								onClick={() => onViewAllClick?.()}
							>
								{tCommon("viewAll")}
							</Link>
						</Button>
					</div>
				</div>

				{/* DUAL ROW CONTAINER - Infinite scroll for regular browsing, static grid for search results */}
				<div className="space-y-3 sm:space-y-4">
					{shouldUseInfiniteScroll ? (
						<>
							{/* FIRST ROW - Casino Providers */}
							<div className="infinite-scroll-container">
								<div className="infinite-scroll-track scroll-right-to-left">
									{displayFirstRow.map((provider, index) => (
										<div
											key={`row1-${provider.name}-${index}`}
											className="provider-item"
										>
											<ProviderGridCard
												name={provider.name}
												gameCount={provider.count}
												iconUrl={provider.icon_url}
											/>
										</div>
									))}
								</div>
							</div>
							{/* SECOND ROW - Slot Providers */}
							<div className="infinite-scroll-container">
								<div className="infinite-scroll-track scroll-left-to-right">
									{displaySecondRow.map((provider, index) => (
										<div
											key={`row2-${provider.name}-${index}`}
											className="provider-item"
										>
											<ProviderGridCard
												name={provider.name}
												gameCount={provider.count}
												iconUrl={provider.icon_url}
											/>
										</div>
									))}
								</div>
							</div>
						</>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
							{combinedProviders.map((provider, index) => (
								<ProviderGridCard
									key={`provider-${provider.name}-${index}`}
									name={provider.name}
									gameCount={provider.count}
									iconUrl={provider.icon_url}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
});
