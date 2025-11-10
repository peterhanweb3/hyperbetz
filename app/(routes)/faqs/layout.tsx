import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

export const metadata: Metadata = generateSEOMetadata({
	title: "FAQs | HyperBetz.games – Crypto Casino Help & Support",
	description:
		"Find answers to common HyperBetz.games questions. Learn about wallet login, deposits, withdrawals, fair play, and blockchain transparency.",
	keywords: [
		"HyperBetz FAQ",
		"HyperBetz crypto casino help",
		"wallet login guide",
		"crypto deposit",
		"crypto withdrawal",
		"provably fair games",
	],
	path: "/faqs",
	pageType: "faqs",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "FAQs – HyperBetz Crypto Casino Help Center",
			url: "https://hyperbetz.games/faqs",
			description:
				"Explore FAQs at HyperBetz.games. Learn how to connect your wallet, deposit crypto, withdraw winnings, and play provably fair blockchain games.",
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
