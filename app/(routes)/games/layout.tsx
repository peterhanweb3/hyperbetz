import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";
import {
	interpolateSiteName,
	interpolateSiteTLD,
} from "@/lib/utils/site-config";

const siteName = interpolateSiteName(`{siteName}`);
const siteTLD = interpolateSiteTLD(`{siteTLD}`);

// Generate SEO Metadata for Games Page
export const metadata: Metadata = generateSEOMetadata({
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
	ogTitle: `All Games at ${siteName}${siteTLD} | Slots, Poker, Live Casino & Sports`,
	ogDescription: `Play 5,000+ casino games at ${siteName}${siteTLD} — including crypto slots, live dealers, poker, and sports betting. Fast wallet payouts and provably fair gaming on every spin.`,
	ogType: "website",
	ogImage: "/assets/seo/GAMES.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `All Games on ${siteName} – Slots, Poker & Live Casino`,
			url: `https://${siteName.toLowerCase()}${siteTLD}/games`,
			description: `Discover the full ${siteName} game list – slots, poker & live casino from top providers. Play instantly, win securely.`,
		}),
	],
});

export default function GamesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
