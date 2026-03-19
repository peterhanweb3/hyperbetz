"use client";

import { Button } from "@/components/ui/button";
import {
	CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from "@/components/ui/carousel";
import { HeroSlideData } from "@/types/features/hero-banner-section.types";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "@/lib/locale-provider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

// --- Enhanced Hero Slider Component ---
export default function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
	const { setShowAuthFlow, primaryWallet } = useDynamicContext();
	const tHero = useTranslations("hero");
	const tGames = useTranslations("games");
	const router = useRouter();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [api, setApi] = useState<CarouselApi>();

	useEffect(() => {
		// 1. Don't do anything until the carousel API is ready
		if (!api) {
			return;
		}

		// 2. The event handler: This function will run every time the carousel's state changes.
		const onSelect = () => {
			// 3. Get the new slide index from the carousel's internal API and update our React state.
			setCurrentSlide(api.selectedScrollSnap());
		};

		// 4. Subscribe to the 'select' event.
		api.on("select", onSelect);

		// 5. CRUCIAL: Unsubscribe from the event when the component is unmounted.
		// This prevents memory leaks.
		return () => {
			api.off("select", onSelect);
		};
	}, [api]); // This effect runs only when the `api` object itself changes.

	return (
		<div className="relative group">
			<Carousel
				className="w-full"
				// opts={{ loop: true }}
				plugins={[
					Autoplay({
						delay: 4000,
						stopOnInteraction: true,
						stopOnMouseEnter: true,
					}),
				]}
				setApi={setApi}
			>
				<CarouselContent>
					{slides.map((slide, index) => (
						<CarouselItem key={index}>
							<div
								className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden p-8 md:p-12 flex flex-col justify-center items-start"
								style={{ backgroundColor: "var(--primary)" }}
							>
								<Image
									src={slide.backgroundImageUrl}
									alt="Background"
									fill
									className="absolute inset-0 w-full h-full object-cover object-center "
									style={{ mixBlendMode: "hard-light" }}
									priority
									fetchPriority="high"
								/>
								{/* Glass morphism effect */}
								{/* <div className="absolute inset-0 backdrop-blur-[1px]" /> */}

								<div className="relative z-10 max-w-2xl text-white">
									<h2
										className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter 
                      drop-shadow-2xl text-shadow-lg
                      bg-gradient-to-r from-white via-white to-white/90 bg-clip-text 
                      animate-in slide-in-from-bottom-4 duration-700"
									>
										{/* Localize known slides via i18nKey, else fallback to provided title */}
										{slide.i18nKey === "guest" && (
											<>
												<span className="text-destructive text-2xl md:text-4xl lg:text-6xl">
													{tHero("guest.title")}
												</span>
											</>
										)}
										{slide.i18nKey === "welcome" && (
											<>
												<span className="text-destructive text-2xl md:text-4xl lg:text-6xl">
													{tHero("welcome.title1")}
												</span>
												<br />
												{tHero("welcome.title2")}
											</>
										)}
										{slide.i18nKey === "jackpot" && (
											<>
												<span className="text-primary">
													{tHero("jackpot.title1")}
												</span>
												<br />
												{tHero("jackpot.title2")}
											</>
										)}
										{!slide.i18nKey &&
											(typeof slide.title === "string"
												? slide.title
												: slide.title)}
									</h2>
									<p
										className="mt-3 max-w-md text-sm md:text-lg text-white/90 drop-shadow-lg 
                      animate-in slide-in-from-bottom-4 delay-150"
									>
										{slide.i18nKey
											? tHero(`${slide.i18nKey}.subtitle`)
											: slide.game
												? tGames("byProvider", {
														name: slide.game
															.provider_name,
													})
												: slide.subtitle}
									</p>

									{/* Two Buttons Container */}
									<div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-6 justify-center">
										{!primaryWallet && ( // Show "Connect Wallet" if not connected
											<Button
												size="lg"
												className="shadow-2xl shadow-primary/20 
                          bg-primary/90 hover:bg-primary backdrop-blur-sm
                          border border-primary/20 hover:border-primary/40
                          transition-all duration-200 ease-out
                          hover:scale-105 hover:shadow-2xl hover:shadow-primary/30
                          animate-in slide-in-from-bottom-4"
												onClick={() =>
													setShowAuthFlow(true)
												}
											>
												{tHero("ctaExploreGames")}
											</Button>
										)}
										<Button
											size="lg"
											variant="outline"
											className="shadow-2xl shadow-destructive/20 
                          bg-destructive/90 hover:bg-destructive backdrop-blur-sm
                          border border-destructive/20 hover:border-destructive/40
                          transition-all duration-200 ease-out text-white
                          hover:scale-105 hover:shadow-2xl hover:shadow-destructive/30
                          animate-in slide-in-from-bottom-4 "
											onClick={() =>
												router.push("/games")
											}
										>
											{tHero("ctaJoinAffiliate")}
										</Button>
									</div>
								</div>

								{/* Subtle animated particles effect */}
								{/* <div className="absolute inset-0 opacity-20">
									<div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
									<div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" />
									<div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce" />
								</div> */}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				<CarouselPrevious
					className="absolute left-4 top-1/2 -translate-y-1/2 
              bg-background/20 border-white/20 text-white
              hover:bg-background/40 hover:border-white/40
              backdrop-blur-md transition-all duration-300
              opacity-0 group-hover:opacity-100
              hover:scale-110 shadow-lg"
				/>
				<CarouselNext
					className="absolute right-4 top-1/2 -translate-y-1/2
              bg-background/20 border-white/20 text-white
              hover:bg-background/40 hover:border-white/40
              backdrop-blur-md transition-all duration-300
              opacity-0 group-hover:opacity-100
              hover:scale-110 shadow-lg"
				/>
			</Carousel>

			{/* Enhanced Custom Slider Indicators */}
			<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
				{slides.map((_, i) => (
					<div
						key={i}
						className={`h-2 rounded-full transition-all duration-500 cursor-pointer
                ${
					i === currentSlide
						? "w-8 bg-white shadow-lg shadow-white/30"
						: "w-2 bg-white/40 hover:bg-white/60"
				}`}
						onClick={() => {
							setCurrentSlide(i);
							api?.scrollTo(i);
						}}
					/>
				))}
			</div>

			{/* Subtle border glow */}
			<div className="absolute inset-0 rounded-2xl border border-primary/10 pointer-events-none" />
		</div>
	);
}
