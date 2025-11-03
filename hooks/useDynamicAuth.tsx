import {
	createContext,
	useContext,
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
import { broadcastLogout } from "@/hooks/use-cross-tab-logout";

// 1. CREATE THE CONTEXT
// The context is created with an undefined initial value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. CREATE THE PROVIDER COMPONENT
// This component will hold all the state and logic.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const {
		user: dynamicUser,
		primaryWallet,
		setShowAuthFlow,
		handleLogOut,
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
		// This effect runs once when the auth provider mounts.
		// It triggers our intelligent caching/fetching logic for the game list and providers.
		initializeGameList(authToken);
		initializeProviderList();
		// console.log("primaryWallet", primaryWallet);
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

				// console.log("response.data", response.data);
				if (response.error) {
					if (
						response.message
							.toLowerCase()
							.includes("user not found")
					) {
						// --- UPDATED LOGIC ---
						// Set the status to 'pending_registration' to trigger the modal.
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
				// console.log(
				// 	"Converted User log in useDynamicAuth:",
				// 	convertedUser
				// );
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
					console.warn(
						"API fetch failed, creating temporary user:",
						error
					);

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

	useEffect(
		() => {
			if (primaryWallet) {
				handleFetchOrSetTemporaryUser();
			} else {
				setUser(null);
				setUserData(null);
				setAccountStatus("guest");
				setIsLoading(false);
				setIsAuthCheckComplete(true);
			}

			// if (isLoggedIn) {
			// 	if (!user) {
			// 		// Fetch user data only if it doesn't exist
			// 		handleFetchOrSetTemporaryUser();
			// 	}
			// } else {
			// 	// User is not logged in, clear all data
			// 	setUser(null);
			// 	setUserData(null);
			// 	setAccountStatus("guest");
			// 	setIsLoading(false);
			// 	setIsAuthCheckComplete(true);
			// }
		},
		[primaryWallet, handleFetchOrSetTemporaryUser]
		// [isLoggedIn, user]
	);

	const login = useCallback(() => {
		setShowAuthFlow(true);
		setShowLoginModal(false);
	}, [setShowAuthFlow, setShowLoginModal]);

	const clearTransactions = useAppStore(
		(state) => state.blockchain.transaction._updateAndPersist
	);

	const logout = useCallback(async () => {
		console.log("Logging out user");

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
				"referralId",
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
			console.error("Error during logout:", error);
		}
	}, [handleLogOut, clearTransactions]);
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
				login_type: "wallet", //this is faulty for now, I have to ask dhiraj from where shoud login_type be taken
			};
			await apiService.registerWallet(requestBody, authToken);
			await refreshUserData(); // Re-fetch will update status to 'authenticated' and close modal
		},
		[apiService, authToken, primaryWallet?.address, refreshUserData]
	);

	// The value object passed to the provider
	const value: AuthContextType = useMemo(
		() => ({
			user,
			userData,
			isLoggedIn,
			isWalletConnected: isLoggedIn,
			isLoading,
			isAuthCheckComplete,
			authToken: authToken as string,
			login,
			logout,
			refreshUserData,
			showLoginModal,
			setShowLoginModal,
			accountStatus,
			onRegisterSubmit,
		}),
		[
			accountStatus,
			authToken,
			isAuthCheckComplete,
			isLoading,
			isLoggedIn,
			login,
			logout,
			onRegisterSubmit,
			refreshUserData,
			setShowLoginModal,
			showLoginModal,
			user,
			userData,
		]
	);

	return (
		<AuthContext.Provider value={value}>
			{children}
			<NetworkStateSynchronizer />
			<TokenStateSynchronizer />
			<WebSocketStateSynchronizer />
			<TransactionStateSynchronizer />
		</AuthContext.Provider>
	);
};

// 3. CREATE THE CONSUMER HOOK
// This is the clean, public-facing hook that components will use.
export const useDynamicAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
