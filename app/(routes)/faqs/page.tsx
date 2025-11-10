"use client";

import { PageHeader, SectionCard } from "@/components/legal";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { useState } from "react";

interface FAQItemProps {
	question: string;
	answer: string | string[];
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
				<div className="px-4 pb-4 pt-2 text-muted-foreground space-y-2">
					{Array.isArray(answer) ? (
						answer.map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))
					) : (
						<p>{answer}</p>
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
				return {
					question: t(
						`faqs.categories.accountRegistration.items.${i}.question`
					),
					answer: answer.includes("|") ? answer.split("|") : answer,
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
				};
			}),
		},
	];

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<PageHeader title={t("faqs.title")} subtitle={t("faqs.subtitle")} />

			<SectionCard
				variant="primary"
				title={t("faqs.introTitle")}
				icon={HelpCircle}
			>
				<p className="text-base mb-2">{t("faqs.intro")}</p>
				<p className="text-sm text-muted-foreground">
					{t("faqs.lastUpdated")}
				</p>
			</SectionCard>

			{/* Blockchain Transparency Section */}
			<SectionCard title={t("faqs.blockchainTransparency.title")}>
				<p className="mb-4">
					{t("faqs.blockchainTransparency.paragraph1")}
				</p>
				<p className="mb-4">
					{t("faqs.blockchainTransparency.paragraph2")}
				</p>
				<div className="space-y-2">
					<p className="font-semibold">
						{t("faqs.blockchainTransparency.explorersTitle")}
					</p>
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

			<SectionCard title={t("faqs.needMoreHelp.title")} variant="primary">
				<p className="mb-4">{t("faqs.needMoreHelp.intro")}</p>
				<div className="space-y-2">
					<p className="font-semibold">
						{t("faqs.needMoreHelp.contactTitle")}
					</p>
					<p className="text-primary font-medium">
						💬 {t("faqs.needMoreHelp.liveChat")}
					</p>
					<p className="text-primary font-medium">
						📧 support@hyperbetz.games
					</p>
				</div>
			</SectionCard>
		</div>
	);
}
