/**
 * AEO Manager (Answer Engine Optimization)
 * Optimizes content for AI search engines, voice search, and featured snippets
 */

import { generateFAQSchema, generateHowToSchema } from "./schema-generator";
import { getSEOConfig } from "./seo-config-loader";

export interface FAQItem {
	question: string;
	answer: string;
}

export interface HowToStep {
	name: string;
	text: string;
	image?: string;
}

/**
 * Generate FAQ content optimized for Answer Engines
 */
export function generateAEOFAQs(
	topic: string,
	customFAQs?: FAQItem[]
): {
	faqs: FAQItem[];
	schema: Record<string, unknown>;
	markup: string;
} {
	const config = getSEOConfig();

	if (!config.aeo.enabled || !config.aeo.generateFAQs) {
		return { faqs: [], schema: {}, markup: "" };
	}

	// Use custom FAQs or generate template
	const faqs = customFAQs || [
		{
			question: `What is ${topic}?`,
			answer: `${topic} is a premier online gaming platform offering exciting games, crypto integration, and rewarding experiences.`,
		},
		{
			question: `How do I get started with ${topic}?`,
			answer: `Getting started is easy! Simply create an account, connect your wallet, and start playing your favorite games.`,
		},
		{
			question: `Is ${topic} safe and secure?`,
			answer: `Yes, ${topic} uses advanced security measures including encryption and blockchain technology to ensure your safety.`,
		},
	];

	// Generate FAQ schema
	const schema = generateFAQSchema(faqs);

	// Generate HTML markup for FAQs
	const markup = `
<section itemScope itemType="https://schema.org/FAQPage">
  ${faqs
		.map(
			(faq) => `
  <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
    <h3 itemProp="name">${faq.question}</h3>
    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
      <p itemProp="text">${faq.answer}</p>
    </div>
  </div>
  `
		)
		.join("")}
</section>
  `.trim();

	return { faqs, schema, markup };
}

/**
 * Generate HowTo content optimized for Answer Engines
 */
export function generateAEOHowTo(data: {
	name: string;
	description: string;
	steps: HowToStep[];
	totalTime?: string;
}): {
	schema: Record<string, unknown>;
	markup: string;
} {
	const config = getSEOConfig();

	if (!config.aeo.enabled || !config.aeo.generateHowTo) {
		return { schema: {}, markup: "" };
	}

	// Generate HowTo schema
	const schema = generateHowToSchema(data);

	// Generate HTML markup
	const markup = `
<div itemScope itemType="https://schema.org/HowTo">
  <h2 itemProp="name">${data.name}</h2>
  <p itemProp="description">${data.description}</p>
  ${
		data.totalTime
			? `<meta itemProp="totalTime" content="${data.totalTime}"/>`
			: ""
  }
  <ol>
    ${data.steps
		.map(
			(step) => `
    <li itemScope itemProp="step" itemType="https://schema.org/HowToStep">
      <strong itemProp="name">${step.name}</strong>
      <p itemProp="text">${step.text}</p>
      ${
			step.image
				? `<img itemProp="image" src="${step.image}" alt="${step.name}"/>`
				: ""
		}
    </li>
    `
		)
		.join("")}
  </ol>
</div>
  `.trim();

	return { schema, markup };
}

/**
 * Generate short answer for featured snippets
 */
export function generateFeaturedSnippet(
	question: string,
	answer: string
): {
	summary: string;
	detailedAnswer: string;
	bulletPoints: string[];
} {
	const config = getSEOConfig();

	if (!config.aeo.enabled || !config.aeo.targetFeaturedSnippets) {
		return { summary: answer, detailedAnswer: answer, bulletPoints: [] };
	}

	// Generate concise summary (40-60 words for featured snippets)
	const words = answer.split(" ");
	const summary =
		words.slice(0, 50).join(" ") + (words.length > 50 ? "..." : "");

	// Extract bullet points
	const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
	const bulletPoints = sentences.slice(0, 5).map((s) => s.trim());

	return {
		summary,
		detailedAnswer: answer,
		bulletPoints,
	};
}

/**
 * Generate speakable content for voice search
 */
export function generateSpeakableContent(content: {
	headline: string;
	summary: string;
	sections: Array<{ title: string; content: string }>;
}): {
	schema: Record<string, unknown>;
	cssSelectors: string[];
} {
	const config = getSEOConfig();

	if (!config.aeo.enabled || !config.aeo.enableSpeakable) {
		return { schema: {}, cssSelectors: [] };
	}

	// Generate Speakable schema
	const schema = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: content.headline,
		speakable: {
			"@type": "SpeakableSpecification",
			cssSelector: [
				".speakable-headline",
				".speakable-summary",
				".speakable-section",
			],
		},
	};

	return {
		schema,
		cssSelectors: [
			".speakable-headline",
			".speakable-summary",
			".speakable-section",
		],
	};
}

