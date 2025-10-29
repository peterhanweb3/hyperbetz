"use client";

import { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

/**
 * Hook to get the block explorer URL for the current network
 * Returns the appropriate explorer URL based on the user's current network
 * Falls back to Polygon scan if unable to determine the network
 */
export const useBlockExplorerUrl = () => {
	const { primaryWallet } = useDynamicContext();
	const [blockExplorerUrl, setBlockExplorerUrl] = useState<string | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getBlockExplorerUrl = async () => {
			if (primaryWallet?.connector) {
				try {
					setIsLoading(true);
					const urls =
						await primaryWallet.connector.getBlockExplorerUrlsForCurrentNetwork();
					if (urls && urls.length > 0) {
						setBlockExplorerUrl(urls[0]);
					} else {
						// Fallback to Polygon scan if no URLs found
						setBlockExplorerUrl("https://polygonscan.com");
					}
				} catch (error) {
					console.error("Failed to get block explorer URL:", error);
					// Fallback to Polygon scan if unable to get dynamic URL
					setBlockExplorerUrl("https://polygonscan.com");
				} finally {
					setIsLoading(false);
				}
			} else {
				// No wallet connected, use default
				setBlockExplorerUrl("https://polygonscan.com");
				setIsLoading(false);
			}
		};

		getBlockExplorerUrl();
	}, [primaryWallet]);

	/**
	 * Helper function to get a complete transaction URL
	 * @param transactionHash - The transaction hash to create URL for
	 * @returns Complete URL to view transaction on block explorer
	 */
	const getTransactionUrl = (transactionHash: string) => {
		if (!blockExplorerUrl || !transactionHash) return null;
		return `${blockExplorerUrl}/tx/${transactionHash}`;
	};

	/**
	 * Helper function to get a complete address URL
	 * @param address - The address to create URL for
	 * @returns Complete URL to view address on block explorer
	 */
	const getAddressUrl = (address: string) => {
		if (!blockExplorerUrl || !address) return null;
		return `${blockExplorerUrl}address/${address}`;
	};

	return {
		blockExplorerUrl,
		isLoading,
		getTransactionUrl,
		getAddressUrl,
	};
};
