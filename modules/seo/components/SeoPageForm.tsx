"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { createSeoPage, updateSeoPage } from "@/modules/seo/actions";
import { RichTextEditor } from "@/modules/blog/components/RichTextEditor";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/store";
import {
	getGamesByCategory,
	getUniqueValuesByKey,
} from "@/lib/utils/games/games.utils";
import { Game, GameType } from "@/types/games/gameList.types";

interface SeoPageFormProps {
	initialData?: {
		id: string;
		slug: string;
		title: string;
		description: string;
		content: string;
		keywords: string | null;
		structuredData: string | null;
		carousels: CarouselsState;
		published: boolean;
	};
}

interface CarouselConfig {
	enabled: boolean;
	position: "top" | "bottom";
	searchKeyword?: string;
}

export interface CarouselsState {
	liveCasino: CarouselConfig;
	slots: CarouselConfig;
	sports: CarouselConfig;
	providers: CarouselConfig;
}

export function SeoPageForm({ initialData }: SeoPageFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [content, setContent] = useState(initialData?.content || "");

	const defaultCarouselConfig: CarouselConfig = {
		enabled: false,
		position: "bottom",
		searchKeyword: "",
	};
	const [carousels, setCarousels] = useState<CarouselsState>(
		(initialData?.carousels as CarouselsState) || {
			liveCasino: { ...defaultCarouselConfig },
			slots: { ...defaultCarouselConfig },
			sports: { ...defaultCarouselConfig },
			providers: { ...defaultCarouselConfig },
		}
	);

	const updateCarousel = (
		key: keyof CarouselsState,
		field: keyof CarouselConfig,
		value: string | boolean
	) => {
		setCarousels((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				[field]: value,
			},
		}));
	};

	// Get games from store for real-time count feedback
	const allGames = useAppStore((state) => state.game.list.games);
	const gamesStatus = useAppStore((state) => state.game.list.status);
	const initializeGameList = useAppStore(
		(state) => state.game.list.initializeGameList
	);
	const totalGames = allGames?.length ?? 0;
	const [isClient, setIsClient] = useState(false);

	useEffect(() => setIsClient(true), []);

	useEffect(() => {
		if (!isClient) return;
		if (
			gamesStatus === "idle" ||
			(gamesStatus === "error" && totalGames === 0)
		) {
			initializeGameList();
		}
	}, [isClient, gamesStatus, totalGames]);

	// Calculate game counts for each category search
	const gameCounts = useMemo(() => {
		if (!isClient || !allGames?.length)
			return { liveCasino: 0, slots: 0, sports: 0 };

		const getCategoryKey = (type: string) => {
			if (type === "SPORTS") {
				const categories = getUniqueValuesByKey(allGames, "category");
				return (
					categories.find(
						(c) => c === "SPORTSBOOK" || c === "SPORT BOOK"
					) || "SPORTS"
				);
			}
			return type;
		};

		const countGames = (type: string, keyword?: string) => {
			const categoryKey = getCategoryKey(type);
			const categoryGames = getGamesByCategory(
				allGames,
				categoryKey as GameType,
				5000
			);
			if (!keyword?.trim()) {
				console.log(
					`  - No keyword, returning total:`,
					categoryGames.length
				);
				return categoryGames.length;
			}

			const kw = keyword.toLowerCase();
			return (categoryGames as Game[]).filter((g) =>
				g.game_name.toLowerCase().includes(kw)
			).length;
		};

		return {
			liveCasino: countGames(
				"LIVE CASINO",
				carousels.liveCasino.searchKeyword
			),
			slots: countGames("SLOT", carousels.slots.searchKeyword),
			sports: countGames("SPORTS", carousels.sports.searchKeyword),
		};
	}, [
		allGames,
		carousels.liveCasino.searchKeyword,
		carousels.slots.searchKeyword,
		carousels.sports.searchKeyword,
		isClient,
	]);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const data = {
			slug: formData.get("slug") as string,
			title: formData.get("title") as string,
			description: formData.get("description") as string,
			content: content,
			keywords: formData.get("keywords") as string,
			structuredData: formData.get("structuredData") as string,
			carousels: carousels,
			published: formData.get("published") === "on",
		};

		try {
			const result = initialData
				? await updateSeoPage(initialData.id, data)
				: await createSeoPage(data);

			if (result?.success) {
				window.location.href = "/admin/seo";
			}
		} catch (error) {
			console.error("Failed to save SEO page:", error);
			setIsLoading(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/admin/seo">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{initialData ? "Edit SEO Page" : "Create SEO Page"}
						</h1>
						<p className="text-muted-foreground">
							{initialData
								? `Editing /${initialData.slug}`
								: "Create a new landing page for SEO"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Switch
							id="published"
							name="published"
							defaultChecked={initialData?.published}
						/>
						<Label htmlFor="published">Published</Label>
					</div>
					<Button type="submit" disabled={isLoading}>
						{isLoading && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						<Save className="mr-2 h-4 w-4" />
						Save Page
					</Button>
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-8">
					<Card>
						<CardContent className="p-6 space-y-6">
							<div className="space-y-2">
								<Label htmlFor="title">Page Title</Label>
								<Input
									id="title"
									name="title"
									placeholder="e.g. Best Crypto Casino 2025"
									defaultValue={initialData?.title}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label>Content</Label>
								<RichTextEditor
									value={content}
									onChange={setContent}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6 space-y-6">
							<div className="space-y-2">
								<Label htmlFor="structuredData">
									Structured Data (JSON-LD)
								</Label>
								<p className="text-sm text-muted-foreground">
									Paste your JSON-LD schema here. It will be
									injected into the page head.
								</p>
								<Textarea
									id="structuredData"
									name="structuredData"
									className="font-mono text-sm min-h-[200px]"
									placeholder='{ "@context": "https://schema.org", "@type": "FAQPage", ... }'
									defaultValue={
										initialData?.structuredData || ""
									}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8">
					<Card>
						<CardContent className="p-6 space-y-6">
							<div className="space-y-2">
								<Label htmlFor="slug">URL Slug</Label>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground text-sm">
										/
									</span>
									<Input
										id="slug"
										name="slug"
										placeholder="crypto-casino"
										defaultValue={initialData?.slug}
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">
									Meta Description
								</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="Brief description for search engines..."
									defaultValue={initialData?.description}
									required
									className="min-h-[100px]"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="keywords">Keywords</Label>
								<Input
									id="keywords"
									name="keywords"
									placeholder="crypto, casino, bitcoin..."
									defaultValue={initialData?.keywords || ""}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6 space-y-6">
							<div>
								<h3 className="font-semibold text-lg">
									Dynamic Components
								</h3>
								<p className="text-sm text-muted-foreground mt-1">
									Enable game carousels and filter by
									keywords. Game counts update in real-time.
								</p>
							</div>

							{/* Live Casino */}
							<div className="space-y-3 p-4 border rounded-lg bg-muted/30">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Switch
											checked={
												carousels.liveCasino.enabled
											}
											onCheckedChange={(checked) =>
												updateCarousel(
													"liveCasino",
													"enabled",
													checked
												)
											}
										/>
										<Label className="font-medium">
											Live Casino
										</Label>
									</div>
									{carousels.liveCasino.enabled && (
										<select
											className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
											value={
												carousels.liveCasino.position
											}
											onChange={(e) =>
												updateCarousel(
													"liveCasino",
													"position",
													e.target.value
												)
											}
										>
											<option value="top">Top</option>
											<option value="bottom">
												Bottom
											</option>
										</select>
									)}
								</div>
								{carousels.liveCasino.enabled && (
									<div className="space-y-2">
										<Input
											placeholder="Filter games (e.g., blackjack, roulette)"
											value={
												carousels.liveCasino
													.searchKeyword || ""
											}
											onChange={(e) =>
												updateCarousel(
													"liveCasino",
													"searchKeyword",
													e.target.value
												)
											}
											className="text-sm"
										/>
										{isClient &&
											carousels.liveCasino
												.searchKeyword && (
												<p className="text-xs flex items-center gap-1">
													{gameCounts.liveCasino >
													0 ? (
														<>
															<span className="font-semibold text-green-600 dark:text-green-400">
																✓{" "}
																{
																	gameCounts.liveCasino
																}{" "}
																game
																{gameCounts.liveCasino !==
																1
																	? "s"
																	: ""}
															</span>
															{gameCounts.liveCasino >
																50 && (
																<span className="text-muted-foreground">
																	(max 50
																	shown)
																</span>
															)}
														</>
													) : (
														<span className="font-semibold text-amber-600 dark:text-amber-400">
															⚠ No games found
														</span>
													)}
												</p>
											)}
									</div>
								)}
							</div>

							{/* Slots */}
							<div className="space-y-3 p-4 border rounded-lg bg-muted/30">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Switch
											checked={carousels.slots.enabled}
											onCheckedChange={(checked) =>
												updateCarousel(
													"slots",
													"enabled",
													checked
												)
											}
										/>
										<Label className="font-medium">
											Slots
										</Label>
									</div>
									{carousels.slots.enabled && (
										<select
											className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
											value={carousels.slots.position}
											onChange={(e) =>
												updateCarousel(
													"slots",
													"position",
													e.target.value
												)
											}
										>
											<option value="top">Top</option>
											<option value="bottom">
												Bottom
											</option>
										</select>
									)}
								</div>
								{carousels.slots.enabled && (
									<div className="space-y-2">
										<Input
											placeholder="Filter games (e.g., sugar, egypt)"
											value={
												carousels.slots.searchKeyword ||
												""
											}
											onChange={(e) =>
												updateCarousel(
													"slots",
													"searchKeyword",
													e.target.value
												)
											}
											className="text-sm"
										/>
										{isClient &&
											carousels.slots.searchKeyword && (
												<p className="text-xs flex items-center gap-1">
													{gameCounts.slots > 0 ? (
														<>
															<span className="font-semibold text-green-600 dark:text-green-400">
																✓{" "}
																{
																	gameCounts.slots
																}{" "}
																game
																{gameCounts.slots !==
																1
																	? "s"
																	: ""}
															</span>
															{gameCounts.slots >
																50 && (
																<span className="text-muted-foreground">
																	(max 50
																	shown)
																</span>
															)}
														</>
													) : (
														<span className="font-semibold text-amber-600 dark:text-amber-400">
															⚠ No games found
														</span>
													)}
												</p>
											)}
									</div>
								)}
							</div>

							{/* Sports */}
							<div className="space-y-3 p-4 border rounded-lg bg-muted/30">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Switch
											checked={carousels.sports.enabled}
											onCheckedChange={(checked) =>
												updateCarousel(
													"sports",
													"enabled",
													checked
												)
											}
										/>
										<Label className="font-medium">
											Sports
										</Label>
									</div>
									{carousels.sports.enabled && (
										<select
											className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
											value={carousels.sports.position}
											onChange={(e) =>
												updateCarousel(
													"sports",
													"position",
													e.target.value
												)
											}
										>
											<option value="top">Top</option>
											<option value="bottom">
												Bottom
											</option>
										</select>
									)}
								</div>
								{carousels.sports.enabled && (
									<div className="space-y-2">
										<Input
											placeholder="Filter games (e.g., football, basketball)"
											value={
												carousels.sports
													.searchKeyword || ""
											}
											onChange={(e) =>
												updateCarousel(
													"sports",
													"searchKeyword",
													e.target.value
												)
											}
											className="text-sm"
										/>
										{isClient &&
											carousels.sports.searchKeyword && (
												<p className="text-xs flex items-center gap-1">
													{gameCounts.sports > 0 ? (
														<>
															<span className="font-semibold text-green-600 dark:text-green-400">
																✓{" "}
																{
																	gameCounts.sports
																}{" "}
																game
																{gameCounts.sports !==
																1
																	? "s"
																	: ""}
															</span>
															{gameCounts.sports >
																50 && (
																<span className="text-muted-foreground">
																	(max 50
																	shown)
																</span>
															)}
														</>
													) : (
														<span className="font-semibold text-amber-600 dark:text-amber-400">
															⚠ No games found
														</span>
													)}
												</p>
											)}
									</div>
								)}
							</div>

							{/* Providers */}
							<div className="space-y-3 p-4 border rounded-lg bg-muted/30">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Switch
											checked={
												carousels.providers.enabled
											}
											onCheckedChange={(checked) =>
												updateCarousel(
													"providers",
													"enabled",
													checked
												)
											}
										/>
										<Label className="font-medium">
											Providers
										</Label>
									</div>
									{carousels.providers.enabled && (
										<select
											className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
											value={carousels.providers.position}
											onChange={(e) =>
												updateCarousel(
													"providers",
													"position",
													e.target.value
												)
											}
										>
											<option value="top">Top</option>
											<option value="bottom">
												Bottom
											</option>
										</select>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</form>
	);
}
