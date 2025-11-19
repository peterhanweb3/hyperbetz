/**
 * Safe localStorage wrapper for SSR compatibility
 * - Returns null on server-side
 * - Works correctly in browser
 * - Prevents localStorage errors during SSG/SSR
 */

export const safeLocalStorage = {
	getItem: (key: string): string | null => {
		if (typeof window === 'undefined') return null;
		try {
			return localStorage.getItem(key);
		} catch {
			return null;
		}
	},

	setItem: (key: string, value: string): void => {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(key, value);
		} catch {
			// Silently fail in SSR or if localStorage is full/disabled
		}
	},

	removeItem: (key: string): void => {
		if (typeof window === 'undefined') return;
		try {
			localStorage.removeItem(key);
		} catch {
			// Silently fail in SSR
		}
	},

	clear: (): void => {
		if (typeof window === 'undefined') return;
		try {
			localStorage.clear();
		} catch {
			// Silently fail in SSR
		}
	}
};
