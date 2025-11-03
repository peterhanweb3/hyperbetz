/**
 * Wallet Context
 * Manages wallet connection state
 * Changes occasionally - when wallet connects/disconnects or network changes
 */

import {
	createContext,
	useContext,
	useMemo,
	ReactNode,
} from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface WalletContextType {
	isWalletConnected: boolean;
	walletAddress: string | null;
	chainId: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
	const { primaryWallet } = useDynamicContext();

	const value = useMemo(
		() => ({
			isWalletConnected: !!primaryWallet,
			walletAddress: primaryWallet?.address || null,
			chainId: primaryWallet?.chain ? parseInt(primaryWallet.chain) : null,
		}),
		[primaryWallet]
	);

	return (
		<WalletContext.Provider value={value}>
			{children}
		</WalletContext.Provider>
	);
};

export const useWallet = (): WalletContextType => {
	const context = useContext(WalletContext);
	if (context === undefined) {
		throw new Error("useWallet must be used within WalletProvider");
	}
	return context;
};
