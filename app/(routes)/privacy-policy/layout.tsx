import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

// Generate SEO Metadata for Privacy Policy Page
export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	const siteDomain = config.defaultDomain;

	return generateSEOMetadata({
		title: `Privacy Policy | ${siteName} – Crypto Wallet Casino Security`,
		description: `Learn how ${siteName} protects wallet addresses and crypto data with SSL, AML, and GDPR-compliant privacy for secure blockchain gaming.`,
		keywords: [
			`${siteName} privacy policy`,
			`${siteName} crypto casino`,
			`${siteName} data protection`,
			`${siteName} wallet security`,
			"crypto gambling privacy",
			"GDPR crypto casino",
			"blockchain casino policy",
			`${siteName} games secure`,
			"crypto betting privacy",
		],
		path: "/privacy-policy",
		ogUrl: `${siteDomain}/privacy-policy`,
		pageType: "privacy",
		ogTitle: `Privacy & Data Protection | ${siteName} (Crypto Casino)`,
		ogDescription: `Explore how ${siteName} safeguards your crypto wallet and transaction data with advanced encryption and GDPR-compliant protection.`,
		ogType: "website",
		ogImage: "/assets/seo/og.png",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `Privacy Policy - ${siteName} Crypto Casino`,
					url: `${siteDomain}/privacy-policy`,
					description: `${siteName} Privacy Policy - How we collect, use, store and protect your personal and transaction data.`,
				},
				config
			),
		],
	});
}

export default function PrivacyLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
