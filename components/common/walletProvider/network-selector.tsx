"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/store";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EvmNetwork, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faSpinner } from "@fortawesome/pro-light-svg-icons";
import Image from "next/image";

// Helper type to safely access evmNetworks from the generic connector
interface EvmWalletConnector {
	evmNetworks?: EvmNetwork[];
	[key: string]: unknown;
}

interface NetworkSelectorProps {
	className?: string;
	/** A callback that reports the network switching status to the parent. */
	onSwitchingChange?: (isSwitching: boolean) => void;
}

export const NetworkSelector = ({
	className,
	onSwitchingChange,
}: NetworkSelectorProps) => {
	const t = useTranslations("walletProvider.networkSelector");
	const { chainId, chainLogo, setChainLogo } = useAppStore(
		(state) => state.blockchain.network
	);
	const { primaryWallet } = useDynamicContext();

	const [isSwitching, setIsSwitching] = useState(false);
	const [switchSuccess, setSwitchSuccess] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [switchingOnChain, setSwitchingOnChain] = useState<number | null>(
		null
	);
	const [currentNetwork, setCurrentNetwork] = useState<EvmNetwork | null>(
		null
	);

	const connector = primaryWallet?.connector as
		| EvmWalletConnector
		| undefined;
	const supportedNetworks = connector?.evmNetworks || [];

	useEffect(() => {
		if (primaryWallet?.connector) {
			const connector =
				primaryWallet.connector as unknown as EvmWalletConnector;
			const currentNet = connector.evmNetworks?.find(
				(net: EvmNetwork) => net.chainId === chainId
			);
			setCurrentNetwork(currentNet || null);
		}
	}, [chainId, primaryWallet?.connector]);

	useEffect(() => {
		onSwitchingChange?.(isSwitching);
	}, [isSwitching, onSwitchingChange]);

	const handleNetworkChange = async (newChainIdStr: string) => {
		if (!primaryWallet) {
			toast.error(t("walletNotConnected"));
			return;
		}
		const newChainId = parseInt(newChainIdStr);
		// Prevent action if already on the selected network
		if (chainId === newChainId) return;

		// 1. Keep the record of the previous selected network.
		const previousNetwork = supportedNetworks.find(
			(net) => net.chainId === chainId
		);

		// Start the switching process
		setIsSwitching(true);
		setSwitchSuccess(false);
		setSwitchingOnChain(newChainId);

		// Optimistically update UI
		const newNetwork = supportedNetworks.find(
			(net) => net.chainId === newChainId
		);
		setCurrentNetwork(newNetwork || null);
		setChainLogo(newNetwork?.iconUrls?.[0] || "");

		try {
			await primaryWallet.connector.switchNetwork({
				networkChainId: newChainId,
			});
			// On success, show the checkmark. The global state will update separately.
			setSwitchSuccess(true);
		} catch (error) {
			console.error("Failed to switch network:", error);
			// toast.error(t("failedToSwitch"));

			// 2. If the code reaches the catch block, set the network to the previous selected network.
			if (previousNetwork) {
				setCurrentNetwork(previousNetwork);
				setChainLogo(previousNetwork.iconUrls?.[0] || "");
			}
			// Also set both loading states to false.
			setIsSwitching(false);
			setSwitchSuccess(false);
		} finally {
			// Ensure the loading states are always reset.
			// The timeout gives the success checkmark a moment to be visible.
			setTimeout(() => {
				setIsSwitching(false);
				setSwitchSuccess(false);
				setSwitchingOnChain(null);
			}, 1000);
		}
	};

	if (!primaryWallet?.connector) {
		return null;
	}

	return (
		<Select
			value={String(chainId)}
			onValueChange={handleNetworkChange}
			open={isDropdownOpen}
			onOpenChange={(open) => !isSwitching && setIsDropdownOpen(open)}
			disabled={isSwitching}
		>
			<SelectTrigger className={cn("w-[180px]", className)}>
				<SelectValue placeholder={t("placeholder")}>
					<div className="flex items-center gap-2">
						{chainLogo && (
							<Image
								src={chainLogo}
								alt={t("altLogo")}
								width={20}
								height={20}
								className="h-5 w-5 rounded-full object-cover"
								unoptimized
							/>
						)}
						<span className="flex-grow truncate">
							{currentNetwork?.vanityName ||
								currentNetwork?.name ||
								t("switching")}
						</span>
						{switchSuccess && (
							<FontAwesomeIcon
								icon={faCircleCheck}
								fontSize={16}
								className="text-green-500"
							/>
						)}
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{supportedNetworks.map((net) => (
					<SelectItem
						key={net.chainId}
						value={String(net.chainId)}
						disabled={isSwitching}
						className="!w-full !block"
					>
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center w-full gap-2">
								{net.iconUrls?.[0] && (
									<Image
										src={net.iconUrls[0]}
										alt={net.name}
										width={20}
										height={20}
										className="h-5 w-5 rounded-full object-cover"
										unoptimized
									/>
								)}
								<p>{net.vanityName || net.name}</p>
							</div>
							{isSwitching &&
								!switchSuccess &&
								net.chainId === switchingOnChain && (
									<FontAwesomeIcon
										icon={faSpinner}
										fontSize={16}
										className="animate-spin text-muted-foreground"
									/>
								)}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
