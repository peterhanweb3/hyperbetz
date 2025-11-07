import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

export const metadata: Metadata = generateSEOMetadata({
	title: "Responsible Gambling - HyperBetz",
	description:
		"HyperBetz promotes responsible gambling. Learn about our tools, resources, and commitment to player protection and safe gaming.",
	keywords: [
		"responsible gambling",
		"player protection",
		"gambling awareness",
		"self-exclusion",
		"deposit limits",
		"gaming addiction",
		"safe gambling",
	],
	path: "/responsible-gambling",
	pageType: "responsibleGambling",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "Responsible Gambling - HyperBetz",
			url: "https://hyperbetz.games/responsible-gambling",
			description:
				"HyperBetz Responsible Gambling - Tools and resources for safe gaming.",
		}),
	],
});

export default function ResponsibleGamblingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
