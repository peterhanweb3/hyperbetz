"use client";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LobbySliderProps {
	imageUrls: string[];
	referralLinks: string[];
}

export function LobbySlider({ imageUrls, referralLinks }: LobbySliderProps) {
	const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
	const router = useRouter();

	// Ensure we have the same number of images and links
	const slides = imageUrls.map((imageUrl, index) => ({
		imageUrl,
		referralLink: referralLinks[index] || "#",
	}));

	const handleSlideClick = (referralLink: string) => {
		if (referralLink && referralLink == "deposit") {
			// add ?tab=deposit to path param in browser
			router.push(`?tab=deposit`);
		} else if (referralLink && referralLink == "affiliate") {
			// add ?tab=affiliate to path param in browser
			router.push(`/affiliate`);
		} else if (referralLink && referralLink !== "#") {
			window.open(referralLink, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<div className="w-full">
			<Carousel
				plugins={[plugin.current]}
				className="w-full"
				onMouseEnter={plugin.current.stop}
				onMouseLeave={plugin.current.reset}
				opts={{
					align: "start",
					loop: true,
					slidesToScroll: 1,
					// Desktop and tablets: 2 slides per view
					// Mobile: 1 slide per view (handled by responsive classes)
				}}
			>
				<CarouselContent className="-ml-3 md:-ml-6">
					{slides.map((slide, index) => (
						<CarouselItem
							key={index}
							className="pl-3 md:pl-6 md:basis-1/2 lg:basis-1/2"
						>
							<Card className="overflow-hidden py-0 cursor-pointer rounded-2xl">
								<CardContent className="p-0 relative">
									<div
										className="relative h-48 md:h-64 lg:h-72 rounded-2xl"
										onClick={() =>
											handleSlideClick(slide.referralLink)
										}
									>
										<Image
											src={slide.imageUrl}
											alt={`Slide ${index + 1}`}
											fill
										/>

										{/* Overlay gradient */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl" />
									</div>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Navigation arrows */}
				<CarouselPrevious className="left-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
				<CarouselNext className="right-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
			</Carousel>
		</div>
	);
}
