"use server";

import { Locale } from "@/types/i18n/i18n.types";
import { loadDictionary } from "./i18n-loader";
import { interpolateTranslations } from "./utils/site-config";
import { defaultLocale } from "@/constants/features/i18n/i18n.constants";

export async function getMessagesAction(locale: Locale) {
	try {
		const messages = await loadDictionary(locale);
		return interpolateTranslations(messages);
	} catch {
		console.warn(
			`Failed to load messages for locale: ${locale}. Falling back to ${defaultLocale}`
		);
		const messages = await loadDictionary(defaultLocale);
		return interpolateTranslations(messages);
	}
}
