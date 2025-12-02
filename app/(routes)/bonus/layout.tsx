import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";

import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

// Generate SEO Metadata for Bonus Page
export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	const siteDomain = config.defaultDomain;
	return generateSEOMetadata({
		title: `${siteName} Turnover Bonus – Earn Rewards While You Play`,
		description: `Join the ${siteName} Turnover Bonus Program & earn daily rewards as you play slots & live games.`,
		keywords: [
			`${siteName} bonuses`,
			"crypto casino bonus",
			"turnover bonus",
			"reload bonus",
			"daily rewards",
			"wagering rewards",
			"crypto cashback",
			"play to earn casino",
			`${siteName} promotions`,
			"crypto gambling bonuses",
			"VIP rewards",
			"blockchain casino offers",
			"exclusive casino deals",
			"live casino bonuses",
			"crypto gaming incentives",
		],
		path: "/bonus",
		pageType: "bonus",
		ogTitle: `${siteName} Turnover Bonus | Earn Crypto Rewards While You Play`,
		ogDescription: `Unlock daily turnover bonuses and exclusive crypto rewards at ${siteName}. Play slots, live casino, and sports — get paid instantly with blockchain transparency.`,
		ogType: "website",
		ogUrl: `${siteDomain}/bonus`,
		ogImage: "/assets/seo/TURNOVER_BONUS.webp",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `${siteName} Turnover Bonus – Earn Rewards While You Play`,
					url: `${siteDomain}/bonus`,
					description: `Join the ${siteName} Turnover Bonus Program & earn daily rewards as you play slots & live games.`,
				},
				config
			),
		],
	});
}

export default function BonusLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
