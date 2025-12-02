import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";
import {
	generateWebsiteSchema,
	generateFAQSchema,
	generateOrganizationSchema,
	generateGameSchema,
} from "@/lib/utils/seo/schema-generator";
import { StructuredData } from "@/components/features/seo/StructuredData";
import { SEOConfig } from "@/types/seo/seo.types";

// Helper to generate the specific home schema based on config
function getHomeSchemaData(config: SEOConfig) {
	const siteName = config.defaults.siteName;
	const siteDomain = config.defaultDomain;

	const websiteSchema = generateWebsiteSchema("en", config);
	const orgSchema = generateOrganizationSchema(config);
	const faqSchema = generateFAQSchema([
		{
			question:
				"Do I have to bet my bonus many times before withdrawing?",
			answer: "No! When you win, you can withdraw your bonus immediately with no complicated rules.",
		},
		{
			question: "Can I get a bonus without depositing?",
			answer: "Not at the moment. However, our referral bonus program is simple, fair, and comes with no tricky requirements.",
		},
		{
			question: `How do I contact ${siteName} support?`,
			answer: "You can reach us 24/7 via live chat or email at smmstore.here@gmail.com.",
		},
		{
			question:
				"Which cryptocurrencies can I use to deposit or withdraw?",
			answer: `${siteName} supports Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB), Litecoin (LTC), Ripple (XRP), Solana (SOL), TRON (TRX), Cardano (ADA), and many more.`,
		},
		{
			question: "How fast are deposits and withdrawals?",
			answer: "Most crypto transactions are processed instantly or within a few minutes.",
		},
		{
			question: `Is ${siteName} safe and secure?`,
			answer: "Yes! All transactions are encrypted and private. Plus, our games are provably fair.",
		},
		{
			question: "Can I play on mobile?",
			answer: `Absolutely! ${siteName} is fully mobile-friendly, so you can play on your smartphone or tablet anywhere, anytime.`,
		},
		{
			question: `What types of games are available at ${siteName}?`,
			answer: "We offer over 6,000 games including Slots, Live Casino, Poker, Lottery, Crash, Plinko, and Sports & eSports betting.",
		},
	]);

	// Generate Game Schema and customize it for VideoGame
	const baseGameSchema = generateGameSchema({
		name: `${siteName} Casino Games`,
		description: `${siteName} – Best Online Crypto Casino with 6,000+ games, instant withdrawals, provably fair games, and crypto deposits. Play slots, poker, lottery, live casino, crash games, and sports betting.`,
		url: siteDomain,
	});

	const videoGameSchema = {
		...baseGameSchema,
		"@type": "VideoGame",
		genre: [
			"Slots",
			"Poker",
			"Lottery",
			"Live Casino",
			"Crash",
			"Plinko",
			"Sports Betting",
		],
		publisher: {
			"@type": "Organization",
			name: siteName,
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			bestRating: "5",
			ratingCount: "2500",
		},
		review: [
			{
				"@type": "Review",
				author: "Noah",
				datePublished: "2025-01-15",
				reviewBody: `${siteName} is amazing! So many games, and I got my winnings super fast. The support team is always friendly and helpful.`,
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
				},
			},
			{
				"@type": "Review",
				author: "Emilia",
				datePublished: "2025-02-10",
				reviewBody:
					"I love using crypto here. Everything is fast and easy, and the bonuses don’t come with annoying rules.",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
				},
			},
			{
				"@type": "Review",
				author: "Leon",
				datePublished: "2025-03-05",
				reviewBody:
					"The sports betting section is great. Good odds and very easy to use. This is my favorite site now.",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
				},
			},
		],
	};

	// Remove @context and @type from websiteSchema to avoid duplication in StructuredData
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { "@context": _, "@type": __, ...websiteData } = websiteSchema;

	// Construct the final WebSite schema data
	const finalSchemaData = {
		...websiteData,
		name: siteName,
		description: `${siteName} – Best Online Crypto Casino with 6,000+ games, instant withdrawals, provably fair games, and crypto deposits. Play slots, poker, lottery, live casino, crash games, and sports betting.`,
		publisher: {
			"@type": "Organization",
			name: siteName,
			logo: {
				"@type": "ImageObject",
				url: `${siteDomain}/logo.png`,
			},
		},
		mainEntity: [faqSchema, orgSchema, videoGameSchema],
	};

	return {
		websiteSchema,
		orgSchema,
		faqSchema,
		videoGameSchema,
		finalSchemaData,
	};
}

export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();
	const { websiteSchema, orgSchema, faqSchema, videoGameSchema } =
		getHomeSchemaData(config);

	return generateSEOMetadata({
		title: config.pageDefaults.home.title,
		description: config.pageDefaults.home.description,
		keywords: config.pageDefaults.home.keywords,
		path: "/",
		pageType: "home",
		ogType: "website",
		ogImage: "/assets/seo/og.png",
		ogUrl: config.defaultDomain,
		schemas: [websiteSchema, orgSchema, faqSchema, videoGameSchema],
	});
}

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const config = await getDynamicSEOConfig();
	const { finalSchemaData } = getHomeSchemaData(config);

	return (
		<>
			<StructuredData
				id="home-schema"
				type="WebSite"
				data={finalSchemaData}
			/>
			{children}
		</>
	);
}
