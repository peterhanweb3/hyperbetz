import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	const siteDomain = config.defaultDomain;
	return generateSEOMetadata({
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
		ogUrl: `${siteDomain}/faqs`,
		ogImage: "/assets/seo/og.webp",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `FAQs – ${siteName} Crypto Casino Help Center`,
					url: `${siteDomain}/faqs`,
					description: `Explore FAQs at ${siteName}. Learn how to connect your wallet, deposit crypto, withdraw winnings, and play provably fair blockchain games.`,
				},
				config
			),
		],
	});
}

export default function FAQsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
