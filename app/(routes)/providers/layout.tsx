import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/seo/schema-generator";
import {
	interpolateSiteName,
	interpolateSiteTLD,
} from "@/lib/utils/site-config";

const siteName = interpolateSiteName(`{siteName}`);
const siteTLD = interpolateSiteTLD(`{siteTLD}`);

// Generate SEO Metadata for Providers Page
export const metadata: Metadata = generateSEOMetadata({
	title: `Game Providers at ${siteName} – Top Casino Studios`,
	description: `Explore 50+ trusted providers on ${siteName} – Pragmatic Play, Red Tiger, Microgaming & more. Fair, certified gaming.`,
	keywords: [
		`${siteName} game providers`,
		"crypto casino providers",
		"best slot developers",
		"blockchain casino games",
		"live casino studios",
		"crypto game suppliers",
		"Habanero",
		"Yggdrasil",
		"Pragmatic Play",
		"Playtech",
		"PG Soft",
		"NetEnt games",
		"casino software partners",
		"provably fair providers",
		`${siteName} live dealers`,
	],
	path: "/providers",
	pageType: "providers",
	ogTitle: `Top Game Providers | ${siteName}${siteTLD} – Pragmatic Play, NetEnt, Yggdrasil`,
	ogDescription: `Explore leading casino providers at ${siteName}${siteTLD}. Play certified crypto slots and live dealer games from Pragmatic Play, Yggdrasil, NetEnt, and more. 100% fair and secure.`,
	ogType: "website",
	ogImage: "/assets/seo/PROVIDERS.png",
	schemas: [
		generateOrganizationSchema(),
		generateWebPageSchema({
			title: `Game Providers at ${siteName} – Top Casino Studios`,
			url: `https://${siteName.toLowerCase()}${siteTLD}/providers`,
			description: `Explore 50+ trusted providers on ${siteName} – Pragmatic Play, Red Tiger, Microgaming & more. Fair, certified gaming.`,
		}),
	],
});

export default function ProvidersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
