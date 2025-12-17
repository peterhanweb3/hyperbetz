"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { AbstractIntlMessages } from "next-intl";
import {
	NextIntlClientProvider,
	useTranslations as useNextIntlTranslations,
} from "next-intl";
import { isRtlLocale } from "./i18n-utils";
import { Locale } from "@/types/i18n/i18n.types";
import {
	locales,
	defaultLocale,
} from "@/constants/features/i18n/i18n.constants";

type LocaleContextType = {
	locale: Locale;
	setLocale: (l: Locale) => void;
	isRtl: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

type LocaleProviderProps = {
	children: React.ReactNode;
	initialMessages: AbstractIntlMessages;
	initialLocale?: Locale;
};

/**
 * SEO-Friendly LocaleProvider
 * - Accepts server-loaded messages to avoid blocking render
 * - Crawlers see content immediately with default English
 * - Client-side: hydrates with user's preferred language
 */
export function LocaleProvider({
	children,
	initialMessages,
	initialLocale = defaultLocale,
}: LocaleProviderProps) {
	const [locale, setLocaleState] = useState<Locale>(initialLocale);
	const [messages, setMessages] =
		useState<AbstractIntlMessages>(initialMessages);

	// Bootstrap locale priority: cookie > localStorage > navigator
	useEffect(() => {
		if (typeof window === "undefined") return;

		// 1. First check cookie (set by middleware when visiting /ja, /de, etc.)
		const cookieLocale = document.cookie
			.split("; ")
			.find((row) => row.startsWith("NEXT_LOCALE="))
			?.split("=")[1];

		if (cookieLocale && locales.includes(cookieLocale as Locale)) {
			// Cookie has highest priority - user just navigated to /ja
			if (cookieLocale !== initialLocale) {
				setLocaleState(cookieLocale as Locale);
			}
			// Sync to localStorage so it persists
			localStorage.setItem("hyperbetz-locale", cookieLocale);
			return;
		}

		// 2. Fallback to localStorage if no cookie
		const saved = localStorage.getItem("hyperbetz-locale");
		if (saved && locales.includes(saved as Locale)) {
			setLocaleState(saved as Locale);
			return;
		}

		// 3. Final fallback to browser language
		const nav = navigator.language?.slice(0, 2) as Locale;
		if (locales.includes(nav)) {
			setLocaleState(nav);
		}
	}, [initialLocale]);

	// Load messages when locale changes (client-side only)
	useEffect(() => {
		// Skip if already on initial locale
		if (locale === initialLocale && messages === initialMessages) return;

		let mounted = true;
		(async () => {
			// Use Server Action to fetch messages - avoids bundling dictionary in client/SSR
			const { getMessagesAction } = await import("./i18n-actions");
			const m = await getMessagesAction(locale);
			if (!mounted) return;
			setMessages(m as AbstractIntlMessages);
			if (typeof document !== "undefined") {
				document.documentElement.lang = locale;
				document.documentElement.dir = isRtlLocale(locale)
					? "rtl"
					: "ltr";
			}
		})();
		return () => {
			mounted = false;
		};
	}, [locale]);

	const setLocale = (l: Locale) => {
		setLocaleState(l);
		if (typeof window !== "undefined") {
			// Sync both cookie and localStorage
			localStorage.setItem("hyperbetz-locale", l);
			document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000`; // 1 year
		}
	};

	const ctx: LocaleContextType = useMemo(
		() => ({ locale, setLocale, isRtl: isRtlLocale(locale) }),
		[locale]
	);

	// ✅ NO BLOCKING RENDER - Content always shows immediately
	return (
		<LocaleContext.Provider value={ctx}>
			<NextIntlClientProvider
				locale={locale}
				messages={messages}
				timeZone="UTC"
			>
				{children}
			</NextIntlClientProvider>
		</LocaleContext.Provider>
	);
}

export function useLocaleContext() {
	const v = useContext(LocaleContext);
	if (!v)
		throw new Error("useLocaleContext must be used within LocaleProvider");
	return v;
}

export function useTranslations(namespace?: string) {
	return useNextIntlTranslations(namespace);
}
