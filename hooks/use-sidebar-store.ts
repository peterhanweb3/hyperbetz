"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
	isOpen: boolean;
	isMobile: boolean;
	setOpen: (open: boolean) => void;
	setIsMobile: (mobile: boolean) => void;
	toggle: () => void;
}

// Create a persistent store for sidebar state that survives route changes
export const useSidebarStore = create<SidebarStore>()(
	persist(
		(set) => ({
			isOpen: true, // Default to open
			isMobile: false,
			setOpen: (open: boolean) => set({ isOpen: open }),
			setIsMobile: (mobile: boolean) => set({ isMobile: mobile }),
			toggle: () => set((state) => ({ isOpen: !state.isOpen })),
		}),
		{
			name: "sidebar-storage", // Key for localStorage
			partialize: (state) => ({ isOpen: state.isOpen }), // Only persist isOpen state
		}
	)
);
