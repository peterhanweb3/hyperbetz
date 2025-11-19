"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { useLocaleContext } from "@/lib/locale-provider";
import Image from "next/image";

export default function LanguageSwitchPage() {
	const router = useRouter();
	const params = useParams();
	const { setLocale } = useLocaleContext();
	const language = params.language as string;

	useEffect(() => {
		// Check if the language is valid
		const isValidLanguage = locales.includes(language as Locale);

		if (isValidLanguage) {
			// Set the locale (this also syncs cookie and localStorage)
			setLocale(language as Locale);

			// Redirect to home page after a brief moment
			setTimeout(() => {
				router.replace("/");
			}, 500);
		} else {
			// Invalid language, redirect to home immediately
			router.replace("/");
		}
	}, [language, setLocale, router]);

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center">
			{/* App Logo */}
			<div className="mb-6 animate-pulse">
				<Image
					priority
					width={800}
					height={800}
					src="/assets/site/Hyperbetz-logo.png"
					alt="Hyperbetz Logo"
					className="w-[80%] mx-auto"
				/>
			</div>

			{/* Loading Animation */}
			<div className="flex items-center gap-2 mb-4">
				<div className="flex gap-1">
					{[0, 1, 2].map((index) => (
						<div
							key={index}
							className="w-2 h-2 bg-[#00C771] rounded-full animate-bounce"
							style={{
								animationDelay: `${index * 0.15}s`,
								animationDuration: "0.8s",
							}}
						/>
					))}
				</div>
			</div>

			<p className="text-muted-foreground text-sm">
				Switching language...
			</p>
		</div>
	);
}
