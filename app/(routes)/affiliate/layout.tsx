import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for Affiliate Bonus Page
export const metadata: Metadata = generateSEOMetadata({
	title: "Join the HyperBetz Affiliate Program – Earn Lifetime Commissions",
	description:
		"Partner with HyperBetz.games & earn lifetime income for every player you refer. Easy setup & global reach.",
	keywords: [
		"HyperBetz affiliate program",
		"HyperBetz partners",
		"HyperBetz affiliate bonus",
		"HyperBetz affiliate income",
		"HyperBetz lifetime commission",
		"HyperBetz referral program",
		"HyperBetz partnership program",
	],
	path: "/affiliate",
	pageType: "affiliate",
	ogType: "website",
	ogImage: "/assets/seo/AFFILIATE.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "Join the HyperBetz Affiliate Program – Earn Lifetime Commissions",
			url: "https://hyperbetz.com/affiliate",
			description:
				"Partner with HyperBetz.games & earn lifetime income for every player you refer. Easy setup & global reach.",
		}),
	],
});

export default function AffiliateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
