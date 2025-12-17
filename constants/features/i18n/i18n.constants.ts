import { Locale } from "@/types/i18n/i18n.types";

const locales = [
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

const localeNames: Record<Locale, string> = {
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

const localeFlags: Record<Locale, string> = {
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

const rtlLocales: Locale[] = []; // Disabled RTL for all languages

const defaultLocale = "en" as const;

export { locales, localeFlags, localeNames, defaultLocale, rtlLocales };
