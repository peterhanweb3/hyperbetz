"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/store";
import favoritesService from "@/services/favoritesService";
import { Game } from "@/types/games/gameList.types";
import { GameCarouselSection } from "@/components/features/games/game-carousel-section";
import { ProviderCarouselSection } from "@/components/features/providers/provider-carousel-section";
import { QueryFilterDropdownWithSearch } from "@/components/features/query-display/query-filter-dropdown-with-search";
import { nanoid } from "nanoid";
// import { Search, Clock, Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMagnifyingGlass,
	faClock,
	faHeart,
	faGamepad,
	faTag,
	faBuilding,
} from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";
import { selectAllProviders } from "@/store/selectors/query/query.selectors";

// Types for search suggestions
type SearchSuggestion = {
	type: "game" | "category" | "provider";
	value: string;
	label: string;
	count?: number;
	description?: string;
};

type SearchModalProps = {
	open: boolean;
	onOpenChange: (next: boolean) => void;
};

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
	const allGamesRaw = useAppStore((s) => s.game.list.games);
	const allGames = useMemo(() => allGamesRaw || [], [allGamesRaw]);
	const allProviders = useAppStore(selectAllProviders);
	const [query, setQuery] = useState("");
	const [favoriteIds, setFavoriteIds] = useState<Array<number | string>>([]);
	const [recent, setRecent] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const suggestionsRef = useRef<HTMLDivElement | null>(null);

	const RECENT_KEY = "mw_recent_searches";

	// i18n - Move these before useMemo hooks that depend on them
	const tGames = useTranslations("games");
	const t = useTranslations("search");

	// Get unique categories from games
	const uniqueCategories = useMemo(() => {
		const categorySet = new Set<string>();
		allGames.forEach((game) => {
			if (game.category) {
				categorySet.add(game.category);
			}
		});
		return Array.from(categorySet).sort();
	}, [allGames]);

	// Provider filter options
	const providerFilterOptions = useMemo(() => {
		return allProviders.map((provider) => ({
			value: provider.name,
			label: provider.name,
			count: provider.count,
		}));
	}, [allProviders]);

	// Provider filter handlers
	const handleProviderToggle = (providerName: string) => {
		setSelectedProviders((prev) => {
			if (prev.includes(providerName)) {
				return prev.filter((p) => p !== providerName);
			} else {
				return [...prev, providerName];
			}
		});
	};

	const handleProviderClear = () => {
		setSelectedProviders([]);
	};

	// Generate search suggestions based on query
	const searchSuggestions = useMemo(() => {
		if (!query.trim()) return [];

		const q = query.toLowerCase();
		const suggestions: SearchSuggestion[] = [];

		// Add game suggestions
		const gameMatches = allGames
			.filter((game) => game.game_name.toLowerCase().includes(q))
			.slice(0, 5)
			.map((game) => ({
				type: "game" as const,
				value: game.game_name,
				label: game.game_name,
				description: `by ${game.provider_name}`,
			}));

		// Add category suggestions
		const categoryMatches = uniqueCategories
			.filter((category) => category.toLowerCase().includes(q))
			.slice(0, 3)
			.map((category) => ({
				type: "category" as const,
				value: category,
				label: category,
				description: t("suggestions.category"),
			}));

		// Add provider suggestions
		const providerMatches = allProviders
			.filter((provider) => provider.name.toLowerCase().includes(q))
			.slice(0, 3)
			.map((provider) => ({
				type: "provider" as const,
				value: provider.name,
				label: provider.name,
				count: provider.count,
				description: t("suggestions.provider"),
			}));

		suggestions.push(
			...gameMatches,
			...categoryMatches,
			...providerMatches
		);
		return suggestions.slice(0, 8); // Limit total suggestions
	}, [query, allGames, uniqueCategories, allProviders, t]);

	useEffect(() => {
		const load = () => setFavoriteIds(favoritesService.getAll());
		load();
		const off = favoritesService.onChange(load);
		return off;
	}, []);

	// Recent searches load/save
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = window.localStorage.getItem(RECENT_KEY);
			if (raw) setRecent(JSON.parse(raw));
		} catch {}
	}, []);

	const saveRecent = useCallback(
		(term: string) => {
			const t = term.trim();
			if (!t) return;
			const next = [
				t,
				...recent.filter((r) => r.toLowerCase() !== t.toLowerCase()),
			].slice(0, 6);
			setRecent(next);
			try {
				window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
			} catch {}
		},
		[recent]
	);

	const favoriteGames = useMemo(() => {
		if (!favoriteIds.length) return [] as Game[];
		const favSet = new Set(favoriteIds.map((id) => String(id)));
		return (allGames as Game[])
			.filter((g) => favSet.has(String(g.game_id)))
			.slice(0, 12);
	}, [favoriteIds, allGames]);

	const randomPicks = useMemo(() => {
		const pool = (allGames as Game[]).slice(0);
		for (let i = pool.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pool[i], pool[j]] = [pool[j], pool[i]];
		}
		return pool.slice(0, 12);
	}, [allGames]);

	// Handle input changes and suggestions
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		setShowSuggestions(value.trim().length > 0);
		setHighlightedIndex(-1); // Reset highlighted index when typing
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showSuggestions || searchSuggestions.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev < searchSuggestions.length - 1 ? prev + 1 : 0
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev > 0 ? prev - 1 : searchSuggestions.length - 1
				);
				break;
			case "Enter":
				e.preventDefault();
				if (
					highlightedIndex >= 0 &&
					highlightedIndex < searchSuggestions.length
				) {
					handleSuggestionSelect(searchSuggestions[highlightedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setShowSuggestions(false);
				setHighlightedIndex(-1);
				break;
		}
	};

	// Scroll highlighted item into view
	useEffect(() => {
		if (highlightedIndex >= 0 && suggestionsRef.current) {
			const highlightedElement = suggestionsRef.current.children[
				highlightedIndex
			] as HTMLElement;
			if (highlightedElement) {
				highlightedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [highlightedIndex]);

	// Handle suggestion selection
	const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
		setQuery(suggestion.value);
		setShowSuggestions(false);
		setHighlightedIndex(-1);
		saveRecent(suggestion.value);
	};

	// Handle clicks outside suggestions to close them
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
				setHighlightedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Enhanced search results that include games, categories, and providers
	const searchResults = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			// If no search query but providers are selected, show only selected providers
			if (selectedProviders.length > 0) {
				const filteredProviders = allProviders.filter((provider) =>
					selectedProviders.includes(provider.name)
				);
				return {
					games: [],
					categories: [],
					providers: filteredProviders,
				};
			}
			return { games: [], categories: [], providers: [] };
		}

		// Search games with provider filter applied
		let filteredGames = allGames.filter(
			(g) =>
				g.game_name.toLowerCase().includes(q) ||
				(g.provider_name || "").toLowerCase().includes(q) ||
				(g.category || "").toLowerCase().includes(q)
		);

		// Apply provider filter if any providers are selected
		if (selectedProviders.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				selectedProviders.includes(game.provider_name || "")
			);
		}

		const games = filteredGames.slice(0, 24);

		// Search categories
		const categories = uniqueCategories.filter((category) =>
			category.toLowerCase().includes(q)
		);

		// Search providers - show all matching providers for search,
		// but when displaying in carousel, we'll filter by selected ones
		let searchedProviders = allProviders.filter((provider) =>
			provider.name.toLowerCase().includes(q)
		);

		// If providers are selected, prioritize showing those in results
		if (selectedProviders.length > 0) {
			const selectedMatchingProviders = searchedProviders.filter(
				(provider) => selectedProviders.includes(provider.name)
			);
			const otherMatchingProviders = searchedProviders.filter(
				(provider) => !selectedProviders.includes(provider.name)
			);
			searchedProviders = [
				...selectedMatchingProviders,
				...otherMatchingProviders,
			].slice(0, 12);
		} else {
			searchedProviders = searchedProviders.slice(0, 12);
		}

		return { games, categories, providers: searchedProviders };
	}, [query, allGames, uniqueCategories, allProviders, selectedProviders]);

	// Providers to display in the carousel section
	const providersForCarousel = useMemo(() => {
		// If no query and no selected providers, show top providers as usual
		if (!query && selectedProviders.length === 0) {
			return undefined; // Let the component use its default store providers
		}

		// If providers are selected (with or without query), show only selected ones
		if (selectedProviders.length > 0) {
			return allProviders.filter((provider) =>
				selectedProviders.includes(provider.name)
			);
		}

		// If there's a query but no selected providers, show search results
		if (query) {
			return searchResults.providers;
		}

		return undefined;
	}, [query, selectedProviders, allProviders, searchResults.providers]);

	useEffect(() => {
		if (!open) {
			setQuery("");
			setShowSuggestions(false);
			setHighlightedIndex(-1);
			setSelectedProviders([]);
		}
		// autofocus input when opening
		if (open) setTimeout(() => inputRef.current?.focus(), 50);
	}, [open]);

	const popularSuggestions = [
		tGames("slots"),
		tGames("liveCasino"),
		tGames("sports"),
		t("gameTypes.blackjack"),
		t("gameTypes.roulette"),
		t("gameTypes.crash"),
	];

	const onChipClick = (val: string) => {
		setQuery(val);
		saveRecent(val);
	};

	const onClear = () => setQuery("");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-[90dvw] h-[90dvh] p-0 scrollbar-thin border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-2xl overflow-hidden flex flex-col">
				{/* Header with gradient */}
				<div className="relative p-5 border-b bg-gradient-to-r from-primary/10 via-accent/10 to-transparent flex-shrink-0">
					<div className="flex items-center gap-3">
						{/* <div className="p-2 rounded-lg bg-primary/15 text-primary">
							<FontAwesomeIcon
								icon={faMagnifyingGlass}
								className="w-4 h-4"
							/>
							<ProviderCarouselSection
							  title={
							    selectedProviders.length > 0
							      ? `${t(
							          "sections.selectedProviders"
							        )} (${selectedProviders.length})`
							      : t("sections.topProviders")
							  }
							  viewAllUrl="/providers"
							  maxProviders={12}
							  Icon={faBuilding}
							  firstRowFilter="all"
							  secondRowFilter="all"
							  providers={providersForCarousel}
							/>
						</div> */}
						<div>
							<div className="font-semibold">{t("title")}</div>
							<div className="text-xs text-muted-foreground">
								{t("subtitle")}
							</div>
						</div>
					</div>
					<div className="mt-4 relative">
						{/* Search Input and Provider Filter Row */}
						<div className="flex gap-3">
							{/* Search Input - Takes more space */}
							<div className="flex-1 relative">
								<Input
									ref={inputRef}
									placeholder={t("placeholder")}
									value={query}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									onFocus={() =>
										setShowSuggestions(
											query.trim().length > 0
										)
									}
									className="h-11 pl-10"
								/>
								<FontAwesomeIcon
									icon={faMagnifyingGlass}
									className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
								/>
								{query && (
									<Button
										size="sm"
										variant="ghost"
										className="absolute right-2 top-1/2 -translate-y-1/2"
										onClick={onClear}
									>
										{t("clear")}
									</Button>
								)}
							</div>

							{/* Provider Filter - Takes less space */}
							<div className="flex-shrink-0 w-auto min-w-[200px]">
								<QueryFilterDropdownWithSearch
									options={providerFilterOptions}
									activeValues={selectedProviders}
									onToggle={handleProviderToggle}
									onClear={handleProviderClear}
									className="!w-full"
								/>
							</div>
						</div>

						{/* Search Suggestions Dropdown */}
						{showSuggestions && searchSuggestions.length > 0 && (
							<div
								ref={suggestionsRef}
								className="absolute top-full left-0 right-0 mt-1 scrollbar-thin bg-card/80 backdrop-blur-2xl border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
								style={{ width: "calc(100% - 212px)" }} // Adjust width to match search input only
							>
								{searchSuggestions.map((suggestion, index) => (
									<button
										key={`${suggestion.type}-${
											suggestion.value
										}-${index}-${nanoid()}`}
										className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
											index === highlightedIndex
												? "bg-primary/10 border-l-2 border-primary"
												: "hover:bg-muted/50"
										}`}
										onClick={() =>
											handleSuggestionSelect(suggestion)
										}
										onMouseEnter={() =>
											setHighlightedIndex(index)
										}
									>
										<div className="flex-shrink-0">
											<FontAwesomeIcon
												icon={
													suggestion.type === "game"
														? faGamepad
														: suggestion.type ===
														  "category"
														? faTag
														: faBuilding
												}
												className="w-4 h-4 text-muted-foreground"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium truncate">
												{suggestion.label}
											</div>
											<div className="text-xs text-muted-foreground">
												{suggestion.description}
												{suggestion.count &&
													` • ${suggestion.count} games`}
											</div>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Body */}
				<div className="flex-1 p-5 space-y-8 overflow-y-auto">
					{/* Inline chips row: recent + popular */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2">
						{recent.length > 0 && (
							<>
								<span className="text-xs text-muted-foreground flex items-center gap-1">
									<FontAwesomeIcon
										icon={faClock}
										className="w-3 h-3"
									/>{" "}
									{t("recent")}
								</span>
								{recent.map((s) => (
									<span
										key={s + nanoid()}
										className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full border whitespace-nowrap"
									>
										<button
											onClick={() => onChipClick(s)}
											className="hover:underline"
										>
											{s}
										</button>
										<button
											aria-label={`remove ${s}`}
											className="text-muted-foreground hover:text-foreground"
											onClick={() => {
												const next = recent.filter(
													(r) => r !== s
												);
												setRecent(next);
												try {
													window.localStorage.setItem(
														RECENT_KEY,
														JSON.stringify(next)
													);
												} catch {}
											}}
										>
											×
										</button>
									</span>
								))}
								<span className="text-xs text-muted-foreground ml-2">
									{t("popular")}
								</span>
							</>
						)}
						{popularSuggestions.map((s) => (
							<Button
								key={s + nanoid()}
								size="sm"
								variant="outline"
								onClick={() => onChipClick(s)}
								className="whitespace-nowrap"
							>
								{s}
							</Button>
						))}
					</div>

					{/* Content sections */}
					<div className="space-y-10">
						{!query && (
							<div className="space-y-10">
								{favoriteGames.length > 0 && (
									<GameCarouselSection
										title={t("favoritesTry")}
										showTitle
										showViewAll={true}
										games={favoriteGames}
										icon={faHeart}
										onViewAllClick={() =>
											onOpenChange(false)
										}
									/>
								)}
								<GameCarouselSection
									title={t("hotPicks")}
									showTitle
									showViewAll={true}
									games={randomPicks}
									onViewAllClick={() => onOpenChange(false)}
								/>

								{/* Providers Section - Show filtered providers if any are selected */}
								<ProviderCarouselSection
									title={
										selectedProviders.length > 0
											? `${t(
													"sections.selectedProviders"
											  )} (${selectedProviders.length})`
											: t("sections.topProviders")
									}
									viewAllUrl="/providers"
									maxProviders={12}
									Icon={faBuilding}
									firstRowFilter="live casino"
									secondRowFilter="slot"
									providers={providersForCarousel}
									onViewAllClick={() => onOpenChange(false)}
								/>
							</div>
						)}

						{query && (
							<div className="space-y-6">
								{/* Search Results Summary */}
								<div className="flex flex-col gap-2">
									<div className="text-sm text-muted-foreground">
										{t("results.found", {
											games: searchResults.games.length,
											categories:
												searchResults.categories.length,
											providers:
												searchResults.providers.length,
										})}
									</div>
									{selectedProviders.length > 0 && (
										<div className="text-xs text-primary">
											{t("filterApplied", {
												count: selectedProviders.length,
											})}
										</div>
									)}
								</div>

								{/* Categories Results */}
								{searchResults.categories.length > 0 && (
									<div className="space-y-4">
										<div className="flex items-center gap-2">
											<FontAwesomeIcon
												icon={faTag}
												className="w-5 h-5 text-primary"
											/>
											<h3 className="text-lg font-semibold">
												{t("sections.categories")} (
												{
													searchResults.categories
														.length
												}
												)
											</h3>
										</div>
										<div className="flex flex-wrap gap-2">
											{searchResults.categories.map(
												(category) => (
													<Button
														key={category}
														variant="outline"
														size="sm"
														onClick={() =>
															onChipClick(
																category
															)
														}
														className="flex items-center gap-2"
													>
														<FontAwesomeIcon
															icon={faTag}
															className="w-3 h-3"
														/>
														{category}
													</Button>
												)
											)}
										</div>
									</div>
								)}

								{/* Games Results */}
								{searchResults.games.length > 0 && (
									<div className="space-y-4">
										<div className="space-y-2">
											<GameCarouselSection
												title={`${t(
													"sections.games"
												)} (${
													searchResults.games.length
												})`}
												icon={faGamepad}
												showTitle
												showViewAll={true}
												games={searchResults.games}
												viewAllUrl={`/games?q=${encodeURIComponent(
													query.toLowerCase()
												)}`}
												onViewAllClick={() =>
													onOpenChange(false)
												}
											/>
										</div>
									</div>
								)}

								{/* Providers Results */}
								{searchResults.providers.length > 0 && (
									<div className="space-y-4">
										<ProviderCarouselSection
											title={`${t(
												"sections.providers"
											)} (${
												searchResults.providers.length
											})`}
											viewAllUrl="/providers"
											maxProviders={
												searchResults.providers.length
											}
											Icon={faBuilding}
											firstRowFilter="live casino"
											secondRowFilter="slot"
											providers={searchResults.providers}
										/>
									</div>
								)}

								{/* No Results */}
								{searchResults.games.length === 0 &&
									searchResults.categories.length === 0 &&
									searchResults.providers.length === 0 && (
										<div className="text-center py-10">
											<div className="text-muted-foreground mb-2">
												<FontAwesomeIcon
													icon={faMagnifyingGlass}
													className="w-8 h-8 mx-auto mb-2"
												/>
											</div>
											<div className="text-sm text-muted-foreground">
												{t("noResults")}
											</div>
										</div>
									)}
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
