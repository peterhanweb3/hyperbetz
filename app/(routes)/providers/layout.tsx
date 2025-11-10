import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for Providers Page
export const metadata: Metadata = generateSEOMetadata({
	title: "Game Providers at HyperBetz – Top Casino Studios",
	description:
		"Explore 50+ trusted providers on HyperBetz – Pragmatic Play, Red Tiger, Microgaming & more. Fair, certified gaming.",
	keywords: [
		"HyperBetz providers",
		"HyperBetz casino",
		"game providers",
		"casino studios",
		"Pragmatic Play",
		"Red Tiger",
		"Microgaming",
		"KA Gaming",
		"trusted providers",
		"certified gaming",
	],
	path: "/providers",
	pageType: "providers",
	ogType: "website",
	ogImage: "/assets/seo/PROVIDERS.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "Game Providers at HyperBetz – Top Casino Studios",
			url: "https://hyperbetz.com/providers",
			description:
				"Explore 50+ trusted providers on HyperBetz – Pragmatic Play, Red Tiger, Microgaming & more. Fair, certified gaming.",
		}),
	],
});

export default function ProvidersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
