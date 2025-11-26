"use client";

import { memo, useState, useCallback } from "react";
import { useT } from "@/hooks/useI18n";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
	question: string;
	answer: string;
	isOpen: boolean;
	onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
	return (
		<div className="border-b border-border last:border-b-0">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-primary"
				aria-expanded={isOpen}
			>
				<span className="pr-4 font-medium text-foreground">
					{question}
				</span>
				<ChevronDown
					className={cn(
						"h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
						isOpen && "rotate-180 text-primary"
					)}
				/>
			</button>
			<div
				className={cn(
					"overflow-hidden transition-all duration-200 ease-in-out",
					isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
				)}
			>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{answer}
				</p>
			</div>
		</div>
	);
}

function ContactFAQBase() {
	const t = useT();
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	const handleToggle = useCallback((index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	}, []);

	const faqItems = [
		{
			question: t("contact.faq.items.0.question"),
			answer: t("contact.faq.items.0.answer"),
		},
		{
			question: t("contact.faq.items.1.question"),
			answer: t("contact.faq.items.1.answer"),
		},
		{
			question: t("contact.faq.items.2.question"),
			answer: t("contact.faq.items.2.answer"),
		},
		{
			question: t("contact.faq.items.3.question"),
			answer: t("contact.faq.items.3.answer"),
		},
		{
			question: t("contact.faq.items.4.question"),
			answer: t("contact.faq.items.4.answer"),
		},
	];

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-6 text-xl font-semibold text-foreground">
				{t("contact.faq.title")}
			</h2>
			<div className="divide-y divide-border">
				{faqItems.map((item, index) => (
					<FAQItem
						key={index}
						question={item.question}
						answer={item.answer}
						isOpen={openIndex === index}
						onToggle={() => handleToggle(index)}
					/>
				))}
			</div>
		</div>
	);
}

export const ContactFAQ = memo(ContactFAQBase);
