"use client";
import {
	ReactNode,
	Suspense,
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { AuthProvider, useDynamicAuth } from "@/hooks/useDynamicAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/common/header/header";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SetNicknameModal } from "@/components/auth/set-nickname-modal";
import { useAppStore } from "@/store/store";
import {
	arbitrum,
	mainnet,
	polygon,
	optimism,
	zksync,
	base,
	bsc,
	avalanche,
	linea,
} from "@reown/appkit/networks";
import { TransactionModal } from "@/components/features/walletProvider/transaction-modal";
import { TransactionModalSkeleton } from "@/components/features/walletProvider/transction-modal-skeleton";
import { IdleModal } from "@/components/common/idle-modal";
import { SmallBonusModal } from "@/components/common/small-bonus-modal";
import { BlurOverlayProvider } from "@/context/blur-overlay-context";
import { BlurOverlay } from "@/components/common/blur-overlay";
import { LiveChatSidebar } from "@/components/features/live-chat/live-chat-sidebar";
import LocalStorageService from "@/services/localStorageService";
import { MobileBottomNavigation } from "@/components/common/mobile-bottom-navigation";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import { useCrossTabLogout } from "@/hooks/use-cross-tab-logout";
import { OfflineDetector } from "@/components/common/offline-detector";

const queryClient = new QueryClient();

const SUPPORTED_NETWORKS = [
	polygon,
	arbitrum,
	mainnet,
	optimism,
	base,
	avalanche,
	bsc,
	linea,
	zksync,
] as const;

