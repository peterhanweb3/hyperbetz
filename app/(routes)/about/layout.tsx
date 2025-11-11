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
// Generate SEO Metadata for About Page
export const metadata: Metadata = generateSEOMetadata({
	title: `About ${siteName} | Trusted Global Online Casino Platform`,
	description: `Learn about ${siteName} — a secure, global casino platform offering slots, live casino, sports betting, and poker. Fair, fast, and built for real players.`,
	keywords: [
		`About ${siteName}`,
		`${siteName} casino`,
		`${siteName} games`,
		"global online casino",
		"secure casino platform",
		"online casino platform",
		"gaming platform",
		"fair play casino",
		"responsible gaming",
		"casino providers",
		"pragmatic play",
		"red tiger gaming",
		"microgaming",
		"ka gaming",
	],
	path: "/about",
	pageType: "about",
	ogTitle: `About ${siteName} | Trusted Global Crypto Casino Platform`,
	ogDescription: `Discover ${siteName} — a secure, provably fair crypto casino offering 5,000+ games, live tables, and sports betting. Built on blockchain for fairness, speed, and transparency`,
	ogType: "website",
	ogImage: "/assets/seo/ABOUT_US.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `About ${siteName} | Trusted Global Online Casino Platform`,
			url: `https://${siteDomain}/about`,
			description: `Learn about ${siteName} — a secure, global casino platform offering slots, live casino, sports betting, and poker. Fair, fast, and built for real players.`,
		}),
	],
});

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
