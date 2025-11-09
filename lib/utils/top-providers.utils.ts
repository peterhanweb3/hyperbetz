import { TopProviders } from "@/data/top-providers";
import {
	ProviderInfo,
	ShuffledProvidersResult,
} from "@/types/providers/top-providers.types";

/**
 * Fisher-Yates shuffle algorithm to randomly shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Get 5 random top providers from the predefined list, shuffled on every call
 * @param allProviders - Complete list of providers from the store
 * @returns Object containing 5 shuffled providers and remaining count
 */
export function getShuffledTopProviders(
	allProviders: Array<{ title: string; count?: number; url?: string }> = []
): ShuffledProvidersResult {
	// Shuffle the top providers list
	const shuffledTopProviders = shuffleArray(TopProviders);

	// Take only the first 5
	const selectedProviders = shuffledTopProviders.slice(0, 5);

	// Map to provider info format, matching with allProviders for count and url
	const providers: ProviderInfo[] = selectedProviders.map((providerName) => {
		const matchedProvider = allProviders.find(
			(p) => p.title.toLowerCase() === providerName.toLowerCase()
		);

		const seoSlug = providerName.toLowerCase().trim().replace(/\s+/g, '-').replace(/\./g, '');

		return {
			name: providerName,
			count: matchedProvider?.count || 0,
			url: matchedProvider?.url || `/games/${seoSlug}`,
		};
	});

	// Calculate remaining count (total top providers - selected)
	const remaining = TopProviders.length - 5;

	return {
		providers,
		remaining,
	};
}

/**
 * Get all top providers (for "View All" functionality)
 */
export function getAllTopProviders(
	allProviders: Array<{ title: string; count?: number; url?: string }> = []
): ProviderInfo[] {
	return TopProviders.map((providerName) => {
		const matchedProvider = allProviders.find(
			(p) => p.title.toLowerCase() === providerName.toLowerCase()
		);

		const seoSlug = providerName.toLowerCase().trim().replace(/\s+/g, '-').replace(/\./g, '');

		return {
			name: providerName,
			count: matchedProvider?.count || 0,
			url: matchedProvider?.url || `/games/${seoSlug}`,
		};
	});
}
