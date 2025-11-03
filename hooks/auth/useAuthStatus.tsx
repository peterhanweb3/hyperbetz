/**
 * AuthStatus Context
 * Manages authentication state and auth flow
 * Changes rarely - only on login/logout
 */

import {
	createContext,
	useContext,
	useCallback,
	useMemo,
	ReactNode,
} from "react";
import {
	getAuthToken,
	useDynamicContext,
	useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { AccountStatus } from "@/types/auth/auth.types";
import { broadcastLogout } from "@/hooks/use-cross-tab-logout";
import { useAppStore } from "@/store/store";

interface AuthStatusContextType {
	isLoggedIn: boolean;
	isAuthCheckComplete: boolean;
	accountStatus: AccountStatus;
	authToken: string;
	login: () => void;
	logout: () => Promise<void>;
}

const AuthStatusContext = createContext<AuthStatusContextType | undefined>(
	undefined
);

export const AuthStatusProvider = ({
	children,
	isAuthCheckComplete,
	accountStatus,
	setShowAuthFlow,
}: {
	children: ReactNode;
	isAuthCheckComplete: boolean;
	accountStatus: AccountStatus;
	setShowAuthFlow: (show: boolean) => void;
}) => {
	const { handleLogOut } = useDynamicContext();
	const isLoggedIn = useIsLoggedIn();
	const authToken = getAuthToken();

	const clearTransactions = useAppStore(
		(state) => state.blockchain.transaction._updateAndPersist
	);

	const login = useCallback(() => {
		setShowAuthFlow(true);
	}, [setShowAuthFlow]);

	const logout = useCallback(async () => {
		try {
			if (typeof window === "undefined") {
				await handleLogOut();
				clearTransactions([]);
				return;
			}

			// Broadcast logout to all tabs BEFORE clearing data
			broadcastLogout();

			// Clear specific user data from localStorage
			const userDataKeys = [
				"referralId",
				"mw_favorite_games",
				"hyperbetz_userData",
				"hyperbetz_betting_history",
				"hyperbetz_betting_table_prefs",
				"app-font-config",
				"chatUsername",
				"token_conversion_",
			];

			userDataKeys.forEach((key) => {
				localStorage.removeItem(key);
			});

			// Clear token conversion cache (pattern-based cleanup)
			Object.keys(localStorage).forEach((key) => {
				if (
					key.startsWith("token_conversion_") ||
					key.startsWith("userBalance_")
				) {
					localStorage.removeItem(key);
				}
			});

			// Clear Dynamic SDK authentication
			await handleLogOut();

			// Clear transaction store
			clearTransactions([]);
		} catch (error) {
			// Silent error handling
		}
	}, [handleLogOut, clearTransactions]);

	const value = useMemo(
		() => ({
			isLoggedIn,
			isAuthCheckComplete,
			accountStatus,
			authToken: authToken as string,
			login,
			logout,
		}),
		[
			isLoggedIn,
			isAuthCheckComplete,
			accountStatus,
			authToken,
			login,
			logout,
		]
	);

	return (
		<AuthStatusContext.Provider value={value}>
			{children}
		</AuthStatusContext.Provider>
	);
};

export const useAuthStatus = (): AuthStatusContextType => {
	const context = useContext(AuthStatusContext);
	if (context === undefined) {
		throw new Error("useAuthStatus must be used within AuthStatusProvider");
	}
	return context;
};
