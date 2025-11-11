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
	title: `Responsible Gambling | ${siteName} – Play Safe & Smart`,
	description: `Learn how ${siteName} promotes safe gaming with self-exclusion tools, deposit limits, and support resources for responsible crypto gambling.`,
	keywords: [
		`${siteName} responsible gambling`,
		"crypto casino safety",
		"self-exclusion tools",
		"gambling limits",
		"safe gaming practices",
		`${siteName} player protection`,
	],
	path: "/responsible-gambling",
	pageType: "responsibleGambling",
	ogTitle: `Responsible Gambling | ${siteName} – Play Safe & Smart`,
	ogDescription: `Discover ${siteName} responsible gambling tools. Set limits, self-exclude, and access support for safe crypto casino gaming.`,
	ogType: "website",
	ogImage: "/assets/seo/og.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `Responsible Gambling at ${siteName}`,
			url: `https://${siteDomain}/responsible-gambling`,
			description: `${siteName} promotes responsible crypto gaming. Learn to play safely, control habits, and access global gambling support organizations.`,
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
