"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BlogSliderScrollControls() {
	const scroll = (direction: "left" | "right") => {
		const container = document.getElementById("blog-slider-container");
		if (container) {
			const scrollAmount = 400;
			container.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={() => scroll("left")}
				className="hidden sm:flex"
			>
				<span className="sr-only">Scroll left</span>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={() => scroll("right")}
				className="hidden sm:flex"
			>
				<span className="sr-only">Scroll right</span>
				<ChevronRight className="h-4 w-4" />
			</Button>
			<Button asChild variant="default">
				<Link href="/blog" className="gap-2">
					View All
					<ArrowRight className="h-4 w-4" />
				</Link>
			</Button>
		</div>
	);
}
