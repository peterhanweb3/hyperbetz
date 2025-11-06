import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for About Page
export const metadata: Metadata = generateSEOMetadata({
	title: "About Us - HyperBetz",
	description:
		"At HyperBetz, gaming isn't just a pastime — it's an experience. Discover our mission to create a world-class gaming platform with 5,000+ games, instant transactions, and 24/7 support.",
	keywords: [
		"about hyperbetz",
		"online casino platform",
		"gaming platform",
		"casino about us",
		"online betting platform",
		"fair play casino",
		"responsible gaming",
		"casino providers",
		"pragmatic play",
		"red tiger gaming",
	],
	path: "/about",
	pageType: "about",
	ogType: "website",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "About HyperBetz",
			url: "https://hyperbetz.com/about",
			description:
				"Learn about HyperBetz - our mission, values, and commitment to providing a safe, fair, and exciting gaming experience.",
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
