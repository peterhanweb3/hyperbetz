import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

export const metadata: Metadata = generateSEOMetadata({
	title: "Terms & Conditions | HyperBetz.games – Crypto Casino Rules",
	description:
		"Read HyperBetz.games Terms & Conditions. Learn about wallet login (Dynamic.xyz), crypto deposits, withdrawals, fair play, and responsible gaming policies.",
	keywords: [
		"HyperBetz Terms and Conditions",
		"HyperBetz crypto casino rules",
		"Dynamic.xyz wallet login",
		"HyperBetz withdrawal policy",
		"HyperBetz fair play",
	],
	path: "/terms",
	pageType: "terms",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "Terms & Conditions - HyperBetz",
			url: "https://hyperbetz.games/terms",
			description:
				"HyperBetz Terms & Conditions - User agreement and platform rules.",
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
