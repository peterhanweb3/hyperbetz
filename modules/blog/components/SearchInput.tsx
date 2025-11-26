"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTransition, useEffect, useState, useRef, useCallback } from "react";

export function SearchInput({
	placeholder = "Search...",
}: {
	placeholder?: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [searchValue, setSearchValue] = useState(
		searchParams.get("search") || ""
	);
	const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		setSearchValue(searchParams.get("search") || "");
	}, [searchParams]);

	const debouncedSearch = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (value) {
				params.set("search", value);
			} else {
				params.delete("search");
			}

			// Reset to page 1 when searching
			params.delete("page");

			startTransition(() => {
				router.replace(`?${params.toString()}`, { scroll: false });
			});
		},
		[searchParams, router]
	);

	const handleSearch = (value: string) => {
		setSearchValue(value);

		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Debounce the actual search by 300ms
		debounceTimerRef.current = setTimeout(() => {
			debouncedSearch(value);
		}, 300);
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	return (
		<div className="relative flex-1">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder={placeholder}
				className="w-full pl-9 md:w-[350px]"
				value={searchValue}
				onChange={(e) => handleSearch(e.target.value)}
				disabled={isPending}
			/>
		</div>
	);
}
