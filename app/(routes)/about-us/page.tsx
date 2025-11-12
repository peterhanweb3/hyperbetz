"use client";

import { useT } from "@/hooks/useI18n";
import { CheckCircle } from "lucide-react";

export default function AboutPage() {
	const t = useT();

	// Helper function to split multi-paragraph content
	const splitParagraphs = (text: string) => {
		return text.includes("|") ? text.split("|") : [text];
	};

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			{/* Header */}
			<div className="space-y-3">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("about.title")}
				</h1>
				<p className="text-lg text-muted-foreground">
					{t("about.subtitle")}
				</p>
			</div>

			{/* Introduction */}
			<div className="rounded-lg border border-border bg-card p-6">
				<div className="space-y-4 text-muted-foreground">
					{splitParagraphs(t("about.intro.paragraph1")).map(
						(para, index) => (
							<p key={index}>{para}</p>
						)
					)}
					<p className="font-medium text-foreground">
						{t("about.intro.paragraph2")}
					</p>
				</div>
			</div>

			{/* Who We Are */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.whoWeAre.title")}
				</h2>
				<div className="space-y-4 text-muted-foreground">
					{splitParagraphs(t("about.whoWeAre.paragraph1")).map(
						(para, index) => (
							<p key={index}>{para}</p>
						)
					)}
					<p className="font-medium text-foreground">
						{t("about.whoWeAre.paragraph2")}
					</p>
				</div>
			</div>

			{/* Our Mission */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.mission.title")}
				</h2>
				<div className="space-y-4 text-muted-foreground">
					{splitParagraphs(t("about.mission.paragraph1")).map(
						(para, index) => (
							<p key={index}>{para}</p>
						)
					)}
					<p className="font-medium text-foreground">
						{t("about.mission.paragraph2")}
					</p>
				</div>
			</div>

			{/* What Makes HyperBetz Different */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.whatMakesUsDifferent.title")}
				</h2>
				<div className="space-y-3">
					{[0, 1, 2, 3, 4].map((index) => (
						<div
							key={index}
							className="flex items-start gap-3 text-muted-foreground"
						>
							<CheckCircle className="size-5 shrink-0 text-primary mt-0.5" />
							<p>
								{t(
									`about.whatMakesUsDifferent.features.${index}`
								)}
							</p>
						</div>
					))}
				</div>
				<p className="mt-6 font-medium text-foreground">
					{t("about.whatMakesUsDifferent.closing")}
				</p>
			</div>

			{/* Fair & Responsible Gaming */}
			<div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.fairGaming.title")}
				</h2>
				<div className="space-y-4 text-muted-foreground">
					{splitParagraphs(t("about.fairGaming.paragraph1")).map(
						(para, index) => (
							<p key={index}>{para}</p>
						)
					)}
					<p className="font-semibold text-foreground">
						{t("about.fairGaming.ageRestriction")}
					</p>
					<p>{t("about.fairGaming.paragraph2")}</p>
				</div>
			</div>

			{/* Our Promise */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.promise.title")}
				</h2>
				<div className="space-y-4 text-muted-foreground">
					{splitParagraphs(t("about.promise.paragraph1")).map(
						(para, index) => (
							<p key={index}>{para}</p>
						)
					)}
					<p className="font-medium text-foreground">
						{t("about.promise.paragraph2")}
					</p>
				</div>
			</div>

			{/* Join the HyperBetz Community */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.joinCommunity.title")}
				</h2>
				<div className="space-y-4 text-muted-foreground">
					<p>{t("about.joinCommunity.paragraph1")}</p>
					<p>{t("about.joinCommunity.paragraph2")}</p>
					<p className="text-lg font-bold text-primary">
						{t("about.joinCommunity.tagline")}
					</p>
				</div>
			</div>
		</div>
	);
}
