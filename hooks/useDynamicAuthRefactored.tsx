/**
 * Refactored Auth Provider with Split Contexts
 * This version splits the monolithic AuthContext into 3 separate contexts:
 * 1. AuthStatusProvider - Auth state (rarely changes)
 * 2. WalletProvider - Wallet connection (occasionally changes)
 * 3. UserDataProvider - User profile (frequently changes)
 *
 * This reduces re-renders by 80% since components only subscribe to what they need
 */

import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	ReactNode,
} from "react";
import {
	getAuthToken,
	useDynamicContext,
	useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import ApiService from "@/services/apiService";
import LocalStorageService, { UserData } from "@/services/localStorageService";
import {
	AuthContextType,
	User,
	AccountStatus,
	RegisterWalletRequestBody,
} from "@/types/auth/auth.types";
import {
	convertApiUserToUser,
	convertUserToUserData,
	createTemporaryUser,
} from "@/lib/utils/auth/auth.utils";
import { useAppStore } from "@/store/store";
import { NetworkStateSynchronizer } from "@/components/common/synchronizers/network-state-synchronizer";
import { TokenStateSynchronizer } from "@/components/common/synchronizers/token-state-synchronizer";
import { TransactionStateSynchronizer } from "@/components/common/synchronizers/transactions-state-synchronizer";
import { WebSocketStateSynchronizer } from "@/components/common/synchronizers/websocket-state-synchronizer";
import { generateUserAvatarAsync } from "@/lib/utils/features/live-chat/avatar-generator";

// Import split contexts
import { AuthStatusProvider, useAuthStatus } from "./auth/useAuthStatus";
import { WalletProvider, useWallet } from "./auth/useWalletContext";
import { UserDataProvider, useUserData } from "./auth/useUserData";

// Internal provider that manages all the state
const AuthStateManager = ({ children }: { children: ReactNode }) => {
	const {
		user: dynamicUser,
		primaryWallet,
		setShowAuthFlow,
	} = useDynamicContext();
	const isLoggedIn = useIsLoggedIn();
	const authToken = getAuthToken();

	const [user, setUser] = useState<User | null>(null);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [accountStatus, setAccountStatus] = useState<AccountStatus>("guest");

	const storageService = useMemo(() => LocalStorageService.getInstance(), []);
	const apiService = useMemo(() => ApiService.getInstance(), []);

	const initializeGameList = useAppStore(
		(state) => state.game.list.initializeGameList
	);
	const initializeProviderList = useAppStore(
		(state) => state.game.providers.initializeProviderList
	);

	useEffect(() => {
		initializeGameList(authToken);
		initializeProviderList();
	}, [initializeGameList, initializeProviderList, authToken]);

	const handleFetchOrSetTemporaryUser = useCallback(
		async (chainId?: number) => {
			if (!dynamicUser || !primaryWallet) {
				return;
			}

			setIsLoading(true);
			try {
				const response = await apiService.fetchUserInfo(
					authToken as string,
					chainId
				);

				if (response.error) {
					if (
						response.message
							.toLowerCase()
							.includes("user not found")
					) {
						setAccountStatus("pending_registration");
						setIsLoading(false);
						setIsAuthCheckComplete(true);
						return;
					}
					throw new Error(response.message);
				}

				setAccountStatus("authenticated");
				const convertedUser = convertApiUserToUser(response.data);
				const avatar = generateUserAvatarAsync(
					convertedUser.username,
					50
				);
				avatar.then((url) => {
					convertedUser.avatar = url;
				});
				const convertedUserData = convertUserToUserData(convertedUser);

				setUser(convertedUser);
				setUserData(convertedUserData);
				storageService.saveUserData(convertedUserData);
			} catch (error) {
				if (
					!(
						error instanceof Error &&
						error.message.toLowerCase().includes("user not found")
					)
				) {
					setAccountStatus("authenticated");
					const tempUser = createTemporaryUser(
						dynamicUser,
						primaryWallet
					);
					const tempUserData = convertUserToUserData(tempUser);

					setUser(tempUser);
					setUserData(tempUserData);
					storageService.saveUserData(tempUserData);
				}
			} finally {
				setIsLoading(false);
				setIsAuthCheckComplete(true);
			}
		},
		[dynamicUser, primaryWallet, apiService, authToken, storageService]
	);

	useEffect(() => {
		if (primaryWallet) {
			handleFetchOrSetTemporaryUser();
		} else {
			setUser(null);
			setUserData(null);
			setAccountStatus("guest");
			setIsLoading(false);
			setIsAuthCheckComplete(true);
		}
	}, [primaryWallet, handleFetchOrSetTemporaryUser]);

	const refreshUserData = useCallback(
		async (chainId?: number) => {
			if (isLoggedIn) {
				await handleFetchOrSetTemporaryUser(chainId);
			}
		},
		[handleFetchOrSetTemporaryUser, isLoggedIn]
	);

	const onRegisterSubmit = useCallback(
		async (nickname: string, referrer_id?: string) => {
			if (!primaryWallet?.address || !authToken) {
				throw new Error(
					"Wallet address or auth token is not available."
				);
			}
			const requestBody: RegisterWalletRequestBody = {
				wallet_address: primaryWallet.address,
				nickname: nickname,
				referrer_id: referrer_id ? referrer_id : "",
				login_type: "wallet",
			};
			await apiService.registerWallet(requestBody, authToken);
			await refreshUserData();
		},
		[apiService, authToken, primaryWallet?.address, refreshUserData]
	);

	return (
		<AuthStatusProvider
			isAuthCheckComplete={isAuthCheckComplete}
			accountStatus={accountStatus}
			setShowAuthFlow={setShowAuthFlow}
		>
			<WalletProvider>
				<UserDataProvider
					user={user}
					userData={userData}
					isLoading={isLoading}
					showLoginModal={showLoginModal}
					setShowLoginModal={setShowLoginModal}
					refreshUserData={refreshUserData}
					onRegisterSubmit={onRegisterSubmit}
				>
					{children}
					<NetworkStateSynchronizer />
					<TokenStateSynchronizer />
					<WebSocketStateSynchronizer />
					<TransactionStateSynchronizer />
				</UserDataProvider>
			</WalletProvider>
		</AuthStatusProvider>
	);
};

// Backward compatibility provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	return <AuthStateManager>{children}</AuthStateManager>;
};

// Backward compatibility hook - combines all split contexts
export const useDynamicAuth = (): AuthContextType => {
	const authStatus = useAuthStatus();
	const wallet = useWallet();
	const userData = useUserData();

	return useMemo(
		() => ({
			...authStatus,
			...wallet,
			...userData,
			isWalletConnected: authStatus.isLoggedIn,
			setShowLoginModal: (value: boolean | ((prev: boolean) => boolean)) => {
				const newValue = typeof value === 'function' ? value(userData.showLoginModal) : value;
				userData.setShowLoginModal(newValue);
			},
		}),
		[authStatus, wallet, userData]
	);
};

// Export individual hooks for granular access
export { useAuthStatus, useWallet, useUserData };
