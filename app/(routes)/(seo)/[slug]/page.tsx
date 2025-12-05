import { getSeoPageBySlug } from "@/modules/seo/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { StructuredData } from "@/components/features/seo/StructuredData";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import { CarouselRenderer } from "@/modules/seo/components/carousel-renderer";
import type { CarouselsState } from "@/modules/seo/components/SeoPageForm";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	try {
		const { slug } = await params;
		const config = await getDynamicSEOConfig();
		const page = await getSeoPageBySlug(slug);
		if (!page) return {};

		return {
			title: page.title,
			description: page.description,
			keywords: page.keywords?.split(",").map((k: string) => k.trim()),
			openGraph: {
				title: page.title,
				description: page.description,
				type: "website",
				url: `${config.defaultDomain}/${slug}`,
			},
		};
	} catch (error) {
		console.error("Error generating metadata for SEO page:", error);
		return {
			title: "Page",
		};
	}
}

export default async function SeoPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	let page;
	try {
		page = await getSeoPageBySlug(slug);
	} catch (error) {
		console.error("Error fetching SEO page:", error);
		notFound();
	}

	if (!page || !page.published) {
		notFound();
	}

	const carousels = page.carousels as unknown as CarouselsState;

	return (
		<>
			{page.structuredData && (
				<StructuredData data={JSON.parse(page.structuredData)} />
			)}

			<div className="min-h-screen bg-background ">
				<div className="container mx-auto px-4 py-12 max-w-6xl">
					<div className=" mx-auto mb-8">
						<h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
							{page.title}
						</h1>
					</div>

					{/* Top Carousels */}
					<CarouselRenderer config={carousels} position="top" />

					<div
						className="prose prose-lg dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: page.content }}
					/>

					{/* Bottom Carousels */}
					<CarouselRenderer config={carousels} position="bottom" />
				</div>
			</div>
		</>
	);
}
