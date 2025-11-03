"use client";

import * as React from "react";
import {
	Search,
	Smile,
	ImageIcon,
	TrendingUp,
	Heart,
	Zap,
	Coffee,
	GamepadIcon,
	Star,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GifService, type GifResult } from "@/services/gifService";
import { EmojiService, type EmojiCategory } from "@/services/emojiService";
import { useTranslations } from "@/lib/locale-provider";

// GIF search categories
import Image from "next/image";
const gifCategories = [
	{ key: "trending", query: "trending", icon: TrendingUp },
	{ key: "reactions", query: "reaction funny", icon: Heart },
	{ key: "gaming", query: "gaming win celebration", icon: GamepadIcon },
	{ key: "casino", query: "casino jackpot money win", icon: Star },
	{ key: "celebration", query: "celebration party happy", icon: Zap },
	{ key: "sports", query: "sports victory goal", icon: Coffee },
];

interface EmojiGifPickerProps {
	onEmojiSelect: (emoji: string) => void;
	onGifSelect?: (gif: { url: string; title: string }) => void;
	enableGifs?: boolean;
}

export function EmojiGifPicker({
	onEmojiSelect,
	onGifSelect,
	enableGifs = true,
}: EmojiGifPickerProps) {
	const t = useTranslations("chat");
	const [searchQuery, setSearchQuery] = React.useState("");
	const [activeTab, setActiveTab] = React.useState<"emojis" | "gifs">(
		"emojis"
	);
	const [recentEmojis, setRecentEmojis] = React.useState<string[]>([
		"😀",
		"😂",
		"❤️",
		"👍",
		"🔥",
		"💯",
		"😍",
		"🎉",
	]);

	// Emoji states
	const [emojiCategories, setEmojiCategories] = React.useState<
		EmojiCategory[]
	>([]);
	const [emojiLoading, setEmojiLoading] = React.useState(false);
	const [emojiError, setEmojiError] = React.useState<string | null>(null);

	// GIF states
	const [gifs, setGifs] = React.useState<GifResult[]>([]);
	const [gifLoading, setGifLoading] = React.useState(false);
	const [gifError, setGifError] = React.useState<string | null>(null);
	const [activeGifCategory, setActiveGifCategory] =
		React.useState("trending");

	// Services
	const gifService = React.useMemo(() => {
		if (!enableGifs) {
			return null;
		}
		return GifService.getInstance();
	}, [enableGifs]);
	const emojiService = React.useMemo(() => EmojiService.getInstance(), []);

	// Load emojis
	const loadEmojis = React.useCallback(async () => {
		setEmojiLoading(true);
		setEmojiError(null);

		try {
			const categories = await emojiService.getAllEmojis();
			setEmojiCategories(categories);
		} catch (error) {
			console.error("Error loading emojis:", error);
			setEmojiError(t("picker.errors.emojisLoad"));
		} finally {
			setEmojiLoading(false);
		}
	}, [emojiService, t]);

	// Search emojis
	const searchEmojis = React.useCallback(
		async (query: string) => {
			if (!query.trim()) {
				loadEmojis();
				return;
			}

			setEmojiLoading(true);
			setEmojiError(null);

			try {
				const results = await emojiService.searchEmojis(query);
				setEmojiCategories([
					{
						name: t("picker.searchResults"),
						group: "search",
						icon: "🔍",
						emojis: results,
					},
				]);
			} catch (error) {
				console.error("Error searching emojis:", error);
				setEmojiError(t("picker.errors.emojisSearch"));
			} finally {
				setEmojiLoading(false);
			}
		},
		[emojiService, loadEmojis, t]
	);

	// Load GIFs
	const loadGifs = React.useCallback(
		async (query: string = "trending") => {
			if (!enableGifs || !gifService) {
				return;
			}
			setGifLoading(true);
			setGifError(null);

			try {
				const results = await gifService.searchGifs(query, 20);
				setGifs(results);
			} catch (error) {
				console.error("Error loading GIFs:", error);
				setGifError(t("picker.errors.gifsLoad"));
			} finally {
				setGifLoading(false);
			}
		},
		[enableGifs, gifService, t]
	);
	// Initialize data
	React.useEffect(() => {
		loadEmojis();
		if (enableGifs) {
			loadGifs("trending");
		}
	}, [enableGifs, loadEmojis, loadGifs]);

	// Handle search with debouncing
	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (activeTab === "emojis") {
				searchEmojis(searchQuery);
			} else if (enableGifs) {
				loadGifs(searchQuery || "trending");
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, activeTab, searchEmojis, loadGifs, enableGifs]);

	React.useEffect(() => {
		if (!enableGifs && activeTab === "gifs") {
			setActiveTab("emojis");
		}
	}, [enableGifs, activeTab]);

	// Load recent emojis from localStorage
	React.useEffect(() => {
		try {
			const saved = localStorage.getItem("chat-recent-emojis");
			if (saved) {
				setRecentEmojis(JSON.parse(saved));
			}
		} catch (error) {
			console.error("Failed to load recent emojis:", error);
		}
	}, []);

	const handleEmojiClick = (emoji: string) => {
		onEmojiSelect(emoji);

		// Update recent emojis
		setRecentEmojis((prev) => {
			const updated = [emoji, ...prev.filter((e) => e !== emoji)].slice(
				0,
				8
			);
			// Store in localStorage for persistence
			try {
				localStorage.setItem(
					"chat-recent-emojis",
					JSON.stringify(updated)
				);
			} catch (error) {
				console.error("Failed to save recent emojis:", error);
			}
			return updated;
		});
	};

	const handleGifClick = (gif: GifResult) => {
		if (!onGifSelect) return;
		onGifSelect({
			url: gif.url,
			title: gif.title,
		});
	};

	const handleGifCategoryClick = (key: string) => {
		if (!enableGifs) return;
		setActiveGifCategory(key.toLowerCase());
		const categoryData = gifCategories.find((c) => c.key === key);
		if (categoryData) {
			loadGifs(categoryData.query);
		}
	};

	const handleTabChange = (value: string) => {
		if (value === "gifs" && !enableGifs) {
			return;
		}
		setActiveTab(value as "emojis" | "gifs");
	};

	return (
		<div
			className="w-96 h-96 bg-card border border-sidebar-border rounded-lg 
                  flex flex-col backdrop-blur-xl shadow-2xl casino-picker
                  relative overflow-hidden"
		>
			{/* Background gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 pointer-events-none" />

			{/* Header with search */}
			<div className="p-3 border-b border-sidebar-border bg-background/50 backdrop-blur-sm relative z-10">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={
							activeTab === "emojis"
								? t("picker.searchEmojis")
								: t("picker.searchGifs")
						}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 bg-input border-sidebar-border text-foreground 
                     placeholder:text-muted-foreground casino-input
                     focus:ring-2 focus:ring-primary/50"
					/>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="flex-1 flex flex-col relative z-10"
			>
				<TabsList
					className={`grid w-full ${
						enableGifs ? "grid-cols-2" : "grid-cols-1"
					} bg-card border-b border-sidebar-border 
	                          backdrop-blur-sm rounded-none`}
				>
					<TabsTrigger
						value="emojis"
						className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary
                     hover:bg-primary/10 transition-all duration-200"
					>
						<Smile className="h-4 w-4 mr-2" />
						{t("picker.tabs.emojis")}
					</TabsTrigger>
					{enableGifs && (
						<TabsTrigger
							value="gifs"
							className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary
	                     hover:bg-primary/10 transition-all duration-200"
						>
							<ImageIcon className="h-4 w-4 mr-2" />
							{t("picker.tabs.gifs")}
						</TabsTrigger>
					)}
				</TabsList>

				{/* Emoji Tab */}
				<TabsContent
					value="emojis"
					className="flex-1 flex flex-col mt-0"
				>
					{emojiLoading ? (
						<div className="flex-1 flex items-center justify-center">
							<Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
							<span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
								{t("picker.loadingEmojis")}
							</span>
						</div>
					) : emojiError ? (
						<div className="flex-1 flex items-center justify-center text-center p-4">
							<div>
								<p className="text-sm text-destructive mb-2">
									{emojiError}
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={loadEmojis}
									className="text-[hsl(var(--foreground))]"
								>
									{t("picker.retry")}
								</Button>
							</div>
						</div>
					) : (
						<ScrollArea className="flex-1 h-64 max-h-64 overflow-y-auto casino-scrollbar">
							<div className="p-3 space-y-4">
								{/* Recent Emojis */}
								{recentEmojis.length > 0 && !searchQuery && (
									<div className="mb-4">
										<div className="flex items-center gap-2 mb-2 sticky top-0 bg-card/90 backdrop-blur-sm py-1 z-10">
											<span className="text-sm">🕒</span>
											<span className="text-sm font-medium text-foreground">
												{t("picker.recent")}
											</span>
										</div>
										<div className="grid grid-cols-8 gap-1">
											{recentEmojis.map(
												(emoji, index) => (
													<button
														key={`recent-${index}`}
														onClick={() =>
															handleEmojiClick(
																emoji
															)
														}
														className="p-2 hover:bg-muted/50 rounded text-lg transition-all duration-200 aspect-square flex items-center justify-center hover:scale-110"
														title={emoji}
													>
														{emoji}
													</button>
												)
											)}
										</div>
									</div>
								)}

								{/* Emoji Categories */}
								{emojiCategories.map((category) => (
									<div key={category.group} className="mb-4">
										<div className="flex items-center gap-2 mb-2 sticky top-0 bg-[hsl(var(--popover))] py-1">
											<span className="text-sm">
												{category.icon}
											</span>
											<span className="text-sm font-medium text-[hsl(var(--foreground))]">
												{category.name}
											</span>
											<span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
												{category.emojis.length}
											</span>
										</div>
										<div className="grid grid-cols-8 gap-1">
											{category.emojis.map(
												(emoji, index) => (
													<button
														key={`${category.group}-${index}`}
														onClick={() =>
															handleEmojiClick(
																emoji.character
															)
														}
														className="p-2 hover:bg-muted/50 rounded text-lg transition-all duration-200 aspect-square flex items-center justify-center hover:scale-110"
														title={emoji.name}
													>
														{emoji.character}
													</button>
												)
											)}
										</div>
									</div>
								))}

								{emojiCategories.length === 0 &&
									!emojiLoading && (
										<div className="text-center py-8">
											<Smile className="h-12 w-12 mx-auto mb-4 opacity-50 text-[hsl(var(--muted-foreground))]" />
											<p className="text-[hsl(var(--muted-foreground))]">
												{t("picker.noEmojis")}
											</p>
										</div>
									)}
							</div>
						</ScrollArea>
					)}
				</TabsContent>

				{/* GIF Tab */}
				{enableGifs && (
					<TabsContent
						value="gifs"
						className="flex-1 flex flex-col mt-0"
					>
						{/* GIF Categories */}
						{!searchQuery && (
							<div className="p-2 border-b border-[hsl(var(--border))]">
								<div className="flex gap-1 overflow-x-auto">
									{gifCategories.map((category) => (
										<Button
											key={category.key}
											variant={
												activeGifCategory ===
												category.key
													? "default"
													: "ghost"
											}
											size="sm"
											onClick={() =>
												handleGifCategoryClick(
													category.key
												)
											}
											className="flex-shrink-0 text-xs"
										>
											<category.icon className="h-3 w-3 mr-1" />
											{t(
												`picker.gifCategories.${category.key}`
											)}
										</Button>
									))}
								</div>
							</div>
						)}

						{gifLoading ? (
							<div className="flex-1 flex items-center justify-center">
								<Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
								<span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
									{t("picker.loadingGifs")}
								</span>
							</div>
						) : gifError ? (
							<div className="flex-1 flex items-center justify-center text-center p-4">
								<div>
									<p className="text-sm text-destructive mb-2">
										{gifError}
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											loadGifs(activeGifCategory)
										}
										className="text-[hsl(var(--foreground))]"
									>
										{t("picker.retry")}
									</Button>
								</div>
							</div>
						) : (
							<ScrollArea className="flex-1 h-64 max-h-64 overflow-y-auto casino-scrollbar">
								<div className="p-3">
									<div className="grid grid-cols-2 gap-2">
										{gifs.map((gif) => (
											<button
												key={gif.id}
												onClick={() =>
													handleGifClick(gif)
												}
												className="relative h-24 group rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-200 hover:scale-[1.02]"
											>
												<Image
													src={
														gif.previewUrl ||
														"/placeholder.svg"
													}
													alt={gif.title}
													fill
													sizes="(max-width: 768px) 50vw, 200px"
													className="object-cover"
													unoptimized
													onError={(event) => {
														const target =
															event.currentTarget;
														if (
															target.src !==
															gif.url
														) {
															target.src =
																gif.url;
														}
													}}
												/>
												<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
													<span className="text-white text-xs font-medium text-center px-2 line-clamp-2">
														{gif.title}
													</span>
												</div>
											</button>
										))}
									</div>

									{gifs.length === 0 && !gifLoading && (
										<div className="text-center py-8">
											<ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-[hsl(var(--muted-foreground))]" />
											<p className="text-[hsl(var(--muted-foreground))]">
												{t("picker.noGifs")}
											</p>
											<p className="text-sm text-[hsl(var(--muted-foreground))]/70">
												{t("picker.tryDifferent")}
											</p>
										</div>
									)}
								</div>
							</ScrollArea>
						)}
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
