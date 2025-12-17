"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDice,
	faSlotMachine,
	faFootball,
	faSpade,
	faTicket,
	faChartLine,
	faVrCardboard,
	faRepeat,
	faCards,
} from "@fortawesome/pro-light-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useTranslations } from "@/lib/locale-provider";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ExploreSectionSkeleton } from "../skeletons/games/explore-section-skeleton";

interface ExploreCategory {
	id: string;
	titleKey: string;
	descriptionKey: string;
	icon: IconDefinition;
	href: string;
	bgImage: string;
	colorScheme: string;
}

const exploreCategories: ExploreCategory[] = [
	{
		id: "poker",
		titleKey: "poker",
		descriptionKey: "pokerDescription",
		icon: faSpade,
		href: "/games?q=POKER",
		bgImage: "/assets/explore/POKER.webp",
		colorScheme: "yellow",
	},
	{
		id: "lottery",
		titleKey: "lottery",
		descriptionKey: "lotteryDescription",
		icon: faTicket,
		href: "/games?q=LOTTERY",
		bgImage: "/assets/explore/LOTTERY.webp",
		colorScheme: "pink",
	},
	{
		id: "futures",
		titleKey: "futures",
		descriptionKey: "futuresDescription",
		icon: faChartLine,
		href: "FUTURES",
		bgImage: "/assets/explore/FUTURES.webp",
		colorScheme: "green",
	},
	{
		id: "vr",
		titleKey: "vr",
		descriptionKey: "vrDescription",
		icon: faVrCardboard,
		href: "VR",
		bgImage: "/assets/explore/VR.webp",
		colorScheme: "red",
	},
	{
		id: "swap",
		titleKey: "swap",
		descriptionKey: "swapDescription",
		icon: faRepeat,
		href: "SWAP",
		bgImage: "/assets/explore/SWAP.webp",
		colorScheme: "violet",
	},
	{
		id: "slots",
		titleKey: "slots",
		descriptionKey: "slotsDescription",
		icon: faSlotMachine,
		href: "/games?q=SLOT",
		bgImage: "/assets/explore/slot.webp",
		colorScheme: "gold",
	},
	{
		id: "live-casino",
		titleKey: "liveCasino",
		descriptionKey: "liveCasinoDescription",
		icon: faCards,
		href: "/games?q=LIVE%20CASINO",
		bgImage: "/assets/explore/Casino.webp",
		colorScheme: "red",
	},
	{
		id: "sports",
		titleKey: "sports",
		descriptionKey: "sportsDescription",
		icon: faFootball,
		href: "/games?q=SPORTSBOOK",
		bgImage: "/assets/explore/Sports.webp",
		colorScheme: "green",
	},
];

