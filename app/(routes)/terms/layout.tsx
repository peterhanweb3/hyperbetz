import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

export const metadata: Metadata = generateSEOMetadata({
	title: "Terms & Conditions - HyperBetz",
	description:
		"Read HyperBetz terms and conditions. Understand your rights, responsibilities, and our rules for using the crypto-casino platform.",
	keywords: [
		"terms and conditions",
		"user agreement",
		"terms of service",
		"legal terms",
		"casino rules",
		"user responsibilities",
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
