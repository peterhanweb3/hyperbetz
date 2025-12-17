"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faGlobe,
	faMagnifyingGlass,
	faCheck,
} from "@fortawesome/pro-light-svg-icons";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/lib/locale-provider";
import { languages } from "@/constants/features/live-chat/live-chat.constants";
import { locales } from "@/constants/features/i18n/i18n.constants";
import { Locale } from "@/types/i18n/i18n.types";

interface LanguageChangerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LanguageChangerModal({
	open,
	onOpenChange,
}: LanguageChangerModalProps) {
	// const tHeader = useTranslations("header");
	const { locale, setLocale } = useLocaleContext();
	const [searchTerm, setSearchTerm] = useState("");

	// Filter languages based on available locales
	const availableLanguages = languages.filter((l) =>
		(locales as readonly string[]).includes(l.code)
	);

	// Filter languages based on search term
	const filteredLanguages = availableLanguages.filter((lang) => {
		const searchLower = searchTerm.toLowerCase();

		// Function to normalize text by removing accents and special characters
		const normalizeText = (text: string) => {
			return text
				.toLowerCase()
				.normalize("NFD") // Decompose accented characters
				.replace(/[\u0300-\u036f]/g, "") // Remove accent marks
				.replace(/[^\w\s]/g, "") // Remove special characters except word chars and spaces
				.replace(/\s+/g, " ") // Normalize spaces
				.trim();
		};

		// Create language name mappings for common English names
		const languageNameMap: Record<string, string[]> = {
			en: ["english"],
			es: ["spanish", "español", "espanol"],
			ar: ["arabic", "العربية"],
			zh: ["chinese", "mandarin", "中文"],
			nl: ["dutch", "nederlands"],
			fr: ["french", "français", "francais", "france"],
			de: ["german", "deutsch"],
			hi: ["hindi", "हिन्दी"],
			it: ["italian", "italiano"],
			ja: ["japanese", "日本語"],
			ko: ["korean", "한국어"],
			ms: ["malay", "bahasa"],
			fa: ["persian", "farsi", "فارسی"],
			pl: ["polish", "polski"],
			pt: ["portuguese", "português", "portugues"],
			ru: ["russian", "русский"],
			sv: ["swedish", "svenska"],
			th: ["thai", "ไทย"],
			tr: ["turkish", "türkçe", "turkce"],
			vi: ["vietnamese", "tiếng việt", "tieng viet"],
		};

		// Normalize search term
		const normalizedSearch = normalizeText(searchLower);

		// Check if search matches:
		// 1. Language name (native) - normalized
		// 2. Language code
		// 3. English language names - normalized
		return (
			normalizeText(lang.name).includes(normalizedSearch) ||
			lang.code.toLowerCase().includes(searchLower) ||
			(languageNameMap[lang.code] || []).some((name) =>
				normalizeText(name).includes(normalizedSearch)
			)
		);
	});

	const handleLanguageSelect = (langCode: string) => {
		setLocale(langCode as Locale);
		onOpenChange(false);
		setSearchTerm("");
	};

	const currentLanguage = availableLanguages.find(
		(lang) => lang.code === locale
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden">
				{/* Header */}
				<DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-full bg-primary/10">
							<FontAwesomeIcon
								icon={faGlobe}
								className="w-5 h-5 text-primary"
							/>
						</div>
						<div>
							<DialogTitle className="text-xl font-semibold">
								Choose Language
							</DialogTitle>
							<p className="text-sm text-muted-foreground mt-1">
								Select your preferred language for the interface
							</p>
						</div>
					</div>

					{/* Current Language Badge */}
					{currentLanguage && (
						<div className="mt-4">
							<Badge variant="secondary" className="text-sm">
								<span className="mr-2">
									{currentLanguage.flag}
								</span>
								Currently: {currentLanguage.name}
							</Badge>
						</div>
					)}
				</DialogHeader>

				{/* Search */}
				<div className="p-4 border-b">
					<div className="relative">
						<FontAwesomeIcon
							icon={faMagnifyingGlass}
							className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
						/>
						<Input
							placeholder="Search languages (e.g. france, turkce, espanol)..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
						/>
					</div>
				</div>

				{/* Language List */}
				<ScrollArea className="flex-1 max-h-80 language-modal-scroll">
					<div className="p-2">
						{filteredLanguages.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<FontAwesomeIcon
									icon={faMagnifyingGlass}
									className="w-8 h-8 mb-2 opacity-50"
								/>
								<p>No languages found</p>
								<p className="text-xs">
									Try adjusting your search
								</p>
							</div>
						) : (
							<div className="grid gap-1">
								{filteredLanguages.map((lang) => {
									const isSelected = lang.code === locale;
									return (
										<Button
											key={lang.code}
											variant="ghost"
											onClick={() =>
												handleLanguageSelect(lang.code)
											}
											className={cn(
												"group relative w-full justify-start h-auto p-3 rounded-lg transition-all duration-200",
												"hover:bg-primary/5 hover:scale-[1.02] hover:shadow-sm",
												isSelected &&
													"bg-primary/10 border border-primary/20 shadow-sm"
											)}
										>
											{/* Selection indicator */}
											{isSelected && (
												<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50" />
											)}

											<div className="flex items-center gap-3 relative z-10 w-full">
												{/* Flag */}
												<div className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
													{lang.flag}
												</div>

												{/* Language info */}
												<div className="flex-1 text-left">
													<div className="flex items-center gap-2">
														<span className="font-medium text-foreground">
															{lang.name}
														</span>
														{isSelected && (
															<FontAwesomeIcon
																icon={faCheck}
																className="w-4 h-4 text-primary"
															/>
														)}
													</div>
													<div className="text-xs text-muted-foreground uppercase font-mono">
														{lang.code}
													</div>
												</div>

												{/* Native script indicator for non-Latin scripts */}
												{(lang.code === "zh" ||
													lang.code === "hi" ||
													lang.code === "ja" ||
													lang.code === "ko" ||
													lang.code === "ar" ||
													lang.code === "fa" ||
													lang.code === "th" ||
													lang.code === "ru") && (
													<Badge
														variant="outline"
														className="text-xs"
													>
														Non-Latin
													</Badge>
												)}
											</div>
										</Button>
									);
								})}
							</div>
						)}
					</div>
				</ScrollArea>

				{/* Footer */}
				<div className="p-4 border-t bg-muted/20">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{filteredLanguages.length} languages available
						</span>
						<span>Changes apply immediately</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
