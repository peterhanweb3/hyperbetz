import { Locale } from "@/types/i18n/i18n.types";

// eslint-disable-next-line
export function isRtlLocale(locale: Locale): boolean {
	return false; // Force all languages to use LTR layout
}
