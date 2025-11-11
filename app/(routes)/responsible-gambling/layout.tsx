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
	title: `Responsible Gambling | ${siteName} – Play Smart, Stay Safe`,
	description: `Learn about responsible gambling at ${siteName}. Stay in control, play responsibly, and get support through global help organizations.`,
	keywords: [
		`${siteName} Responsible Gambling`,
		`${siteName} play safe`,
		"crypto casino responsible gaming",
		"gambling help",
		`${siteName} self exclusion`,
	],
	path: "/responsible-gambling",
	pageType: "responsibleGambling",
	ogTitle: `Responsible Gambling | ${siteName} – Play Smart, Stay Safe`,
	ogDescription: `${siteName} promotes responsible crypto gaming. Learn to play safely, control habits, and access global gambling support organizations.`,
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
