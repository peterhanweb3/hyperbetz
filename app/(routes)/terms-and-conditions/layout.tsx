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
	// Ensure domain doesn't have protocol for display purposes if needed, or use directly
	const siteDomain = config.defaultDomain;
	return generateSEOMetadata({
		title: `Terms & Conditions | ${siteName} – Crypto Casino Rules`,
		description: `Read ${siteName} Terms & Conditions. Learn about wallet login (Dynamic.xyz), crypto deposits, withdrawals, fair play, and responsible gaming policies.`,
		keywords: [
			`${siteName} Terms and Conditions`,
			`${siteName} crypto casino rules`,
			"Dynamic.xyz wallet login",
			`${siteName} withdrawal policy`,
			`${siteName} fair play`,
		],
		path: "/terms-and-conditions",
		pageType: "terms",
		ogTitle: `Terms & Conditions | ${siteName} (Crypto Wallet Casino)`,
		ogDescription: `Review ${siteName}' Terms & Conditions. Understand Dynamic.xyz wallet login, crypto deposits, withdrawals, and platform rules.`,
		ogType: "website",
		ogUrl: `${siteDomain}/terms-and-conditions`,
		ogImage: "/assets/seo/og.png",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `Terms & Conditions - ${siteName}`,
					url: `https://${siteDomain}/terms-and-conditions`,
					description: `${siteName} Terms & Conditions - User agreement and platform rules.`,
				},
				config
			),
		],
	});
}

export default function TermsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
