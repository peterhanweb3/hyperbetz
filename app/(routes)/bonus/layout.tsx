import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

// Generate SEO Metadata for Bonus Page
export const metadata: Metadata = generateSEOMetadata({
	title: "HyperBetz Turnover Bonus – Earn Rewards While You Play",
	description:
		"Join the HyperBetz Turnover Bonus Program & earn daily rewards as you play slots & live games.",
	keywords: [
		"HyperBetz casino",
		"HyperBetz games",
		"HyperBetz online gaming platform",
		"HyperBetz bonus",
		"HyperBetz turnover bonus",
		"HyperBetz slots",
		"HyperBetz live casino",
		"HyperBetz sportsbook",
		"HyperBetz rewards",
		"HyperBetz promotions",
	],
	path: "/bonus",
	pageType: "bonus",
	ogType: "website",
	ogImage: "/assets/seo/TURNOVER_BONUS.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "HyperBetz Turnover Bonus – Earn Rewards While You Play",
			url: "https://hyperbetz.com/bonus",
			description:
				"Join the HyperBetz Turnover Bonus Program & earn daily rewards as you play slots & live games.",
		}),
	],
});

export default function BonusLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
