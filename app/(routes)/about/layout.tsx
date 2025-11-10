import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for About Page
export const metadata: Metadata = generateSEOMetadata({
	title: "About HyperBetz | Trusted Global Online Casino Platform",
	description:
		"Learn about HyperBetz — a secure, global casino platform offering slots, live casino, sports betting, and poker. Fair, fast, and built for real players.",
	keywords: [
		"About HyperBetz",
		"HyperBetz casino",
		"HyperBetz games",
		"global online casino",
		"secure casino platform",
		"online casino platform",
		"gaming platform",
		"fair play casino",
		"responsible gaming",
		"casino providers",
		"pragmatic play",
		"red tiger gaming",
		"microgaming",
		"ka gaming",
	],
	path: "/about",
	pageType: "about",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "About HyperBetz | Trusted Global Online Casino Platform",
			url: "https://hyperbetz.com/about",
			description:
				"Learn about HyperBetz — a secure, global casino platform offering slots, live casino, sports betting, and poker. Fair, fast, and built for real players.",
		}),
	],
});

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
