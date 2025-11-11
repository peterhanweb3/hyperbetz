import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";
import {
	interpolateSiteName,
	interpolateSiteDomain,
} from "@/lib/utils/site-config";

const siteName = interpolateSiteName(`{siteName}`);
const siteDomain = interpolateSiteDomain(`{siteDomain}`);

export const metadata: Metadata = generateSEOMetadata({
	title: `FAQs | ${siteName} – Crypto Casino Help & Support`,
	description: `Find answers to common ${siteName} questions. Learn about wallet login, deposits, withdrawals, fair play, and blockchain transparency.`,
	keywords: [
		`${siteName} FAQ`,
		`${siteName} crypto casino help`,
		"wallet login guide",
		"crypto deposit",
		"crypto withdrawal",
		"provably fair games",
	],
	path: "/faqs",
	pageType: "faqs",
	ogTitle: `FAQs | ${siteName} – Crypto Casino Help Center`,
	ogDescription: `Explore FAQs at ${siteName}. Learn how to connect your wallet, deposit crypto, withdraw winnings, and play provably fair blockchain games.`,
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `FAQs – ${siteName} Crypto Casino Help Center`,
			url: `https://${siteDomain}/faqs`,
			description: `Explore FAQs at ${siteName}. Learn how to connect your wallet, deposit crypto, withdraw winnings, and play provably fair blockchain games.`,
		}),
	],
});

export default function FAQsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
