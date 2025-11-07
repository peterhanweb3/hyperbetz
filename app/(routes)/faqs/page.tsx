"use client";

import { PageHeader, SectionCard } from "@/components/legal";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { useState } from "react";

interface FAQItemProps {
	question: string;
	answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
	const [isOpen, setIsOpen] = useState(false);

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
				<div className="px-4 pb-4 text-muted-foreground">
					<p>{answer}</p>
				</div>
			)}
		</div>
	);
}

export default function FAQsPage() {
	const t = useT();

	const faqCategories = [
		{
			title: t("faqs.categories.general.title"),
			items: Array.from({ length: 5 }).map((_, i) => ({
				question: t(`faqs.categories.general.items.${i}.question`),
				answer: t(`faqs.categories.general.items.${i}.answer`),
			})),
		},
		{
			title: t("faqs.categories.deposits.title"),
			items: Array.from({ length: 4 }).map((_, i) => ({
				question: t(`faqs.categories.deposits.items.${i}.question`),
				answer: t(`faqs.categories.deposits.items.${i}.answer`),
			})),
		},
		{
			title: t("faqs.categories.withdrawals.title"),
			items: Array.from({ length: 4 }).map((_, i) => ({
				question: t(`faqs.categories.withdrawals.items.${i}.question`),
				answer: t(`faqs.categories.withdrawals.items.${i}.answer`),
			})),
		},
		{
			title: t("faqs.categories.games.title"),
			items: Array.from({ length: 3 }).map((_, i) => ({
				question: t(`faqs.categories.games.items.${i}.question`),
				answer: t(`faqs.categories.games.items.${i}.answer`),
			})),
		},
		{
			title: t("faqs.categories.bonuses.title"),
			items: Array.from({ length: 3 }).map((_, i) => ({
				question: t(`faqs.categories.bonuses.items.${i}.question`),
				answer: t(`faqs.categories.bonuses.items.${i}.answer`),
			})),
		},
		{
			title: t("faqs.categories.account.title"),
			items: Array.from({ length: 4 }).map((_, i) => ({
				question: t(`faqs.categories.account.items.${i}.question`),
				answer: t(`faqs.categories.account.items.${i}.answer`),
			})),
		},
	];

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<PageHeader title={t("faqs.title")} subtitle={t("faqs.subtitle")} />

			<SectionCard variant="primary" icon={HelpCircle}>
				<p className="text-base">{t("faqs.intro")}</p>
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
							/>
						))}
					</div>
				</div>
			))}

			<SectionCard title={t("faqs.stillNeedHelp.title")}>
				<p>{t("faqs.stillNeedHelp.content")}</p>
				<p className="text-primary font-medium">
					support@hyperbetz.games
				</p>
			</SectionCard>
		</div>
	);
}
