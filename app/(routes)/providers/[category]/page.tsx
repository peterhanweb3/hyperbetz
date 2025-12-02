import { Suspense } from "react";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { ProviderPageLayoutWrapper } from "./provider-page-layout-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { interpolateSiteName } from "@/lib/utils/site-config";
import { JsonLd } from "@/components/features/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/utils/seo/schema-generator";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";

const VendorPageSkeleton = () => (
	<div className="space-y-6">
		<Skeleton className="h-20 w-full rounded-lg" />
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{[...Array(12)].map((_, i) => (
				<Skeleton key={i} className="h-24 w-full rounded-lg" />
			))}
		</div>
	</div>
);

interface PageProps {
	params: Promise<{ category: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { category } = await params;
	const config = await getDynamicSEOConfig();
	const categoryName = decodeURIComponent(category)
		.replace(/-/g, " ")
		.split(" ")
		.map(
			(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join(" ");
	const siteName = interpolateSiteName(`{siteName}`);
	const title = categoryName.toLowerCase().includes("casino")
		? `Online Live Crypto Casino Games with real Dealers | Play with Bitcoin at ${siteName}`
		: `Top ${categoryName} Game Providers | Play Casino Games at ${siteName}`;

	const description = categoryName.toLowerCase().includes("casino")
		? ` Experience real dealers, instant crypto payments, and fair play at ${siteName} Live Casino. Join today to play blackjack, roulette, and more  anytime, anywhere.`
		: `Discover the best ${categoryName} game providers on ${siteName}. Play games from top providers with exciting features and big wins.`;

	return generateSEOMetadata({
		title,
		description,
		keywords: [
			categoryName,
			"providers",
			"game providers",
			"casino",
			"online gaming",
		],
		path: `/providers/${category}`,
		pageType: "providers",
		ogType: "website",
		ogUrl: `${config.defaultDomain}/providers/${category}`,
	});
}

export default async function CategoryProvidersPage({ params }: PageProps) {
	const { category } = await params;
	const config = await getDynamicSEOConfig();
	const categoryName = decodeURIComponent(category)
		.replace(/-/g, " ")
		.split(" ")
		.map(
			(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join(" ");

	// Generate breadcrumb schema for live-casino
	const breadcrumbSchema =
		category === "live-casino"
			? generateBreadcrumbSchema(
					[
						{ name: "Home", url: "/" },
						{ name: "Providers", url: "/providers" },
						{ name: categoryName, url: `/providers/${category}` },
					],
					config
			  )
			: null;

	return (
		<div className="container mx-auto py-8">
			{breadcrumbSchema && <JsonLd data={breadcrumbSchema} />}
			<Suspense fallback={<VendorPageSkeleton />}>
				<ProviderPageLayoutWrapper category={category} />
			</Suspense>
		</div>
	);
}

// Generate static params for common categories
export function generateStaticParams() {
	return [
		{ category: "slot" },
		{ category: "live-casino" },
		{ category: "sports" },
		{ category: "sportsbook" },
		{ category: "rng" },
	];
}
