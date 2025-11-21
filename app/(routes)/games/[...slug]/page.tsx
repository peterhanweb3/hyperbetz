import { Suspense } from "react";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { GamesPageLayoutWrapper } from "./games-page-layout-wrapper";
import { QueryPageSkeleton } from "@/components/features/query-display/query-page-skeleton";
import { interpolateSiteName } from "@/lib/utils/site-config";
import { PROVIDER_SLUG_MAP } from "@/lib/utils/provider-slug-mapping";

interface PageProps {
	params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const { slugToProviderDisplayName, slugToCategory } = await import(
		"@/lib/utils/provider-slug-mapping"
	);
	const siteName = interpolateSiteName(`{siteName}`);

	if (slug.length === 1) {
		// Provider only: /games/pg-soft or /games/pragmatic-play
		const providerName = slugToProviderDisplayName(
			decodeURIComponent(slug[0])
		);

		return generateSEOMetadata({
			title: `${providerName} Games - Provably Fair Crypto Casino | ${siteName}`,
			description: `Play ${providerName} games on ${siteName} - the leading provably fair crypto casino. Instant withdrawals, no KYC, Bitcoin & Ethereum accepted. 100+ ${providerName} slots, live dealer & crash games.`,
			keywords: [
				`${providerName} crypto casino`,
				`${providerName} Bitcoin games`,
				`${providerName} provably fair`,
				"crypto casino games",
				"blockchain gaming",
				"instant withdrawal casino",
				"no KYC casino",
				"Bitcoin gambling",
			],
			path: `/games/${slug[0]}`,
			pageType: "game",
			ogType: "website",
		});
	} else if (slug.length === 2) {
		// Provider + category: /games/pg-soft/slot or /games/pragmatic-play/slot
		const providerName = slugToProviderDisplayName(
			decodeURIComponent(slug[0])
		);
		const category = slugToCategory(decodeURIComponent(slug[1]));

		// Use friendly category names
		const categoryMap: Record<string, string> = {
			SLOT: "Slot",
			"LIVE CASINO": "Live Casino",
			"SPORT BOOK": "Sports",
			SPORTSBOOK: "Sports",
			RNG: "Table",
		};
		const categoryName =
			categoryMap[category] ||
			category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

		return generateSEOMetadata({
			title: `${providerName} ${categoryName} - Best Crypto ${categoryName} Games 2025 | ${siteName}`,
			description: `Play ${providerName} ${categoryName} games on ${siteName} - provably fair crypto casino. Instant crypto payouts, no KYC, ${categoryName} games with Bitcoin & Ethereum. Anonymous play with fast withdrawals.`,
			keywords: [
				`${providerName} ${categoryName}`,
				`crypto ${categoryName}`,
				`Bitcoin ${categoryName}`,
				"provably fair casino",
				"instant withdrawal",
				"no KYC gambling",
				"blockchain gaming",
			],
			path: `/games/${slug[0]}/${slug[1]}`,
			pageType: "game",
			ogType: "website",
		});
	}

	// Fallback
	return generateSEOMetadata({
		title: `Games - ${siteName}`,
		description: `Explore all games on ${siteName}`,
		keywords: ["games", "casino", "online gaming"],
		path: "/games",
		pageType: "game",
		ogType: "website",
	});
}

export default async function DynamicGamesPage({ params }: PageProps) {
	const { slug } = await params;

	return (
		<Suspense fallback={<QueryPageSkeleton />}>
			<GamesPageLayoutWrapper slug={slug} />
		</Suspense>
	);
}

// Generate static params for ALL providers (SEO optimization)
export function generateStaticParams() {
	// Get all unique provider slugs (69 providers)
	const allProviderSlugs = Object.keys(PROVIDER_SLUG_MAP).filter(
		// Filter out aliases to avoid duplicates
		(slug) =>
			!["relax-gaming", "hacksaw-gaming", "nolimit-city"].includes(slug)
	);

	const categories = ["slot", "live-casino", "sports", "rng"];

	const params = [];

	// Generate provider-only pages for top 50 providers (SEO focus)
	const topProviders = [
		"pg-soft",
		"pragmatic-play",
		"evolution",
		"netent",
		"ka-gaming",
		"playtech",
		"microgaming",
		"habanero",
		"red-tiger",
		"yggdrasil",
		"sa-gaming",
		"jili",
		"cq9",
		"jdb",
		"live22",
		"booongo",
		"btg",
		"relax",
		"no-limit",
		"fa-chai",
		...allProviderSlugs.slice(0, 30), // Add more providers
	];

	// Provider only pages (50 providers)
	for (const provider of topProviders) {
		params.push({ slug: [provider] });
	}

	// Provider + category pages (top 20 providers × 4 categories = 80 pages)
	const topProvidersForCategories = topProviders.slice(0, 20);
	for (const provider of topProvidersForCategories) {
		for (const category of categories) {
			params.push({ slug: [provider, category] });
		}
	}

	// Total: ~130 static pages for maximum SEO coverage
	return params;
}
