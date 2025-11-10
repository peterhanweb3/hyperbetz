export const locales = [
	"en", // English
	"es", // Spanish
	"ar", // Arabic
	"zh", // Chinese
	"nl", // Dutch
	"fr", // French
	"de", // German
	"hi", // Hindi
	"it", // Italian
	"ja", // Japanese
	"ko", // Korean
	"ms", // Malay
	"fa", // Persian (Farsi)
	"pl", // Polish
	"pt", // Portuguese
	"ru", // Russian
	"sv", // Swedish
	"th", // Thai
	"tr", // Turkish
	"vi", // Vietnamese
] as const;

export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
	en: "English",
	es: "Español",
	ar: "العربية",
	zh: "中文",
	nl: "Nederlands",
	fr: "Français",
	de: "Deutsch",
	hi: "हिन्दी",
	it: "Italiano",
	ja: "日本語",
	ko: "한국어",
	ms: "Bahasa Melayu",
	fa: "فارسی",
	pl: "Polski",
	pt: "Português",
	ru: "Русский",
	sv: "Svenska",
	th: "ไทย",
	tr: "Türkçe",
	vi: "Tiếng Việt",
};

export const localeFlags: Record<Locale, string> = {
	en: "🇺🇸",
	es: "🇪🇸",
	ar: "🇸🇦",
	zh: "🇨🇳",
	nl: "🇳🇱",
	fr: "🇫🇷",
	de: "🇩🇪",
	hi: "🇮🇳",
	it: "🇮🇹",
	ja: "🇯🇵",
	ko: "🇰🇷",
	ms: "🇲🇾",
	fa: "🇮🇷",
	pl: "🇵🇱",
	pt: "🇵🇹",
	ru: "🇷🇺",
	sv: "🇸🇪",
	th: "🇹🇭",
	tr: "🇹🇷",
	vi: "🇻🇳",
};

export const rtlLocales: Locale[] = []; // Disabled RTL for all languages

// eslint-disable-next-line
export function isRtlLocale(locale: Locale): boolean {
	return false; // Force all languages to use LTR layout
}

export async function getMessages(locale: Locale) {
	try {
		// Load from Dictionary folder
		const messages = (await import(`../Dictionary/${locale}.json`)).default;

		// Interpolate site name in all translations
		const { interpolateTranslations } = await import('./utils/site-config');
		return interpolateTranslations(messages);
	} catch {
		console.warn(
			`Failed to load messages for locale: ${locale}. Falling back to ${defaultLocale}`
		);
		const messages = (await import(`../Dictionary/${defaultLocale}.json`)).default;

		// Interpolate site name in fallback translations too
		const { interpolateTranslations } = await import('./utils/site-config');
		return interpolateTranslations(messages);
	}
}
