import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	const siteDomain = config.defaultDomain;

	return generateSEOMetadata({
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
		ogUrl: `${siteDomain}/responsible-gambling`,
		ogImage: "/assets/seo/og.webp",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `Responsible Gambling at ${siteName}`,
					url: `${siteDomain}/responsible-gambling`,
					description: `${siteName} promotes responsible crypto gaming. Learn to play safely, control habits, and access global gambling support organizations.`,
				},
				config
			),
		],
	});
}

export default function ResponsibleGamblingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
