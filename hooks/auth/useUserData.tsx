/**
 * UserData Context
 * Manages user profile data and registration
 * Changes frequently - profile updates, balance changes, etc.
 */

import {
	createContext,
	useContext,
	useMemo,
	ReactNode,
} from "react";
import { User } from "@/types/auth/auth.types";
import { UserData } from "@/services/localStorageService";

interface UserDataContextType {
	user: User | null;
	userData: UserData | null;
	isLoading: boolean;
	showLoginModal: boolean;
	setShowLoginModal: (show: boolean) => void;
	refreshUserData: (chainId?: number) => Promise<void>;
	onRegisterSubmit: (nickname: string, referrer_id?: string) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
	undefined
);

export const UserDataProvider = ({
	children,
	user,
	userData,
	isLoading,
	showLoginModal,
	setShowLoginModal,
	refreshUserData,
	onRegisterSubmit,
}: {
	children: ReactNode;
	user: User | null;
	userData: UserData | null;
	isLoading: boolean;
	showLoginModal: boolean;
	setShowLoginModal: (show: boolean) => void;
	refreshUserData: (chainId?: number) => Promise<void>;
	onRegisterSubmit: (nickname: string, referrer_id?: string) => Promise<void>;
}) => {
	const value = useMemo(
		() => ({
			user,
			userData,
			isLoading,
			showLoginModal,
			setShowLoginModal,
			refreshUserData,
			onRegisterSubmit,
		}),
		[
			user,
			userData,
			isLoading,
			showLoginModal,
			setShowLoginModal,
			refreshUserData,
			onRegisterSubmit,
		]
	);

	return (
		<UserDataContext.Provider value={value}>
			{children}
		</UserDataContext.Provider>
	);
};

export const useUserData = (): UserDataContextType => {
	const context = useContext(UserDataContext);
	if (context === undefined) {
		throw new Error("useUserData must be used within UserDataProvider");
	}
	return context;
};
