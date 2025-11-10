import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";

export const metadata: Metadata = generateSEOMetadata({
	title: "Responsible Gambling | HyperBetz.games – Play Smart, Stay Safe",
	description:
		"Learn about responsible gambling at HyperBetz.games. Stay in control, play responsibly, and get support through global help organizations.",
	keywords: [
		"HyperBetz Responsible Gambling",
		"HyperBetz play safe",
		"crypto casino responsible gaming",
		"gambling help",
		"HyperBetz self exclusion",
	],
	path: "/responsible-gambling",
	pageType: "responsibleGambling",
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: "Responsible Gambling at HyperBetz.games",
			url: "https://hyperbetz.games/responsible-gambling",
			description:
				"HyperBetz.games promotes responsible crypto gaming. Learn to play safely, control habits, and access global gambling support organizations.",
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
