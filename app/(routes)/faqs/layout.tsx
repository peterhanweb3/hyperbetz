import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

export const metadata: Metadata = generateSEOMetadata({
	title: "Frequently Asked Questions (FAQs) - HyperBetz",
	description:
		"Find answers to common questions about HyperBetz crypto-casino. Learn about deposits, withdrawals, games, bonuses, and more.",
	keywords: [
		"FAQs",
		"frequently asked questions",
		"help",
		"support",
		"crypto casino FAQ",
		"how to play",
		"withdrawals",
		"deposits",
	],
	path: "/faqs",
	pageType: "faqs",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "FAQs - HyperBetz",
			url: "https://hyperbetz.games/faqs",
			description:
				"Frequently Asked Questions about HyperBetz crypto-casino platform.",
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
