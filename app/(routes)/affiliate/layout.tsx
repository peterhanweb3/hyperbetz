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
// Generate SEO Metadata for Affiliate Bonus Page
export const metadata: Metadata = generateSEOMetadata({
	title: `Join the ${siteName} Affiliate Program – Earn Lifetime Commissions`,
	description: `Partner with ${siteName}${siteTLD} & earn lifetime income for every player you refer. Easy setup & global reach.`,
	keywords: [
		`${siteName} affiliate program`,
		"crypto casino affiliate",
		`${siteName} partners`,
		"referral rewards",
		"commission earnings",
		"revenue share crypto casino",
		"blockchain affiliate network",
		"earn crypto commissions",
		"gaming affiliate marketing",
		`${siteName} referrals`,
		"crypto partnership program",
		"casino affiliate dashboard",
		"play and earn referrals",
		"passive income crypto casino",
	],
	path: "/affiliate",
	pageType: "affiliate",
	ogTitle: `Join the ${siteName} Affiliate Program | Earn Lifetime Crypto Commissions`,
	ogDescription: `Partner with ${siteName}${siteTLD} and earn lifetime crypto rewards. Promote a top-tier crypto casino offering slots, live games, and sports betting to a global audience.`,
	ogType: "website",
	ogImage: "/assets/seo/AFFILIATE.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `Join the ${siteName} Affiliate Program – Earn Lifetime Commissions`,
			url: `https://${siteName.toLowerCase()}${siteTLD}/affiliate`,
			description: `Partner with ${siteName}${siteTLD} & earn lifetime income for every player you refer. Easy setup & global reach.`,
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