/**
 * Optimize heading structure for Answer Engines
 */
export function optimizeHeadingStructure(content: string): {
	h1: string | null;
	h2s: string[];
	hierarchy: Array<{ level: number; text: string }>;
	recommendations: string[];
} {
	const recommendations: string[] = [];

	// Extract headings (basic regex pattern)
	const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
	const h2Matches = content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi);
	const h2s = Array.from(h2Matches).map((match) => match[1]);

	const h1 = h1Match ? h1Match[1] : null;

	// Build hierarchy
	const hierarchy: Array<{ level: number; text: string }> = [];
	if (h1) hierarchy.push({ level: 1, text: h1 });
	h2s.forEach((h2) => hierarchy.push({ level: 2, text: h2 }));

	// Generate recommendations
	if (!h1) {
		recommendations.push("Add an H1 heading for better SEO");
	}
	if (h2s.length === 0) {
		recommendations.push("Add H2 headings to structure your content");
	}
	if (h2s.length < 3) {
		recommendations.push(
			"Consider adding more H2 sections for better content organization"
		);
	}

	return { h1, h2s, hierarchy, recommendations };
}

/**
 * Generate AEO-optimized content structure
 */
export function generateAEOStructure(topic: string): {
	introduction: string;
	faqs: FAQItem[];
	howTo?: {
		name: string;
		description: string;
		steps: HowToStep[];
	};
	conclusion: string;
} {
	return {
		introduction: `Discover everything you need to know about ${topic}. This comprehensive guide covers key concepts, best practices, and expert tips.`,
		faqs: [
			{
				question: `What is ${topic}?`,
				answer: `${topic} is an innovative platform that provides users with exceptional gaming experiences through cutting-edge technology.`,
			},
			{
				question: `How does ${topic} work?`,
				answer: `${topic} works by combining blockchain technology with traditional gaming to create a seamless, secure experience.`,
			},
			{
				question: `What are the benefits of ${topic}?`,
				answer: `Benefits include enhanced security, transparent transactions, instant rewards, and a wide variety of gaming options.`,
			},
		],
		howTo: {
			name: `How to Get Started with ${topic}`,
			description: `Follow these simple steps to begin your journey with ${topic}`,
			steps: [
				{
					name: "Create an Account",
					text: "Sign up using your email or connect your crypto wallet for instant access.",
				},
				{
					name: "Verify Your Identity",
					text: "Complete the quick verification process to ensure account security.",
				},
				{
					name: "Make Your First Deposit",
					text: "Fund your account using crypto or traditional payment methods.",
				},
				{
					name: "Start Playing",
					text: "Browse games, choose your favorites, and start winning rewards!",
				},
			],
		},
		conclusion: `Start your ${topic} journey today and experience the future of online gaming.`,
	};
}

/**
 * Validate AEO compliance
 */
export function validateAEO(content: {
	hasFAQs: boolean;
	hasHowTo: boolean;
	hasStructuredHeadings: boolean;
	hasShortAnswers: boolean;
}): {
	score: number;
	compliance: Array<{ feature: string; status: boolean; weight: number }>;
	recommendations: string[];
} {
	const checks = [
		{ feature: "FAQ Schema", status: content.hasFAQs, weight: 30 },
		{ feature: "HowTo Schema", status: content.hasHowTo, weight: 20 },
		{
			feature: "Structured Headings",
			status: content.hasStructuredHeadings,
			weight: 25,
		},
		{
			feature: "Short Answers",
			status: content.hasShortAnswers,
			weight: 25,
		},
	];

	const score = checks.reduce((acc, check) => {
		return acc + (check.status ? check.weight : 0);
	}, 0);

	const recommendations: string[] = [];
	checks.forEach((check) => {
		if (!check.status) {
			recommendations.push(
				`Add ${check.feature} to improve AEO score (+${check.weight} points)`
			);
		}
	});

	return { score, compliance: checks, recommendations };
}

const aeoManager = {
	generateAEOFAQs,
	generateAEOHowTo,
	generateFeaturedSnippet,
	generateSpeakableContent,
	optimizeHeadingStructure,
	generateAEOStructure,
	validateAEO,
};

export default aeoManager;
