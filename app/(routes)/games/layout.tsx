import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for Games Page
export const metadata: Metadata = generateSEOMetadata({
	title: "All Games on HyperBetz – Slots, Poker & Live Casino",
	description:
		"Discover the full HyperBetz game list – slots, poker & live casino from top providers. Play instantly, win securely.",
	keywords: [
		"HyperBetz games",
		"HyperBetz casino",
		"HyperBetz slots",
		"HyperBetz poker",
		"HyperBetz live casino",
		"HyperBetz game list",
		"online casino games",
		"slot games",
		"live casino games",
		"poker games",
	],
	path: "/games",
	pageType: "games",
	ogType: "website",
	ogImage: "/assets/seo/GAMES.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "All Games on HyperBetz – Slots, Poker & Live Casino",
			url: "https://hyperbetz.com/games",
			description:
				"Discover the full HyperBetz game list – slots, poker & live casino from top providers. Play instantly, win securely.",
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
