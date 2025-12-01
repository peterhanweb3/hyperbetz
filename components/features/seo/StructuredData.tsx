import Script from "next/script";

type SchemaType =
	| "Organization"
	| "WebSite"
	| "Casino"
	| "FAQPage"
	| "Article"
	| "BreadcrumbList"
	| string;

interface StructuredDataProps {
	id?: string;
	type?: SchemaType;
	data: Record<string, unknown>;
}

export function StructuredData({ id, type, data }: StructuredDataProps) {
	const schema = {
		"@context": "https://schema.org",
		"@type": type,
		...data,
	};

	return (
		<Script
			id={id || `schema-${type?.toLowerCase()}`}
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}

// Helper for Organization Schema (Knowledge Graph)
export function OrganizationSchema() {
	return (
		<StructuredData
			type="Organization"
			data={{
				name: "HyperBetz",
				url: "https://hyperbetz.com",
				logo: "https://hyperbetz.com/logo.png",
				sameAs: [
					"https://twitter.com/hyperbetz",
					"https://facebook.com/hyperbetz",
					"https://instagram.com/hyperbetz",
				],
				contactPoint: {
					"@type": "ContactPoint",
					telephone: "+1-800-555-5555",
					contactType: "Customer Support",
				},
			}}
		/>
	);
}

// Helper for WebSite Schema
export function WebsiteSchema() {
	return (
		<StructuredData
			type="WebSite"
			data={{
				name: "HyperBetz",
				url: "https://hyperbetz.com",
				description:
					"Play at HyperBetz, the top crypto casino online with 6,000+ slots, live casino, crash games, and sports betting. Join now and start winning today!",
			}}
		/>
	);
}
