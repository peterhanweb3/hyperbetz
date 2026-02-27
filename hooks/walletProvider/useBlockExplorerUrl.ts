"use client";

import { useState, useEffect, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAppStore } from "@/store/store";

/**
 * @hook useBlockExplorerUrl
 * @description Provides the block explorer base URL and helper functions
 * for the currently connected network. Fetches the explorer URL from the
 * Dynamic SDK's `primaryWallet.connector.getBlockExplorerUrlsForCurrentNetwork()`
 * and automatically re-fetches whenever the connected chain changes.
 *
 * @returns {Object} Block explorer utilities
 * @returns {string | null} blockExplorerUrl - The base explorer URL for the current network
 * @returns {boolean} isLoading - Whether the explorer URL is currently being fetched
 * @returns {Function} getTransactionUrl - Returns a full transaction URL for a given hash
 * @returns {Function} getAddressUrl - Returns a full address URL for a given address
 *
 * @example
 * ```tsx
 * const { getTransactionUrl, isLoading } = useBlockExplorerUrl();
 * const txUrl = getTransactionUrl("0xabc...");
 * // => "https://polygonscan.com/tx/0xabc..."
 * ```
 */
export const useBlockExplorerUrl = () => {
	const { primaryWallet } = useDynamicContext();
	const { chainId } = useAppStore((state) => state.blockchain.network);
	const [blockExplorerUrl, setBlockExplorerUrl] = useState<string | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * @description Re-fetch the explorer URL from the wallet connector
	 * whenever the primaryWallet reference or the chainId changes.
	 * This ensures we always have the correct explorer URL even after
	 * a network switch.
	 */
	useEffect(() => {
		let cancelled = false;

		const fetchExplorerUrl = async () => {
			if (!primaryWallet?.connector) {
				setBlockExplorerUrl(null);
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const urls =
					await primaryWallet.connector.getBlockExplorerUrlsForCurrentNetwork();
				if (!cancelled && urls && urls.length > 0) {
					// Remove trailing slash for consistency
					setBlockExplorerUrl(urls[0].replace(/\/+$/, ""));
				}
			} catch (error) {
				console.warn(
					"[useBlockExplorerUrl] Failed to fetch explorer URL:",
					error
				);
				if (!cancelled) {
					setBlockExplorerUrl(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		fetchExplorerUrl();

		return () => {
			cancelled = true;
		};
	}, [primaryWallet, chainId]);

	/**
	 * @function getTransactionUrl
	 * @description Builds a complete block explorer URL for a transaction hash.
	 * @param {string} transactionHash - The on-chain transaction hash
	 * @returns {string | null} Full URL to view the transaction, or null if unavailable
	 */
	const getTransactionUrl = useCallback(
		(transactionHash: string): string | null => {
			if (!transactionHash || !blockExplorerUrl) return null;
			return `${blockExplorerUrl}/tx/${transactionHash}`;
		},
		[blockExplorerUrl]
	);

	/**
	 * @function getAddressUrl
	 * @description Builds a complete block explorer URL for a wallet address.
	 * @param {string} address - The wallet or contract address
	 * @returns {string | null} Full URL to view the address, or null if unavailable
	 */
	const getAddressUrl = useCallback(
		(address: string): string | null => {
			if (!address || !blockExplorerUrl) return null;
			return `${blockExplorerUrl}/address/${address}`;
		},
		[blockExplorerUrl]
	);

	return {
		blockExplorerUrl,
		isLoading,
		getTransactionUrl,
		getAddressUrl,
	};
};
