import { Locale } from "@/types/i18n/i18n.types";
import type { AbstractIntlMessages } from "next-intl";
import { interpolateTranslations } from "./utils/site-config";
import { defaultLocale } from "@/constants/features/i18n/i18n.constants";
import { loadDictionary } from "./i18n-loader";

// Re-export for backward compatibility if needed, but prefer using actions or loader directly
export { loadDictionary };

export async function getMessages(locale: Locale) {
	try {
		// Load from Dictionary folder
		const messages = await loadDictionary(locale);

		// Interpolate site name in all translations
		return interpolateTranslations(messages);
	} catch {
		console.warn(
			`Failed to load messages for locale: ${locale}. Falling back to ${defaultLocale}`
		);
		const messages = await loadDictionary(defaultLocale);

		// Interpolate site name in fallback translations too
		return interpolateTranslations(messages);
	}
}

/**
 * Server-side message loader for SEO
 * Pre-loads default English messages server-side so crawlers can see content
 */
export async function getServerMessages(
	locale: Locale = defaultLocale
): Promise<AbstractIntlMessages> {
	try {
		const messages = await loadDictionary(locale);
		const { interpolateTranslations } = await import("./utils/site-config");
		return interpolateTranslations(messages) as AbstractIntlMessages;
	} catch (error) {
		console.error(`Failed to load server messages for ${locale}:`, error);
		// Fallback to English
		const fallbackMessages = await loadDictionary(defaultLocale);
		const { interpolateTranslations } = await import("./utils/site-config");
		return interpolateTranslations(
			fallbackMessages
		) as AbstractIntlMessages;
	}
}
