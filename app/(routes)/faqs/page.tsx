"use client";

import { PageHeader, SectionCard } from "@/components/legal";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { useState, useMemo } from "react";
import { JsonLd } from "@/components/seo/json-ld";

interface FAQItemProps {
	question: string;
	answer: string | string[];
	reminder?: string;
}

function FAQItem({ question, answer, reminder }: FAQItemProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Helper function to render paragraph content with bullet points
	const renderParagraph = (text: string, index: number) => {
		// Check if the paragraph should be a bullet point
		// Bullet points start with "Go to", "Choose", "Copy", "Send", "Refresh", "Clear", etc.
		const bulletKeywords = [
			"Go to",
			"Choose",
			"Copy",
			"Send",
			"Once confirmed",
			"Reconnect",
			"If you've lost",
			"Check your",
			"Confirm that",
			"If it's been",
			"Refresh",
			"Clear your",
			"If the issue",
			"Enter your",
			"Double-check",
			"Withdrawals are",
			"GamCare:",
			"Gambling Therapy:",
			"Gamblers Anonymous:",
		];

		const shouldBeBullet = bulletKeywords.some((keyword) =>
			text.trim().startsWith(keyword)
		);

		if (shouldBeBullet) {
			return (
				<li key={index} className="ml-4">
					{text}
				</li>
			);
		}

		return (
			<p key={index} className="mb-2">
				{text}
			</p>
		);
	};

	return (
		<div className="border border-border rounded-lg overflow-hidden bg-card">
			<button
				className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
				onClick={() => setIsOpen(!isOpen)}
			>
				<h3 className="font-semibold text-foreground pr-4">
					{question}
				</h3>
				<ChevronDown
					className={`size-5 text-muted-foreground shrink-0 transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			{isOpen && (
				<div className="px-4 pb-4 pt-2 text-muted-foreground">
					{Array.isArray(answer) ? (
						<ul className="space-y-2 list-disc">
							{answer.map((paragraph, index) =>
								renderParagraph(paragraph, index)
							)}
						</ul>
					) : (
						<p className="mb-2">{answer}</p>
					)}
					{reminder && (
						<div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
							<p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
								{reminder}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function FAQsPage() {
	const t = useT();

	const faqCategories = [
		{
			title: t("faqs.categories.accountRegistration.title"),
			items: Array.from({ length: 4 }).map((_, i) => {
				const answer = t(
					`faqs.categories.accountRegistration.items.${i}.answer`
				);
				const reminderKey = `faqs.categories.accountRegistration.items.${0}.reminder`;
				const reminder = t(reminderKey);
				return {
					question: t(
						`faqs.categories.accountRegistration.items.${i}.question`
					),
					answer: answer.includes("|") ? answer.split("|") : answer,
					reminder: reminder !== reminderKey ? reminder : undefined,
				};
			}),
		},
		{
			title: t("faqs.categories.depositsWithdrawals.title"),
			items: Array.from({ length: 5 }).map((_, i) => {
				const answer = t(
					`faqs.categories.depositsWithdrawals.items.${i}.answer`
				);
				return {
					question: t(
						`faqs.categories.depositsWithdrawals.items.${i}.question`
					),
					answer: answer.includes("|") ? answer.split("|") : answer,
					reminder: undefined,
				};
			}),
		},
		{
			title: t("faqs.categories.gamesSecurity.title"),
			items: Array.from({ length: 4 }).map((_, i) => {
				const answer = t(
					`faqs.categories.gamesSecurity.items.${i}.answer`
				);
				return {
					question: t(
						`faqs.categories.gamesSecurity.items.${i}.question`
					),
					answer: answer.includes("|") ? answer.split("|") : answer,
					reminder: undefined,
				};
			}),
		},
		{
			title: t("faqs.categories.responsibleGambling.title"),
			items: Array.from({ length: 2 }).map((_, i) => {
				const answer = t(
					`faqs.categories.responsibleGambling.items.${i}.answer`
				);
				return {
					question: t(
						`faqs.categories.responsibleGambling.items.${i}.question`
					),
					answer: answer.includes("|") ? answer.split("|") : answer,
					reminder: undefined,
				};
			}),
		},
	];

	// Generate FAQ schema for SEO (rich snippets in Google)
	const faqSchema = useMemo(() => {
		const allQuestions = faqCategories.flatMap((category) =>
			category.items.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: item.answer,
				},
			}))
		);

		return {
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: allQuestions,
		};
	}, [faqCategories]);

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<JsonLd data={faqSchema} />
			<PageHeader title={t("faqs.title")} subtitle={t("faqs.subtitle")} />

			<SectionCard
				variant="primary"
				title={t("faqs.introTitle")}
				icon={HelpCircle}
			>
				{t("faqs.intro")
					.split("|")
					.map((paragraph, index) => (
						<p
							key={index}
							className={
								index === 0
									? "text-base mb-2"
									: "text-base mb-4"
							}
						>
							{paragraph}
						</p>
					))}
				<p className="text-sm text-muted-foreground mt-4">
					{t("faqs.lastUpdated")}
				</p>
			</SectionCard>

			{faqCategories.map((category, categoryIndex) => (
				<div key={categoryIndex} className="space-y-4">
					<h2 className="text-2xl font-semibold text-foreground">
						{category.title}
					</h2>
					<div className="space-y-3">
						{category.items.map((item, itemIndex) => (
							<FAQItem
								key={itemIndex}
								question={item.question}
								answer={item.answer}
								reminder={item.reminder}
							/>
						))}
					</div>
				</div>
			))}

			{/* Blockchain Transparency Section */}
			<SectionCard title={t("faqs.blockchainTransparency.title")}>
				{t("faqs.blockchainTransparency.paragraph1")
					.split("|")
					.map((paragraph, index) => (
						<p key={index} className="mb-4">
							{paragraph}
						</p>
					))}
				<p className="mb-4">
					{t("faqs.blockchainTransparency.paragraph2")}
				</p>
				<div className="space-y-2">
					{t("faqs.blockchainTransparency.explorersTitle") && (
						<p className="font-semibold">
							{t("faqs.blockchainTransparency.explorersTitle")}
						</p>
					)}
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>
							<a
								href="https://etherscan.io"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								Etherscan.io
							</a>
						</li>
						<li>
							<a
								href="https://bscscan.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								BscScan.com
							</a>
						</li>
						<li>
							<a
								href="https://tronscan.org"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								TronScan.org
							</a>
						</li>
					</ul>
				</div>
				<p className="mt-4 font-semibold">
					{t("faqs.blockchainTransparency.guarantee")}
				</p>
			</SectionCard>

			<SectionCard title={t("faqs.needMoreHelp.title")} variant="primary">
				<p className="mb-4">{t("faqs.needMoreHelp.intro")}</p>
				<div className="space-y-2">
					{t("faqs.needMoreHelp.contactTitle") && (
						<p className="font-semibold">
							{t("faqs.needMoreHelp.contactTitle")}
						</p>
					)}
					<p className="text-primary font-medium">
						{t("faqs.needMoreHelp.liveChat")}
					</p>
				</div>
			</SectionCard>
		</div>
	);
}
