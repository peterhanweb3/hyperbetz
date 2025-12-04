"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransactionModalTab } from "@/store/slices/ui/walletProvider/modal.slice";

export const useTransactionModal = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const {
		isTransactionModalOpen,
		activeTransactionModalTab,
		openTransactionModal,
		closeTransactionModal,
		setActiveTransactionModalTab,
	} = useAppStore((state) => state.uiDefinition.modal);

	// Effect 1: Sync URL to State on URL parameter changes
	useEffect(() => {
		const tabFromUrl = searchParams.get("tab") as TransactionModalTab;
		if (tabFromUrl) {
			setActiveTransactionModalTab(tabFromUrl);
			openTransactionModal(tabFromUrl);
		}
	}, [searchParams, setActiveTransactionModalTab, openTransactionModal]); // React to URL parameter changes

	// Effect 2: Sync State to URL on tab change
	useEffect(() => {
		const prevSearch = searchParams.toString();
		const currentParams = new URLSearchParams(prevSearch);
		if (isTransactionModalOpen) {
			currentParams.set("tab", activeTransactionModalTab);
		} else {
			currentParams.delete("tab");
		}
		const nextSearch = currentParams.toString();
		if (nextSearch === prevSearch) {
			return;
		}
		const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
		// Use replace to avoid polluting browser history, but only when query actually changes
		router.replace(nextUrl, { scroll: false });
	}, [
		isTransactionModalOpen,
		activeTransactionModalTab,
		pathname,
		router,
		searchParams,
	]);

	// Wrap closeModal to handle URL cleanup
	const handleCloseModal = () => {
		closeTransactionModal();
		// Create new URLSearchParams from current params
		const params = new URLSearchParams(searchParams.toString());
		// Remove the tab parameter
		params.delete("tab");
		// Update the URL without the tab parameter, keeping other params intact
		router.replace(
			`${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
			{ scroll: false }
		);
	};

	return {
		isOpen: isTransactionModalOpen,
		activeTab: activeTransactionModalTab,
		openModal: openTransactionModal,
		closeModal: handleCloseModal,
		setActiveTab: setActiveTransactionModalTab,
	};
};
