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
	ogDescription: `Review ${siteName}'s Terms & Conditions. Understand Dynamic.xyz wallet login, crypto deposits, withdrawals, and platform rules.`,
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `Terms & Conditions - ${siteName}`,
			url: `https://${siteDomain}/terms-and-conditions`,
			description: `${siteName} Terms & Conditions - User agreement and platform rules.`,
		}),
	],
});

export default function TermsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
