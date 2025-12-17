"use client";

import {
  TranslationValues,
  useTranslations as useNextIntlTranslations,
} from "next-intl";
import type { I18nKeys } from "@/types/i18n/keys";

export function useT(namespace?: string) {
	const t = useNextIntlTranslations(namespace);
	return (key: I18nKeys | string, values?: TranslationValues) =>
		t(key as string, values as TranslationValues);
}
