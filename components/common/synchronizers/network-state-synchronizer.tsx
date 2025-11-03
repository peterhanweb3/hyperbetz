"use client";

import { useEffect } from "react";
import {
	useDynamicContext,
	dynamicEvents,
	EvmNetwork,
	getNetwork,
} from "@dynamic-labs/sdk-react-core";
import { useAppStore } from "@/store/store";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";

// Helper type to safely access evmNetworks from the generic connector
export interface EvmWalletConnector {
	evmNetworks?: EvmNetwork[];
	[key: string]: unknown;
}

/**
 * An invisible "bridge" component that synchronizes the user's current wallet
 * network state from the Dynamic SDK into our central Zustand store.
 */
export const NetworkStateSynchronizer = () => {
	const { primaryWallet } = useDynamicContext();
	const { setNetworkData } = useAppStore((state) => state.blockchain.network);
	const { refreshUserData } = useDynamicAuth();

	useEffect(() => {
		const updateNetworkState = async () => {
			if (!primaryWallet?.connector) {
				setNetworkData({
					network: null,
					chainId: null,
					chainLogo: null,
				});
				return;
			}

			try {
				const chainId = await getNetwork(primaryWallet.connector);

				// console.log("primaryWallet.chain", primaryWallet.chain);
				// console.log("chainId", chainId);

				if (!chainId)
					throw new Error(
						"Could not determine chain ID from wallet."
					);

				// --- THE REFINED LOGIC ---
				// Cast the generic connector to our specific type to access evmNetworks.
				const connector =
					primaryWallet.connector as unknown as EvmWalletConnector;

				// Find the full network configuration object from the connector's list.
				const currentNetworkConfig = connector.evmNetworks?.find(
					(net: EvmNetwork) => net.chainId === chainId
				);

				if (!currentNetworkConfig) {
					throw new Error(
						`No network configuration found for chain ID ${chainId}.`
					);
				}

				// Use the vanityName if it exists, otherwise fall back to the name.
				const networkName =
					currentNetworkConfig.vanityName ||
					currentNetworkConfig.name;
				const chainLogo = currentNetworkConfig.iconUrls?.[0] || null;

				// The "network" state will now hold a clean object with the best possible name.
				setNetworkData({
					network: {
						name: networkName,
						vanityName: currentNetworkConfig.vanityName,
					},
					chainId: Number(chainId),
					chainLogo,
				});

				refreshUserData(Number(chainId));

				// --- THE CRITICAL ADDITION ---
				// After successfully updating the network, trigger a refresh of the user profile.
				// This will call the /fetchInfo API and update our `user` object with the
				// correct, network-specific `balanceToken` array.
				// console.log(
				// 	"Network changed. Triggering user profile refresh..."
				// );
			} catch (error) {
				console.error("Failed to update network state:", error);
				setNetworkData({
					network: null,
					chainId: null,
					chainLogo: null,
				});
			}
		};

		const handleNetworkChange = () => {
			updateNetworkState();
		};

		// Subscribe to the correct event.
		dynamicEvents.on("primaryWalletNetworkChanged", handleNetworkChange);

		// Initial run.
		updateNetworkState();

		// Cleanup.
		return () => {
			dynamicEvents.off(
				"primaryWalletNetworkChanged",
				handleNetworkChange
			);
		};
	}, [primaryWallet, refreshUserData, setNetworkData]);

	return null;
};
