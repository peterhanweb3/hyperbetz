"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const siteDomain =
	typeof window !== "undefined"
		? window.location.origin
		: "https://hyperbetz.com";

// Links map for SEO content
const seoLinks: Record<string, string> = {
	home: `${siteDomain}/`,
	slots: `${siteDomain}/providers/slot`,
	liveCasino: `${siteDomain}/providers/live-casino`,
	sports: `${siteDomain}/games/sbo`,
	poker: `${siteDomain}/games?q=poker`,
	lottery: `${siteDomain}/games?q=lottery`,
	sweetBonanza: `${siteDomain}/games?q=sweet+bonanza+super+scatter`,
	gatesOfOlympus: `${siteDomain}/games?q=gates+of+olympus+1000%E2%84%A2`,
	sugarRush: `${siteDomain}/games?q=sugar+rush+1000`,
	dogHouse: `${siteDomain}/games?q=the+dog+house+megaways`,
	bigBassBonanza: `${siteDomain}/games?q=big+bass+bonanza+3+reeler`,
	aviator: `${siteDomain}/games?q=aviator+extra+bet`,
	affiliate: `${siteDomain}/affiliate`,
	bonus: `${siteDomain}/bonus`,
};

// Helper function to render text with **bold** and [link](url) markdown syntax
const renderWithBoldAndLinks = (text: string): ReactNode => {
	// First, parse links: [text](url) or [text](link:key)
	const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	const parts: ReactNode[] = [];
	let lastIndex = 0;
	let match;

	while ((match = linkRegex.exec(text)) !== null) {
		// Add text before the link
		if (match.index > lastIndex) {
			parts.push(text.slice(lastIndex, match.index));
		}

		const linkText = match[1];
		let linkUrl = match[2];

		// Check if it's a link:key reference
		if (linkUrl.startsWith("link:")) {
			const key = linkUrl.replace("link:", "");
			linkUrl = seoLinks[key] || "#";
		}

		// Check if link text contains bold
		const hasBold = linkText.startsWith("**") && linkText.endsWith("**");
		const displayText = hasBold ? linkText.slice(2, -2) : linkText;

		parts.push(
			<Link
				key={`link-${match.index}`}
				href={linkUrl}
				className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
			>
				{hasBold ? (
					<strong className="font-semibold">{displayText}</strong>
				) : (
					displayText
				)}
			</Link>
		);

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	// If no links were found, just process bold text
	if (parts.length === 0) {
		const boldParts = text.split(/(\*\*.*?\*\*)/g);
		return boldParts.map((boldPart, boldIndex) => {
			if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
				return (
					<strong
						key={`bold-${boldIndex}`}
						className="font-semibold text-foreground"
					>
						{boldPart.slice(2, -2)}
					</strong>
				);
			}
			return boldPart;
		});
	}

	// Now process bold text within the string parts
	return parts.map((part, index) => {
		if (typeof part === "string") {
			// Process bold within string parts
			const boldParts = part.split(/(\*\*.*?\*\*)/g);
			return boldParts.map((boldPart, boldIndex) => {
				if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
					return (
						<strong
							key={`${index}-${boldIndex}`}
							className="font-semibold text-foreground"
						>
							{boldPart.slice(2, -2)}
						</strong>
					);
				}
				return boldPart;
			});
		}
		return part;
	});
};

