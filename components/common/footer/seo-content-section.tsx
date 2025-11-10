"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/hooks/useI18n";

export function SeoContentSection() {
	const t = useT();
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<section className="border-t border-border/50 bg-card ">
			<div className="container mx-auto consistent-padding-x py-10">
				<div className="mx-auto container max-w-6xl">
					{/* Main Content */}
					<div className="mb-8">
						<h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-chart-1 to-primary bg-clip-text text-transparent mb-4">
							{t("footer.seoContent.title")}
						</h2>
						<div className="space-y-3 text-sm  text-foreground/80 leading-relaxed">
							<p>{t("footer.seoContent.paragraph1")}</p>
							{isExpanded && (
								<>
									<p className="animate-[fade-in_0.3s_ease-out]">
										{t("footer.seoContent.paragraph2")}
									</p>
									<p className="animate-[fade-in_0.3s_ease-out_0.1s_backwards]">
										{t("footer.seoContent.paragraph3")}
									</p>
								</>
							)}
						</div>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="mt-3 text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-all group"
						>
							{isExpanded
								? t("footer.seoContent.showLess")
								: t("footer.seoContent.showMore")}
							<ChevronDown
								className={`size-4 transition-transform ${
									isExpanded ? "rotate-180" : ""
								}`}
							/>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
