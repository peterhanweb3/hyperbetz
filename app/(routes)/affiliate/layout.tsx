import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

// Generate SEO Metadata for Affiliate Page
export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	const siteDomain = config.defaultDomain;

	return generateSEOMetadata({
		title: `Join the ${siteName} Affiliate Program – Earn Lifetime Commissions`,
		description: `Partner with Jholalaal & earn lifetime income for every player you refer. Easy setup & global reach.`,
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
		ogDescription: `Partner with ${siteName} and earn lifetime crypto rewards. Promote a top-tier crypto casino offering slots, live games, and sports betting to a global audience.`,
		ogType: "website",
		ogUrl: `${siteDomain}/affiliate`,
		ogImage: "/assets/seo/AFFILIATE.webp",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `Join the ${siteName} Affiliate Program – Earn Lifetime Commissions`,
					url: `${siteDomain}/affiliate`,
					description: `Partner with ${siteName} & earn lifetime income for every player you refer. Easy setup & global reach.`,
				},
				config
			),
		],
	});
}

export default function AffiliateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
