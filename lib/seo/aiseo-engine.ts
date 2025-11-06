/**
 * AISEO Engine (AI Semantic SEO)
 * Semantic keyword clustering and entity extraction for AI-first optimization
 */

import { getSEOConfig } from "./seo-config-loader";

/**
 * Extract semantic entities from content
 * Uses basic NLP patterns for entity recognition
 */
export function extractEntities(content: string): {
	keywords: string[];
	entities: Array<{ text: string; type: string }>;
	topics: string[];
} {
	// Basic keyword extraction (in production, use NLP library or API)
	const words = content
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 3);

	const wordFrequency = words.reduce((acc, word) => {
		acc[word] = (acc[word] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const keywords = Object.entries(wordFrequency)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10)
		.map(([word]) => word);

	// Extract common gaming entities
	const entities: Array<{ text: string; type: string }> = [];
	const entityPatterns = [
		{
			pattern: /slot|roulette|blackjack|poker|baccarat/gi,
			type: "GameType",
		},
		{ pattern: /bitcoin|crypto|ethereum|usdt|bnb/gi, type: "Currency" },
		{ pattern: /bonus|jackpot|reward|prize/gi, type: "Promotion" },
		{ pattern: /live|real-time|instant/gi, type: "Feature" },
	];

	entityPatterns.forEach(({ pattern, type }) => {
		const matches = content.match(pattern);
		if (matches) {
			matches.forEach((match) => {
				entities.push({ text: match.toLowerCase(), type });
			});
		}
	});

	// Extract topics
	const topics = [...new Set(entities.map((e) => e.type))];

	return { keywords, entities, topics };
}

/**
 * Generate semantic title suggestions
 */
export function generateTitleSuggestions(
	baseTitle: string,
	keywords: string[]
): string[] {
	const suggestions: string[] = [baseTitle];

	if (keywords.length > 0) {
		suggestions.push(`${baseTitle} - ${keywords.slice(0, 2).join(", ")}`);
		suggestions.push(`${keywords[0]} | ${baseTitle}`);
		suggestions.push(`${baseTitle}: ${keywords.slice(0, 3).join(" & ")}`);
	}

	return suggestions.slice(0, 5);
}

/**
 * Generate meta description suggestions based on content
 */
export function generateDescriptionSuggestions(
	content: string,
	maxLength: number = 155
): string[] {
	const sentences = content
		.split(/[.!?]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 20 && s.length < maxLength);

	const suggestions: string[] = [];

	// First sentence
	if (sentences[0]) {
		suggestions.push(sentences[0].substring(0, maxLength));
	}

	// Combination of first two sentences
	if (sentences.length >= 2) {
		const combined = `${sentences[0]}. ${sentences[1]}`;
		if (combined.length <= maxLength) {
			suggestions.push(combined);
		}
	}

	return suggestions;
}

/**
 * Optimize content for AI readability
 * Returns structured data optimized for AI understanding
 */
export function optimizeForAI(content: {
	title: string;
	description: string;
	body?: string;
}): {
	optimized: {
		title: string;
		description: string;
		keywords: string[];
		entities: Array<{ text: string; type: string }>;
		readabilityScore: number;
	};
	suggestions: {
		titles: string[];
		descriptions: string[];
	};
} {
	const fullContent = `${content.title} ${content.description} ${
		content.body || ""
	}`;
	const { keywords, entities } = extractEntities(fullContent);

	// Calculate simple readability score (0-100)
	const words = fullContent.split(/\s+/).length;
	const sentences = fullContent.split(/[.!?]+/).length;
	const avgWordsPerSentence = words / sentences;
	const readabilityScore = Math.max(
		0,
		Math.min(100, 100 - avgWordsPerSentence * 2)
	);

	return {
		optimized: {
			title: content.title,
			description: content.description,
			keywords,
			entities,
			readabilityScore: Math.round(readabilityScore),
		},
		suggestions: {
			titles: generateTitleSuggestions(content.title, keywords),
			descriptions: generateDescriptionSuggestions(fullContent),
		},
	};
}

/**
 * Generate internal linking suggestions based on content
 */
export function generateInternalLinkSuggestions(
	currentPage: string,
	content: string,
	availablePages: Array<{ path: string; title: string; keywords: string[] }>
): Array<{ page: string; relevance: number; anchor: string }> {
	const { keywords } = extractEntities(content);
	const suggestions: Array<{
		page: string;
		relevance: number;
		anchor: string;
	}> = [];

	availablePages.forEach((page) => {
		if (page.path === currentPage) return;

		// Calculate relevance score based on keyword overlap
		const overlap = keywords.filter((kw) =>
			page.keywords.some((pk) => pk.includes(kw) || kw.includes(pk))
		);

		if (overlap.length > 0) {
			const relevance = (overlap.length / keywords.length) * 100;
			suggestions.push({
				page: page.path,
				relevance: Math.round(relevance),
				anchor: page.title,
			});
		}
	});

	return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

/**
 * Validate SEO compliance
 */
export function validateSEO(data: {
	title: string;
	description: string;
	keywords?: string[];
	headings?: string[];
}): {
	isValid: boolean;
	score: number;
	issues: Array<{ type: "error" | "warning"; message: string }>;
	recommendations: string[];
} {
	const issues: Array<{ type: "error" | "warning"; message: string }> = [];
	const recommendations: string[] = [];
	let score = 100;

	// Title validation
	if (!data.title) {
		issues.push({ type: "error", message: "Title is missing" });
		score -= 20;
	} else {
		if (data.title.length < 30) {
			issues.push({
				type: "warning",
				message: "Title is too short (< 30 chars)",
			});
			score -= 10;
			recommendations.push(
				"Expand title to 50-60 characters for better SEO"
			);
		}
		if (data.title.length > 60) {
			issues.push({
				type: "warning",
				message: "Title is too long (> 60 chars)",
			});
			score -= 10;
			recommendations.push("Shorten title to under 60 characters");
		}
	}

	// Description validation
	if (!data.description) {
		issues.push({ type: "error", message: "Description is missing" });
		score -= 20;
	} else {
		if (data.description.length < 120) {
			issues.push({
				type: "warning",
				message: "Description is too short (< 120 chars)",
			});
			score -= 10;
			recommendations.push("Expand description to 150-160 characters");
		}
		if (data.description.length > 160) {
			issues.push({
				type: "warning",
				message: "Description is too long (> 160 chars)",
			});
			score -= 10;
			recommendations.push("Shorten description to under 160 characters");
		}
	}

	// Keywords validation
	if (!data.keywords || data.keywords.length === 0) {
		issues.push({ type: "warning", message: "No keywords defined" });
		score -= 5;
		recommendations.push("Add 3-5 relevant keywords");
	}

	// Headings validation
	if (data.headings && data.headings.length > 0) {
		const h1Count = data.headings.filter((h) => h.startsWith("H1:")).length;
		if (h1Count === 0) {
			issues.push({ type: "warning", message: "No H1 heading found" });
			score -= 10;
			recommendations.push("Add one H1 heading per page");
		}
		if (h1Count > 1) {
			issues.push({
				type: "warning",
				message: "Multiple H1 headings found",
			});
			score -= 5;
			recommendations.push("Use only one H1 heading per page");
		}
	}

	return {
		isValid: issues.filter((i) => i.type === "error").length === 0,
		score: Math.max(0, score),
		issues,
		recommendations,
	};
}

/**
 * Generate AI-optimized content structure
 */
export function generateAIContentStructure(topic: string): {
	title: string;
	sections: Array<{ heading: string; keyPoints: string[] }>;
	faqs: Array<{ question: string; answer: string }>;
} {
	// This is a basic template - in production, use AI API for dynamic generation
	getSEOConfig();

	return {
		title: `Complete Guide to ${topic}`,
		sections: [
			{
				heading: `What is ${topic}?`,
				keyPoints: [
					`Definition and overview of ${topic}`,
					"Key features and benefits",
					"How it works",
				],
			},
			{
				heading: `Getting Started with ${topic}`,
				keyPoints: [
					"Step-by-step guide",
					"Requirements and prerequisites",
					"Best practices",
				],
			},
			{
				heading: `Tips for ${topic}`,
				keyPoints: [
					"Expert recommendations",
					"Common mistakes to avoid",
					"Advanced strategies",
				],
			},
		],
		faqs: [
			{
				question: `What is ${topic}?`,
				answer: `${topic} is a comprehensive solution that helps users achieve their goals through innovative features and user-friendly design.`,
			},
			{
				question: `How does ${topic} work?`,
				answer: `${topic} works by combining advanced technology with intuitive interfaces to provide seamless experiences.`,
			},
			{
				question: `Is ${topic} suitable for beginners?`,
				answer: `Yes, ${topic} is designed to be accessible for both beginners and experienced users.`,
			},
		],
	};
}

const aiseoEngine = {
	extractEntities,
	generateTitleSuggestions,
	generateDescriptionSuggestions,
	optimizeForAI,
	generateInternalLinkSuggestions,
	validateSEO,
	generateAIContentStructure,
};

export default aiseoEngine;