export default function ExploreSection  ({ isLoading }: { isLoading?: boolean }) {
	const t = useTranslations("games");
	const router = useRouter();
	const { setShowAuthFlow } = useDynamicContext();

	const getColorClasses = (colorScheme: string) => {
		const colors = {
			blue: {
				primary: "from-blue-500 to-blue-600",
				accent: "bg-blue-500/20",
				border: "border-blue-500/30",
				text: "text-blue-100",
			},
			red: {
				primary: "from-red-500 to-red-600",
				accent: "bg-red-500/20",
				border: "border-red-500/30",
				text: "text-red-100",
			},
			green: {
				primary: "from-green-500 to-green-600",
				accent: "bg-green-500/20",
				border: "border-green-500/30",
				text: "text-green-100",
			},
			purple: {
				primary: "from-purple-500 to-purple-600",
				accent: "bg-purple-500/20",
				border: "border-purple-500/30",
				text: "text-purple-100",
			},
			pink: {
				primary: "from-pink-500 to-pink-600",
				accent: "bg-pink-500/20",
				border: "border-pink-500/30",
				text: "text-pink-100",
			},
			orange: {
				primary: "from-orange-500 to-orange-600",
				accent: "bg-orange-500/20",
				border: "border-orange-500/30",
				text: "text-orange-100",
			},
			cyan: {
				primary: "from-cyan-500 to-cyan-600",
				accent: "bg-cyan-500/20",
				border: "border-cyan-500/30",
				text: "text-cyan-100",
			},
			yellow: {
				primary: "from-yellow-500 to-yellow-600",
				accent: "bg-yellow-500/20",
				border: "border-yellow-500/30",
				text: "text-yellow-100",
			},
			violet: {
				primary: "from-violet-500 to-violet-600",
				accent: "bg-violet-500/20",
				border: "border-violet-500/30",
				text: "text-violet-100",
			},
			gold: {
				primary: "from-amber-500 to-amber-600",
				accent: "bg-amber-500/20",
				border: "border-amber-500/30",
				text: "text-amber-100",
			},
		};
		return colors[colorScheme as keyof typeof colors] || colors.blue;
	};

	const launchFuturesGame = () => {
		// StockMarket00003?vendor=EVOLUTION&gameType=SLOT&gpId=-
		const gameUrl = `/play/StockMarket00003?vendor=EVOLUTION&gameType=SLOT&gpId=-`;
		router.push(gameUrl);
	};

	const launchVrGame = () => {
		const gameUrl = `/play/GonzoTM000000001?vendor=EVOLUTION&gameType=SLOT&gpId=-`;
		router.push(gameUrl);
	};

	const handleClick = (category: ExploreCategory) => {
		// if swap category is clicked, navigate to the swap page
		if (category.id === "swap") {
			setShowAuthFlow(true);
			router.push("?tab=swap");
		} else if (category.id === "vr") {
			launchVrGame();
		} else if (category.id === "futures") {
			launchFuturesGame();
		} else {
			router.push(category.href);
		}
	};

	// Duplicate categories for seamless infinite scrolling
	const duplicatedCategories = [
		...exploreCategories,
		...exploreCategories,
		...exploreCategories,
	];

	if (isLoading) return <ExploreSectionSkeleton totalItems={8} />;

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
				{/* Section Header */}
				<div className="flex items-center gap-4 mb-4">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
						<FontAwesomeIcon
							icon={faDice}
							fontSize={24}
							className="text-primary relative z-10"
						/>
					</div>
					<div>
						<h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
							{t("explore")}
						</h2>
					</div>
				</div>

				{/* Mobile Layout - Fixed Grid */}
				<div className="sm:hidden">
					<div className="grid grid-cols-2 gap-3 px-2">
						{exploreCategories.map((category) => {
							const colors = getColorClasses(
								category.colorScheme
							);
							return (
								<div
									key={category.id}
									className="group relative"
									onClick={() => handleClick(category)}
								>
									<div
										className="relative overflow-hidden rounded-xl w-full bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
										style={{ aspectRatio: "5/4.5" }}
									>
										{/* Background Image */}
										<div
											className="absolute inset-0 bg-cover bg-center opacity-90"
											style={{
												backgroundImage: `url(${category.bgImage})`,
											}}
										/>

										{/* Overlay */}
										<div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

										{/* Icon */}
										<div className="absolute top-3 left-1/2 transform -translate-x-1/2">
											<div
												className={`${colors.accent} backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center ${colors.border} border`}
											>
												<FontAwesomeIcon
													icon={category.icon}
													className="h-4 w-4 text-white"
												/>
											</div>
										</div>

										{/* Content */}
										<div className="absolute bottom-0 left-0 right-0 p-3">
											<div className="text-center">
												<h3 className="text-white font-semibold text-sm mb-2 leading-tight">
													{t(category.titleKey)}
												</h3>
												<div
													className={`bg-gradient-to-r ${colors.primary} rounded-md py-1 px-3 text-xs font-medium text-white`}
												>
													Explore
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Desktop Layout - Single Row Infinite Scroll */}
				<div className="hidden sm:block">
					<div className="explore-infinite-scroll-container">
						<div className="explore-infinite-scroll-track explore-scroll-right-to-left">
							{duplicatedCategories.map((category, index) => {
								const colors = getColorClasses(
									category.colorScheme
								);
								return (
									<div
										key={`${category.id}-${index}`}
										className="explore-item"
									>
										<div
											className="group relative cursor-pointer"
											onClick={() =>
												handleClick(category)
											}
										>
											<div
												className="relative overflow-hidden rounded-2xl w-full bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
												style={{ aspectRatio: "4/4" }}
											>
												{/* Background Image */}
												<div
													className="absolute inset-0 bg-cover bg-center opacity-100 group-hover:opacity-100 transition-opacity duration-300"
													style={{
														backgroundImage: `url(${category.bgImage})`,
													}}
												/>

												{/* Overlay */}
												<div className="absolute inset-0 bg-black/20 group-hover:bg-black/80 transition-colors duration-300" />

												{/* Icon Container */}
												<div className="absolute top-10 left-1/2 transform -translate-x-1/2">
													<div className="relative">
														<div className="absolute inset-0 bg-white/10 blur-md rounded-full scale-150 group-hover:scale-175 transition-transform duration-200" />
														<div
															className={`relative ${colors.accent} backdrop-blur-md rounded-full px-3 py-2 ${colors.border} border group-hover:border-white/50 transition-all duration-150 opacity-0 group-hover:opacity-100`}
														>
															<FontAwesomeIcon
																icon={
																	category.icon
																}
																fontSize={16}
																className=" text-white transition-transform duration-250 group-hover:scale-110"
															/>
														</div>
													</div>
												</div>

												{/* Content Area */}
												<div className="absolute bottom-10 left-0 right-0 p-3">
													<div className="text-center">
														{/* Action Button */}
														<div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 delay-50">
															<div
																className={`bg-gradient-to-r ${colors.primary} hover:shadow-lg rounded-lg py-1.5 px-3 text-xs font-semibold text-white transition-all duration-200 hover:scale-105`}
															>
																{t(
																	category.titleKey
																)}
															</div>
														</div>
													</div>
												</div>

												{/* Shine Effect */}
												<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
