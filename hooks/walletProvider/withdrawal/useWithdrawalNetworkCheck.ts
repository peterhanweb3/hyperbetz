"use client";

import { useState, useEffect } from "react";
import {
	useDynamicContext,
	dynamicEvents,
	getNetwork,
} from "@dynamic-labs/sdk-react-core";

/**
 * An array of chain IDs where withdrawal functionality is supported.
 */
export const SUPPORTED_WITHDRAWAL_NETWORKS: number[] = [42161, 137, 56,10];

/**
 * A specialized, self-contained hook that actively listens for network changes
 * and determines if the current network is supported for withdrawals.
 *
 * This hook is a faithful and robust implementation of the original reference logic.
 *
 * @returns An object containing a boolean flag `isNetworkSupported`.
 */
export const useWithdrawalNetworkCheck = () => {
	const { primaryWallet } = useDynamicContext();
	const [isNetworkSupported, setIsNetworkSupported] = useState(true); // Default to true to prevent initial UI flicker

	useEffect(() => {
		// This is the core logic, directly translated from your reference code.
		const checkNetworkSupport = async () => {
			try {
				if (!primaryWallet?.connector) {
					// If there's no wallet, we can consider it unsupported for now.
					setIsNetworkSupported(false);
					return;
				}

				const networkId = await getNetwork(primaryWallet.connector);

				if (!networkId) {
					console.error("Failed to fetch network ID");
					setIsNetworkSupported(false);
					return;
				}

				// The check is now against our centralized configuration.
				setIsNetworkSupported(
					SUPPORTED_WITHDRAWAL_NETWORKS.includes(Number(networkId))
				);
			} catch (error) {
				console.error("Error checking network support:", error);
				setIsNetworkSupported(false);
			}
		};

		// --- Lifecycle Management ---

		// 1. Initial check when the wallet is available.
		checkNetworkSupport();

		// 2. Set up the event listener to react to network changes in real-time.
		const handleNetworkChange = () => {
			checkNetworkSupport();
		};

		dynamicEvents.on("primaryWalletNetworkChanged", handleNetworkChange);

		// 3. The crucial cleanup function to prevent memory leaks.
		return () => {
			dynamicEvents.off(
				"primaryWalletNetworkChanged",
				handleNetworkChange
			);
		};

		// This effect correctly re-runs only when the primary wallet object itself changes.
	}, [primaryWallet]);

	return {
		isNetworkSupported,
	};
};