export function SeoContentSection() {
	const t = useT();
	const [isExpanded, setIsExpanded] = useState(false);

	const { primaryWallet } = useDynamicContext();

	return primaryWallet !== null ? (
		<></>
	) : (
		<>
			<section className="border-t border-border/50 bg-card">
				<div className="container mx-auto consistent-padding-x py-10">
					<div className="mx-auto container max-w-6xl">
						{/* Main Content */}
						<div className="mb-8">
							{/* Title */}
							<h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary via-chart-1 to-primary bg-clip-text text-transparent mb-6">
								{t("footer.seoContent.title")}
							</h1>

							<div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
								{/* Intro Section */}
								<div className="space-y-4">
									<p>
										{renderWithBoldAndLinks(
											t(
												"footer.seoContent.intro.paragraph1"
											)
										)}
									</p>
									<p>
										{renderWithBoldAndLinks(
											t(
												"footer.seoContent.intro.paragraph2"
											)
										)}
									</p>
								</div>

								{/* {isExpanded && ( */}
								<div
									className={cn(
										!isExpanded ? "hidden" : "block"
									)}
								>
									{/* Why Hyperbetz Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.whyHyperbetz.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.whyHyperbetz.subtitle"
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.whyHyperbetz.tonsOfGames"
												)
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.whyHyperbetz.useCryptocurrency"
												)
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.whyHyperbetz.noTrickyRules"
												)
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.whyHyperbetz.fairAndHonest"
												)
											)}
										</p>
									</div>
									{/* What Is Best Crypto Casino Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.1s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.whatIsBestCryptoCasino.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.whatIsBestCryptoCasino.paragraph1"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.lookFor.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.lookFor.1"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.lookFor.2"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.lookFor.3"
													)
												)}
											</li>
										</ul>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.whatIsBestCryptoCasino.paragraph2"
												)
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.offers.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.offers.1"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.offers.2"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.whatIsBestCryptoCasino.offers.3"
													)
												)}
											</li>
										</ul>
									</div>
									{/* Games Library Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.2s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.subtitle"
											)}
										</p>

										{/* Slots */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.slots.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.slots.paragraph1"
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.gamesLibrary.slots.bigJackpots"
												)
											)}
										</p>

										{/* Live Casino */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.liveCasino.title"
											)}
										</h3>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.gamesLibrary.liveCasino.paragraph1"
												)
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.liveCasino.paragraph2"
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.liveCasino.paragraph3"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.gamesLibrary.liveCasino.games.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.gamesLibrary.liveCasino.games.1"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.gamesLibrary.liveCasino.games.2"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.gamesLibrary.liveCasino.games.3"
													)
												)}
											</li>
										</ul>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.liveCasino.closing"
											)}
										</p>

										{/* Crash Games */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.crashGames.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.crashGames.paragraph"
											)}
										</p>

										{/* Plinko */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.plinko.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.plinko.paragraph"
											)}
										</p>

										{/* Sports */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.sports.title"
											)}
										</h3>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.gamesLibrary.sports.paragraph1"
												)
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.gamesLibrary.sports.paragraph2"
												)
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.sports.subtitle"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{t(
													"footer.seoContent.gamesLibrary.sports.games.0"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.gamesLibrary.sports.games.1"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.gamesLibrary.sports.games.2"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.gamesLibrary.sports.games.3"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.gamesLibrary.sports.games.4"
												)}
											</li>
										</ul>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.sports.closing"
											)}
										</p>

										{/* Poker */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.poker.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.poker.paragraph"
											)}
										</p>

										{/* Lottery */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.gamesLibrary.lottery.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.gamesLibrary.lottery.paragraph"
											)}
										</p>
									</div>
									{/* How to Choose Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.3s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.howToChoose.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.howToChoose.subtitle"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.1"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.2"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.3"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.4"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.5"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.howToChoose.points.6"
													)
												)}
											</li>
										</ul>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.howToChoose.closing"
												)
											)}
										</p>
									</div>
									{/* Best Slots Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.4s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.bestSlots.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.bestSlots.subtitle"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{t(
													"footer.seoContent.bestSlots.features.0"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.bestSlots.features.1"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.bestSlots.features.2"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.bestSlots.features.3"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.bestSlots.features.4"
												)}
											</li>
										</ul>
										<p>
											{t(
												"footer.seoContent.bestSlots.popularTitle"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.bestSlots.popularSlots.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.bestSlots.popularSlots.1"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.bestSlots.popularSlots.2"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.bestSlots.popularSlots.3"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.bestSlots.popularSlots.4"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.bestSlots.popularSlots.5"
													)
												)}
											</li>
										</ul>
									</div>
									{/* Bonuses Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.5s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.bonuses.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.bonuses.subtitle"
											)}
										</p>

										{/* Affiliate */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.bonuses.affiliate.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.bonuses.affiliate.paragraph"
											)}
										</p>

										{/* Turnover */}
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.bonuses.turnover.title"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.bonuses.turnover.paragraph"
											)}
										</p>

										{/* Commission Rate Table */}
										<h3 className="text-lg font-semibold text-foreground mt-6">
											{t(
												"footer.seoContent.bonuses.commissionTitle"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.bonuses.commissionSubtitle"
											)}
										</p>
										<div className="mt-4 rounded-lg border border-border">
											<Table>
												<TableHeader>
													<TableRow className="bg-primary/10">
														<TableHead>
															{t(
																"footer.seoContent.bonuses.tierTable.headers.0"
															)}
														</TableHead>
														<TableHead>
															{t(
																"footer.seoContent.bonuses.tierTable.headers.1"
															)}
														</TableHead>
														<TableHead>
															{t(
																"footer.seoContent.bonuses.tierTable.headers.2"
															)}
														</TableHead>
														<TableHead>
															{t(
																"footer.seoContent.bonuses.tierTable.headers.3"
															)}
														</TableHead>
														<TableHead>
															{t(
																"footer.seoContent.bonuses.tierTable.headers.4"
															)}
														</TableHead>
														<TableHead>
															{t(
																"footer.seoContent.bonuses.tierTable.headers.5"
															)}
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.0.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.0.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.0.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.0.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.0.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.0.5"
															)}
														</TableCell>
													</TableRow>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.1.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.1.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.1.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.1.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.1.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.1.5"
															)}
														</TableCell>
													</TableRow>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.2.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.2.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.2.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.2.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.2.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.2.5"
															)}
														</TableCell>
													</TableRow>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.3.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.3.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.3.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.3.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.3.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.3.5"
															)}
														</TableCell>
													</TableRow>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.4.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.4.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.4.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.4.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.4.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.4.5"
															)}
														</TableCell>
													</TableRow>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.5.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.5.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.5.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.5.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.5.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.5.5"
															)}
														</TableCell>
													</TableRow>
													<TableRow className="even:bg-muted/20">
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.6.0"
															)}
														</TableCell>
														<TableCell className="font-medium text-primary">
															{t(
																"footer.seoContent.bonuses.tierTable.rows.6.1"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.6.2"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.6.3"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.6.4"
															)}
														</TableCell>
														<TableCell>
															{t(
																"footer.seoContent.bonuses.tierTable.rows.6.5"
															)}
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</div>
									</div>
									{/* Deposit Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.6s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.deposit.title"
											)}
										</h2>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.deposit.subtitle"
												)
											)}
										</p>

										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.deposit.stepsTitle"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.deposit.stepsSubtitle"
											)}
										</p>

										{/* Step 1 */}
										<p className="font-semibold">
											{t(
												"footer.seoContent.deposit.step1.title"
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.deposit.step1.description"
												)
											)}
										</p>

										{/* Step 2 */}
										<p className="font-semibold">
											{t(
												"footer.seoContent.deposit.step2.title"
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.deposit.step2.description"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.0"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.1"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.2"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.3"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.4"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.5"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.6"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.7"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.8"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.deposit.step2.currencies.9"
												)}
											</li>
										</ul>

										{/* Step 3 */}
										<p className="font-semibold">
											{t(
												"footer.seoContent.deposit.step3.title"
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.deposit.step3.description"
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.deposit.step3.paragraph2"
											)}
										</p>
										<p className="font-semibold">
											{t(
												"footer.seoContent.deposit.step3.networksTitle"
											)}
										</p>

										{/* Networks */}
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.btc.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.btc.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.btc.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.btc.features.2"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.btc.features.3"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.btc.bestFor"
													)
												)}
											</p>
										</div>
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.erc20.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.erc20.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.erc20.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.erc20.features.2"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.erc20.bestFor"
													)
												)}
											</p>
										</div>
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.trc20.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.trc20.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.trc20.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.trc20.features.2"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.trc20.bestFor"
													)
												)}
											</p>
										</div>
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.bep20.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.bep20.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.bep20.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.bep20.features.2"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.bep20.bestFor"
													)
												)}
											</p>
										</div>
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.sol.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.sol.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.sol.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.sol.features.2"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.sol.bestFor"
													)
												)}
											</p>
										</div>
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.polygon.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.polygon.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.polygon.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.polygon.features.2"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.polygon.bestFor"
													)
												)}
											</p>
										</div>
										<div className="space-y-2">
											<p className="font-semibold">
												{t(
													"footer.seoContent.deposit.step3.networks.others.title"
												)}
											</p>
											<ul className="list-disc list-inside space-y-1 ml-4">
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.others.features.0"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.others.features.1"
													)}
												</li>
												<li>
													{t(
														"footer.seoContent.deposit.step3.networks.others.features.2"
													)}
												</li>
											</ul>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.deposit.step3.networks.others.bestFor"
													)
												)}
											</p>
										</div>

										<p>
											{t(
												"footer.seoContent.deposit.step3.networkClosing"
											)}
										</p>

										{/* Step 4 */}
										<p className="font-semibold">
											{t(
												"footer.seoContent.deposit.step4.title"
											)}
										</p>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.deposit.step4.description"
												)
											)}
										</p>

										{/* Step 5 */}
										<p className="font-semibold">
											{t(
												"footer.seoContent.deposit.step5.title"
											)}
										</p>
										<p>
											{t(
												"footer.seoContent.deposit.step5.description"
											)}
										</p>
									</div>
									{/* Why Depositing Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.7s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.whyDepositing.title"
											)}
										</h2>
										<div className="space-y-2">
											<h3 className="text-lg font-semibold text-foreground">
												{t(
													"footer.seoContent.whyDepositing.reasons.instant.title"
												)}
											</h3>
											<p>
												{t(
													"footer.seoContent.whyDepositing.reasons.instant.description"
												)}
											</p>
										</div>
										<div className="space-y-2">
											<h3 className="text-lg font-semibold text-foreground">
												{t(
													"footer.seoContent.whyDepositing.reasons.allNetworks.title"
												)}
											</h3>
											<p>
												{t(
													"footer.seoContent.whyDepositing.reasons.allNetworks.description"
												)}
											</p>
										</div>
										<div className="space-y-2">
											<h3 className="text-lg font-semibold text-foreground">
												{t(
													"footer.seoContent.whyDepositing.reasons.secure.title"
												)}
											</h3>
											<p>
												{t(
													"footer.seoContent.whyDepositing.reasons.secure.description"
												)}
											</p>
										</div>
										<div className="space-y-2">
											<h3 className="text-lg font-semibold text-foreground">
												{t(
													"footer.seoContent.whyDepositing.reasons.multiCurrency.title"
												)}
											</h3>
											<p>
												{t(
													"footer.seoContent.whyDepositing.reasons.multiCurrency.description"
												)}
											</p>
										</div>
										<div className="space-y-2">
											<h3 className="text-lg font-semibold text-foreground">
												{t(
													"footer.seoContent.whyDepositing.reasons.mobile.title"
												)}
											</h3>
											<p>
												{t(
													"footer.seoContent.whyDepositing.reasons.mobile.description"
												)}
											</p>
										</div>
									</div>
									{/* Buy Crypto Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.8s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.buyCrypto.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.buyCrypto.paragraph"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.buyCrypto.exchanges.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.buyCrypto.exchanges.1"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.buyCrypto.exchanges.2"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.buyCrypto.exchanges.3"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.buyCrypto.exchanges.4"
													)
												)}
											</li>
										</ul>
										<p>
											{renderWithBoldAndLinks(
												t(
													"footer.seoContent.buyCrypto.closing"
												)
											)}
										</p>
									</div>
									{/* Withdrawal Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_0.9s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.withdrawal.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.withdrawal.paragraph"
											)}
										</p>
										<ol className="list-decimal list-inside space-y-2 ml-4">
											<li>
												{t(
													"footer.seoContent.withdrawal.steps.0"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.withdrawal.steps.1"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.withdrawal.steps.2"
												)}
											</li>
											<li>
												{t(
													"footer.seoContent.withdrawal.steps.3"
												)}
											</li>
										</ol>
										<p>
											{t(
												"footer.seoContent.withdrawal.closing"
											)}
										</p>
									</div>
									{/* Mobile Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_1s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.mobile.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.mobile.paragraph"
											)}
										</p>
									</div>
									{/* Responsible Play Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_1.1s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.responsiblePlay.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.responsiblePlay.paragraph"
											)}
										</p>
										<h3 className="text-lg font-semibold text-foreground">
											{t(
												"footer.seoContent.responsiblePlay.safetyTitle"
											)}
										</h3>
										<p>
											{t(
												"footer.seoContent.responsiblePlay.safetySubtitle"
											)}
										</p>

										<div className="space-y-1">
											<p className="font-semibold">
												{t(
													"footer.seoContent.responsiblePlay.depositLimits.title"
												)}
											</p>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.responsiblePlay.depositLimits.description"
													)
												)}
											</p>
										</div>
										<div className="space-y-1">
											<p className="font-semibold">
												{t(
													"footer.seoContent.responsiblePlay.lossLimits.title"
												)}
											</p>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.responsiblePlay.lossLimits.description"
													)
												)}
											</p>
										</div>
										<div className="space-y-1">
											<p className="font-semibold">
												{t(
													"footer.seoContent.responsiblePlay.selfExclusion.title"
												)}
											</p>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.responsiblePlay.selfExclusion.description"
													)
												)}
											</p>
										</div>
										<div className="space-y-1">
											<p className="font-semibold">
												{t(
													"footer.seoContent.responsiblePlay.keepGaming.title"
												)}
											</p>
											<p>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.responsiblePlay.keepGaming.description"
													)
												)}
											</p>
										</div>
									</div>
									{/* Support Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_1.2s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.support.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.support.paragraph"
											)}
										</p>
										<p className="font-semibold">
											{t(
												"footer.seoContent.support.howToReach"
											)}
										</p>
										<ul className="list-disc list-inside space-y-2 ml-4">
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.support.methods.0"
													)
												)}
											</li>
											<li>
												{renderWithBoldAndLinks(
													t(
														"footer.seoContent.support.methods.1"
													)
												)}
											</li>
										</ul>
										<p>
											{t(
												"footer.seoContent.support.closing"
											)}
										</p>
									</div>
									{/* Testimonials Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_1.3s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t(
												"footer.seoContent.testimonials.title"
											)}
										</h2>
										<p>
											{t(
												"footer.seoContent.testimonials.subtitle"
											)}
										</p>
										<div className="space-y-4">
											<blockquote className="border-l-4 border-primary pl-4 italic">
												<p className="text-foreground/90">
													{t(
														"footer.seoContent.testimonials.reviews.0.quote"
													)}
												</p>
												<footer className="text-foreground/60 mt-1">
													—{" "}
													{t(
														"footer.seoContent.testimonials.reviews.0.author"
													)}
												</footer>
											</blockquote>
											<blockquote className="border-l-4 border-primary pl-4 italic">
												<p className="text-foreground/90">
													{t(
														"footer.seoContent.testimonials.reviews.1.quote"
													)}
												</p>
												<footer className="text-foreground/60 mt-1">
													—{" "}
													{t(
														"footer.seoContent.testimonials.reviews.1.author"
													)}
												</footer>
											</blockquote>
											<blockquote className="border-l-4 border-primary pl-4 italic">
												<p className="text-foreground/90">
													{t(
														"footer.seoContent.testimonials.reviews.2.quote"
													)}
												</p>
												<footer className="text-foreground/60 mt-1">
													—{" "}
													{t(
														"footer.seoContent.testimonials.reviews.2.author"
													)}
												</footer>
											</blockquote>
										</div>
									</div>
									{/* FAQ Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_1.4s_backwards]">
										<h2 className="text-xl font-bold text-foreground">
											{t("footer.seoContent.faq.title")}
										</h2>

										<Accordion
											type="single"
											collapsible
											className="w-full"
										>
											<AccordionItem value="faq-0">
												<AccordionTrigger className="text-left">
													{t(
														"footer.seoContent.faq.questions.0.q"
													)}
												</AccordionTrigger>
												<AccordionContent>
													{renderWithBoldAndLinks(
														t(
															"footer.seoContent.faq.questions.0.a"
														)
													)}
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="faq-1">
												<AccordionTrigger className="text-left">
													{t(
														"footer.seoContent.faq.questions.1.q"
													)}
												</AccordionTrigger>
												<AccordionContent>
													{renderWithBoldAndLinks(
														t(
															"footer.seoContent.faq.questions.1.a"
														)
													)}
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="faq-2">
												<AccordionTrigger className="text-left">
													{t(
														"footer.seoContent.faq.questions.2.q"
													)}
												</AccordionTrigger>
												<AccordionContent>
													{renderWithBoldAndLinks(
														t(
															"footer.seoContent.faq.questions.2.a"
														)
													)}
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="faq-3">
												<AccordionTrigger className="text-left">
													{t(
														"footer.seoContent.faq.questions.3.q"
													)}
												</AccordionTrigger>
												<AccordionContent>
													{renderWithBoldAndLinks(
														t(
															"footer.seoContent.faq.questions.3.a"
														)
													)}
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="faq-4">
												<AccordionTrigger className="text-left">
													{t(
														"footer.seoContent.faq.questions.4.q"
													)}
												</AccordionTrigger>
												<AccordionContent>
													{renderWithBoldAndLinks(
														t(
															"footer.seoContent.faq.questions.4.a"
														)
													)}
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</div>{" "}
									{/* CTA Section */}
									<div className="space-y-4 animate-[fade-in_0.3s_ease-out_1.5s_backwards]">
										<h2 className="text-xl font-bold text-primary">
											{t("footer.seoContent.cta.title")}
										</h2>
									</div>
								</div>
								{/* )} */}
							</div>
							<button
								onClick={() => setIsExpanded(!isExpanded)}
								className="mt-4 text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-all group"
							>
								{isExpanded
									? t("footer.seoContent.showLess")
									: t("footer.seoContent.showMore")}
								<ChevronDown
									className={`size-4 transition-transform ${
										isExpanded ? "rotate-180" : ""
									}`}
								/>
							</button>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