const AppContent = ({ children }: { children: ReactNode }) => {
	const { accountStatus, user, isLoggedIn } = useDynamicAuth();

	// Enable cross-tab logout detection
	useCrossTabLogout(isLoggedIn);

	return (
		<>
			{children}
			{accountStatus === "pending_registration" && <SetNicknameModal />}
			{isLoggedIn && user ? (
				<Suspense fallback={<TransactionModalSkeleton />}>
					<TransactionModal />
				</Suspense>
			) : null}
		</>
	);
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Load debug helper in development

	const config = useMemo(
		() =>
			createConfig({
				chains: SUPPORTED_NETWORKS,
				multiInjectedProviderDiscovery: false,
				transports: {
					[polygon.id]: http(),
					[arbitrum.id]: http(),
					[mainnet.id]: http(),
					[optimism.id]: http(),
					[base.id]: http(),
					[avalanche.id]: http(),
					[bsc.id]: http(),
					[linea.id]: http(),
					[zksync.id]: http(),
				},
			}),
		[]
	);

	const [isLoggedInOneTime, setIsLoggedInOneTime] = useState(false);
	const [showSmallModal, setShowSmallModal] = useState(false);
	const dynamicLoaded = useAppStore((state) => state.dynamicLoaded);
	const authSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	// OPTIMIZED: Memoize handlers to prevent recreation on every render
	const handleClose = useCallback(() => {
		setIsLoggedInOneTime(false);
		if (typeof window === "undefined") {
			return;
		}
		// Always refresh countdown end time when closing idle modal
		localStorage.setItem(
			"smallModalTime",
			new Date(Date.now() + 50000).toISOString()
		);
		localStorage.setItem("smallModalStatus", "true");
		// Defer to next tick so IdleModal unmounts cleanly
		setTimeout(() => setShowSmallModal(true), 0);
	}, []);

	// OPTIMIZED: Memoize modal opener to prevent recreation
	const openMiniModal = useCallback(() => {
		if (typeof window === "undefined") {
			return;
		}
		const storedTime = localStorage.getItem("smallModalTime");
		const storedStatus = localStorage.getItem("smallModalStatus");

		if (storedTime) {
			const timeDiff = new Date(storedTime).getTime() - Date.now();
			// If time is in the past or unrealistically far in the future, clean up
			if (timeDiff <= 0 || timeDiff > 12 * 60 * 60 * 1000) {
				localStorage.removeItem("smallModalTime");
				localStorage.removeItem("smallModalStatus");
				return;
			}
		}

		if (storedTime && storedStatus == "true") {
			setShowSmallModal(true);
		}
	}, []);

	// show small modal from localstorage get time and status
	useEffect(() => {
		openMiniModal();
	}, [dynamicLoaded, openMiniModal]);

	// Get the modal action from store
	const openTransactionModal = useAppStore(
		(state) => state.uiDefinition.modal.openTransactionModal
	);

	// OPTIMIZED: Memoize more handlers
	const handleDeposit = useCallback(() => {
		setShowSmallModal(false);
		setIsLoggedInOneTime(false);
		openTransactionModal("deposit");
	}, [openTransactionModal]);

	const handleCloseSmall = useCallback(() => {
		setShowSmallModal(false);
		localStorage.setItem("smallModalStatus", "false");
	}, []);

	// OPTIMIZED: Memoize storage service to prevent recreation
	const storageService = useMemo(() => LocalStorageService.getInstance(), []);

	useEffect(() => {
		return () => {
			if (authSuccessTimerRef.current) {
				clearTimeout(authSuccessTimerRef.current);
			}
		};
	}, []);

	const dynamicSettings = useMemo(
		() => ({
			environmentId: process.env
				.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID as string,
			walletConnectors: [EthereumWalletConnectors],
			mobileExperience: "redirect" as const,
			social: {
				strategy: "popup" as const,
			},
			events: {
				onAuthSuccess: () => {
					if (authSuccessTimerRef.current) {
						clearTimeout(authSuccessTimerRef.current);
					}
					authSuccessTimerRef.current = setTimeout(() => {
						setIsLoggedInOneTime(true);
					}, 30000);
				},
				onLogout: () => {
					if (authSuccessTimerRef.current) {
						clearTimeout(authSuccessTimerRef.current);
					}
					setIsLoggedInOneTime(false);
					setShowSmallModal(false);
					storageService.clearUserData();
					if (typeof window !== "undefined") {
						// Clear any user balance cache keys from live chat
						Object.keys(localStorage).forEach((key) => {
							if (key.startsWith("userBalance_")) {
								localStorage.removeItem(key);
							}
						});
					}
				},
			},
		}),
		[
			authSuccessTimerRef,
			setIsLoggedInOneTime,
			setShowSmallModal,
			storageService,
		]
	);

	return (
		// Keep your top-level providers
		<DynamicContextProvider settings={dynamicSettings}>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<DynamicWagmiConnector>
						<TooltipProvider>
							<Sonner
								position="top-center"
								richColors
								closeButton
							/>
							<AuthProvider>
								<BlurOverlayProvider>
									{/* <SidebarProvider> */}
									<SidebarProvider className="overflow-x-clip">
										<AppSidebar />
										{/* <SidebarInset> */}
									<SidebarInset className="overflow-auto">
										{/* Transferred the width calculation of PageHeader to the component itself */}
										<PageHeader className="consistent-padding-x fixed w-full z-40" />
										<OfflineDetector />
										<BlurOverlay />
										<LiveChatSidebar />
											<IdleModal
												open={isLoggedInOneTime}
												onClose={handleClose}
												onDepositCallback={
													handleDeposit
												}
											/>
											<SmallBonusModal
												open={showSmallModal}
												onClose={handleCloseSmall}
												onDeposit={handleDeposit}
											/>
											<AppContent>
												<main className="flex flex-1 flex-col gap-4 consistent-padding-y consistent-padding-x mt-16 pb-16 md:pb-0">
													{children}
												</main>
											</AppContent>
											<MobileBottomNavigation />
										</SidebarInset>
									</SidebarProvider>
								</BlurOverlayProvider>
							</AuthProvider>
						</TooltipProvider>
					</DynamicWagmiConnector>
				</QueryClientProvider>
			</WagmiProvider>
		</DynamicContextProvider>
	);
}
