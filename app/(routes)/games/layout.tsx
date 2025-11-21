import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

// Generate SEO Metadata for Games Page
export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	// Ensure domain doesn't have protocol for display purposes if needed, or use directly
	const siteDomain = config.defaultDomain;
	return generateSEOMetadata({
		title: `All Games on ${siteName} – Slots, Poker & Live Casino`,
		description: `Discover the full ${siteName} game list – slots, poker & live casino from top providers. Play instantly, win securely.`,
		keywords: [
			`${siteName} games`,
			`${siteName} casino`,
			`${siteName} slots`,
			`${siteName} poker`,
			`${siteName} live casino`,
			`${siteName} game list`,
			"online casino games",
			"slot games",
			"live casino games",
			"poker games",
		],
		path: "/games",
		pageType: "games",
		ogTitle: `All Games at ${siteName} | Slots, Poker, Live Casino & Sports`,
		ogDescription: `Play 5,000+ casino games at ${siteName} — including crypto slots, live dealers, poker, and sports betting. Fast wallet payouts and provably fair gaming on every spin.`,
		ogType: "website",
		ogImage: "/assets/seo/GAMES.png",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `All Games on ${siteName} – Slots, Poker & Live Casino`,
					url: `${siteDomain}/games`,
					description: `Discover the full ${siteName} game list – slots, poker & live casino from top providers. Play instantly, win securely.`,
				},
				config
			),
		],
	});
}

export default function GamesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
