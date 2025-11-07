import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for Privacy Policy Page
export const metadata: Metadata = generateSEOMetadata({
	title: "Privacy Policy - HyperBetz",
	description:
		"Learn how HyperBetz collects, uses, and protects your personal data. We are committed to your privacy and security while providing crypto-casino services.",
	keywords: [
		"privacy policy",
		"data protection",
		"user privacy",
		"crypto privacy",
		"data security",
		"GDPR compliance",
		"personal data",
		"wallet privacy",
		"blockchain privacy",
	],
	path: "/privacy",
	pageType: "privacy",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "Privacy Policy - HyperBetz",
			url: "https://hyperbetz.games/privacy",
			description:
				"HyperBetz Privacy Policy - How we collect, use, store and protect your personal and transaction data.",
		}),
	],
});

export default function PrivacyLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
