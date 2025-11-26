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
		title: `Contact Us | ${siteName} - Get in Touch`,
		description: `Need assistance? Contact the ${siteName} support team. We're available 24/7 to help with account inquiries, technical support, and general questions.`,
		keywords: [
			`Contact ${siteName}`,
			`${siteName} support`,
			`${siteName} help`,
			"casino customer support",
			"24/7 support",
		],
		path: "/contact-us",
		pageType: "contact",
		ogTitle: `Contact Us | ${siteName} Support Team`,
		ogDescription: `Reach out to ${siteName} support for any questions or assistance. Our dedicated team is here to help you 24/7.`,
		ogType: "website",
		ogImage: "/assets/seo/CONTACT_US.png",
		schemas: [
			generateOrganizationSchema(config),
			generateWebPageSchema(
				{
					title: `Contact Us | ${siteName} - Get in Touch`,
					url: `${siteDomain}/contact-us`,
					description: `Need assistance? Contact the ${siteName} support team. We're available 24/7 to help with account inquiries, technical support, and general questions.`,
				},
				config
			),
		],
	});
}

export default function ContactLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
