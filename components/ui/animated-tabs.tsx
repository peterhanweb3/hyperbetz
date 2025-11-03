"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedTabsProps {
	defaultValue?: string;
	value?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	children: React.ReactNode;
}

interface TabsListProps {
	className?: string;
	children: React.ReactNode;
}

interface TabsTriggerProps {
	value: string;
	className?: string;
	children: React.ReactNode;
}

interface TabsContentProps {
	value: string;
	className?: string;
	children: React.ReactNode;
}

// Removed registerTab and unregisterTab from the context
const AnimatedTabsContext = React.createContext<{
	activeTab: string;
	setActiveTab: (value: string) => void;
} | null>(null);

function AnimatedTabs({
	defaultValue = "",
	value,
	onValueChange,
	className,
	children,
}: AnimatedTabsProps) {
	const [internalActiveTab, setInternalActiveTab] =
		React.useState(defaultValue);
	// Use the controlled `value` prop if provided, otherwise use internal state.
	const activeTab = value !== undefined ? value : internalActiveTab;

	const handleTabChange = React.useCallback(
		(newValue: string) => {
			// If not a controlled component, update internal state
			if (value === undefined) {
				setInternalActiveTab(newValue);
			}
			// Always call the onValueChange callback if it exists
			onValueChange?.(newValue);
		},
		[onValueChange, value]
	);

	// This useEffect is no longer needed as the logic is handled by the activeTab derivation
	// React.useEffect(() => {
	// 	if (value !== undefined) {
	// 		setActiveTab(value);
	// 	}
	// }, [value]);

	// Removed the unused registerTab and unregisterTab functions

	return (
		// Pass the corrected value to the provider
		<AnimatedTabsContext.Provider
			value={{
				activeTab,
				setActiveTab: handleTabChange,
			}}
		>
			<div className={cn("flex flex-col gap-2", className)}>
				{children}
			</div>
		</AnimatedTabsContext.Provider>
	);
}

function AnimatedTabsList({ className, children }: TabsListProps) {
	const context = React.useContext(AnimatedTabsContext);

	if (!context) {
		throw new Error("AnimatedTabsList must be used within AnimatedTabs");
	}

	const { activeTab } = context;
	const [indicatorStyle, setIndicatorStyle] = React.useState({
		width: 0,
		left: 0,
	});
	const listRef = React.useRef<HTMLDivElement>(null);
	const [isInitialized, setIsInitialized] = React.useState(false);

	React.useEffect(() => {
		const updateIndicator = () => {
			if (!listRef.current) return;

			const activeElement = listRef.current.querySelector(
				`[data-value="${activeTab}"]`
			) as HTMLElement;
			if (activeElement) {
				const listRect = listRef.current.getBoundingClientRect();
				const activeRect = activeElement.getBoundingClientRect();

				setIndicatorStyle({
					width: activeRect.width,
					left: activeRect.left - listRect.left,
				});
				setIsInitialized(true);
			}
		};

		// Use requestAnimationFrame to ensure DOM is ready
		const rafId = requestAnimationFrame(() => {
			updateIndicator();
		});

		// Update on resize
		window.addEventListener("resize", updateIndicator);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("resize", updateIndicator);
		};
	}, [activeTab, children]); // Add children to deps to recalc on language change

	return (
		<div
			ref={listRef}
			className={cn(
				"relative inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
				className
			)}
		>
			{/* Sliding indicator - only show after initialization to prevent flash */}
			{isInitialized && (
				<div
					className="absolute h-8 rounded-md shadow-sm transition-all duration-300 ease-out bg-background border border-border"
					style={{
						width: indicatorStyle.width,
						transform: `translateX(${indicatorStyle.left}px)`,
					}}
				/>
			)}
			{children}
		</div>
	);
}

function AnimatedTabsTrigger({ value, className, children }: TabsTriggerProps) {
	const context = React.useContext(AnimatedTabsContext);

	if (!context) {
		throw new Error("AnimatedTabsTrigger must be used within AnimatedTabs");
	}

	// Removed unused registerTab and unregisterTab from destructuring
	const { activeTab, setActiveTab } = context;
	const isActive = activeTab === value;

	// Removed the unused useEffect block that called registerTab and unregisterTab

	return (
		<button
			data-value={value}
			className={cn(
				"relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
				isActive
					? "text-foreground"
					: "text-muted-foreground hover:text-foreground",
				className
			)}
			onClick={() => setActiveTab(value)}
		>
			{children}
		</button>
	);
}

function AnimatedTabsContent({ value, className, children }: TabsContentProps) {
	const context = React.useContext(AnimatedTabsContext);

	if (!context) {
		throw new Error("AnimatedTabsContent must be used within AnimatedTabs");
	}

	const { activeTab } = context;

	if (activeTab !== value) {
		return null;
	}

	return (
		<div
			className={cn(
				"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className
			)}
		>
			{children}
		</div>
	);
}

export {
	AnimatedTabs,
	AnimatedTabsList,
	AnimatedTabsTrigger,
	AnimatedTabsContent,
};
