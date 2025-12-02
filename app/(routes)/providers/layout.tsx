import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateOrganizationSchema,
	generateWebPageSchema,
} from "@/lib/utils/seo/schema-generator";

// Generate SEO Metadata for Providers Page
export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();

	const siteName = config.defaults.siteName;
	// Ensure domain doesn't have protocol for display purposes if needed, or use directly
	const siteDomain = config.defaultDomain;
	return generateSEOMetadata({
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
		ogTitle: `Top Game Providers | ${siteName} – Pragmatic Play, NetEnt, Yggdrasil`,
		ogDescription: `Explore leading casino providers at ${siteName}. Play certified crypto slots and live dealer games from Pragmatic Play, Yggdrasil, NetEnt, and more. 100% fair and secure.`,
		ogUrl: `${siteDomain}/providers`,
		ogType: "website",
		ogImage: "/assets/seo/PROVIDERS.webp",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `Game Providers at ${siteName} – Top Casino Studios`,
					url: `${siteDomain}/providers`,
					description: `Explore 50+ trusted providers on ${siteName} – Pragmatic Play, Red Tiger, Microgaming & more. Fair, certified gaming.`,
				},
				config
			),
		],
	});
}

export default function ProvidersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
