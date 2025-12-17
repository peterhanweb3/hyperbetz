// src/components/theme/theme-color-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor =
	| "casino"
	| "red"
	| "rose"
	| "orange"
	| "green"
	| "blue"
	| "yellow"
	| "violet"
	| "poker"
	| "poker-vibrant"
	| "midnight-ocean"
	| "rudish-vibrant";

type ThemeColorProviderProps = {
	children: React.ReactNode;
	defaultTheme?: ThemeColor;
	storageKey?: string;
};

type ThemeColorProviderState = {
	theme: ThemeColor;
	setTheme: (theme: ThemeColor) => void;
};

const initialState: ThemeColorProviderState = {
	theme: "green", // Default theme
	setTheme: () => null,
};

const ThemeColorProviderContext =
	createContext<ThemeColorProviderState>(initialState);

export function ThemeColorProvider({
	children,
	defaultTheme = "green",
	storageKey = "ui-theme-color",
	...props
}: ThemeColorProviderProps) {
	const [theme, setTheme] = useState<ThemeColor>(() => {
		// On the server, or if localStorage is not available, return default.
		if (typeof window === "undefined") {
			return defaultTheme;
		}
		try {
			return (
				(localStorage.getItem(storageKey) as ThemeColor) || defaultTheme
			);
		} catch (error) {
			console.warn(
				`Error reading localStorage key “${storageKey}”:`,
				error
			);
			return defaultTheme;
		}
	});

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(
			"theme-casino",
			"theme-red",
			"theme-rose",
			"theme-orange",
			"theme-green",
			"theme-blue",
			"theme-yellow",
			"theme-violet",
			"theme-poker",
			"theme-poker-vibrant"
		);

		// The default "casino" theme doesn't have a class, it's the root style
		if (theme !== "casino") {
			root.classList.add(`theme-${theme}`);
		}
	}, [theme]);

	const value = {
		theme,
		setTheme: (theme: ThemeColor) => {
			try {
				localStorage.setItem(storageKey, theme);
			} catch (error) {
				console.warn(
					`Error setting localStorage key “${storageKey}”:`,
					error
				);
			}
			setTheme(theme);
		},
	};

	return (
		<ThemeColorProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeColorProviderContext.Provider>
	);
}

export const useThemeColor = () => {
	const context = useContext(ThemeColorProviderContext);
	if (context === undefined) {
		throw new Error(
			"useThemeColor must be used within a ThemeColorProvider"
		);
	}
	return context;
};
