import { Metadata } from "next";
import { SEOTemplates } from "@/lib/utils/seo/seo-provider";

export async function generateMetadata(): Promise<Metadata> {
	const { metadata } = await SEOTemplates.home();
	return metadata;
}

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
