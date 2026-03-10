"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
	useDynamicContext,
	dynamicEvents,
	getNetwork,
	getAuthToken,
} from "@dynamic-labs/sdk-react-core";
import TransactionService from "@/services/walletProvider/TransactionService";

/**
 * A specialized, self-contained hook that actively listens for network changes
 * and determines if the current network is supported for withdrawals.
 *
 * Supported networks are fetched dynamically from the backend via /api/getWithdrawNetwork.
 *
 * @returns An object containing a boolean flag `isNetworkSupported`.
 */
/**
 * Map of chain IDs to human-readable network names.
 */
const CHAIN_ID_TO_NAME: Record<number, string> = {
	1: "Ethereum",
	10: "Optimism",
	56: "BNB Smart Chain",
	137: "Polygon",
	8453: "Base",
	42161: "Arbitrum",
	43114: "Avalanche",
	324: "zkSync Era",
	59144: "Linea",
	534352: "Scroll",
};

export const useWithdrawalNetworkCheck = () => {
	const { primaryWallet } = useDynamicContext();
	const [isNetworkSupported, setIsNetworkSupported] = useState(true); // Default to true to prevent initial UI flicker
	const [supportedNetworks, setSupportedNetworks] = useState<number[]>([]);
	const supportedNetworksRef = useRef<number[]>([]);
	const hasFetchedRef = useRef(false);

	const checkNetworkSupport = useCallback(
		async (networks: number[]) => {
			try {
				if (!primaryWallet?.connector) {
					setIsNetworkSupported(false);
					return;
				}

				const networkId = await getNetwork(primaryWallet.connector);

				if (!networkId) {
					console.error("Failed to fetch network ID");
					setIsNetworkSupported(false);
					return;
				}

				setIsNetworkSupported(
					networks.includes(Number(networkId))
				);
			} catch (error) {
				console.error("Error checking network support:", error);
				setIsNetworkSupported(false);
			}
		},
		[primaryWallet]
	);

	// Fetch supported networks from the backend
	useEffect(() => {
		let cancelled = false;

		const fetchSupportedNetworks = async () => {
			try {
				const authToken = getAuthToken();
				const transactionService = TransactionService.getInstance();
				const response = await transactionService.fetchWithdrawNetworks(
					authToken || undefined
				);

				if (!cancelled && !response.error && response.data) {
					const networks = response.data.map(Number);
					supportedNetworksRef.current = networks;
					setSupportedNetworks(networks);
					hasFetchedRef.current = true;
					checkNetworkSupport(networks);
				}
			} catch (error) {
				console.error("Error fetching supported withdrawal networks:", error);
			}
		};

		fetchSupportedNetworks();

		return () => {
			cancelled = true;
		};
	}, [checkNetworkSupport]);

	// Listen for network changes
	useEffect(() => {
		const handleNetworkChange = () => {
			if (hasFetchedRef.current) {
				checkNetworkSupport(supportedNetworksRef.current);
			}
		};

		dynamicEvents.on("primaryWalletNetworkChanged", handleNetworkChange);

		return () => {
			dynamicEvents.off(
				"primaryWalletNetworkChanged",
				handleNetworkChange
			);
		};
	}, [checkNetworkSupport]);

	const supportedNetworkNames = supportedNetworks
		.map((id) => CHAIN_ID_TO_NAME[id] || `Chain ${id}`)
		.join(", ");

	return {
		isNetworkSupported,
		supportedNetworkNames,
	};
};
