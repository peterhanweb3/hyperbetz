"use client";

import {
	PageHeader,
	SectionCard,
	ListSection,
	ContentSection,
} from "@/components/legal";
import {
	Shield,
	Heart,
	AlertCircle,
	Phone,
	Settings,
	Clock,
	DollarSign,
	Baby,
	Lightbulb,
	Target,
} from "lucide-react";
import { useT } from "@/hooks/useI18n";

export default function ResponsibleGamblingPage() {
	const t = useT();

	// Helper function to split multi-paragraph content
	const splitParagraphs = (text: string) => {
		return text.includes("|") ? text.split("|") : [text];
	};

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<PageHeader
				title={t("responsibleGambling.title")}
				subtitle={t("responsibleGambling.subtitle")}
			/>

			{/* Introduction */}
			<SectionCard
				variant="primary"
				title={t("responsibleGambling.intro.title")}
				icon={Heart}
			>
				{splitParagraphs(t("responsibleGambling.intro.paragraph1")).map(
					(para, index) => (
						<p key={index} className="text-base mb-4">
							{para}
						</p>
					)
				)}
				<p className="text-base font-semibold">
					{t("responsibleGambling.intro.paragraph2")}
				</p>
				<p className="text-sm text-muted-foreground mt-4">
					{t("responsibleGambling.lastUpdated")}
				</p>
			</SectionCard>

			{/* Our Mission */}
			<SectionCard
				title={t("responsibleGambling.mission.title")}
				icon={Target}
			>
				<ContentSection>
					{splitParagraphs(
						t("responsibleGambling.mission.paragraph1")
					).map((para, index) => (
						<p key={index} className="mb-4">
							{para}
						</p>
					))}
					<p className="mb-2 font-semibold">
						{t("responsibleGambling.mission.paragraph2")}
					</p>
					<ListSection
						items={[
							{
								content: t(
									"responsibleGambling.mission.beliefs.0"
								),
							},
							{
								content: t(
									"responsibleGambling.mission.beliefs.1"
								),
							},
							{
								content: t(
									"responsibleGambling.mission.beliefs.2"
								),
							},
						]}
					/>
				</ContentSection>
			</SectionCard>

			{/* Understanding Responsible Gambling */}
			<SectionCard
				title={t("responsibleGambling.understanding.title")}
				icon={Lightbulb}
			>
				<ContentSection>
					{splitParagraphs(
						t("responsibleGambling.understanding.paragraph1")
					).map((para, index) => (
						<p key={index} className="mb-4">
							{para}
						</p>
					))}
					<p className="mb-2 font-semibold">
						{t("responsibleGambling.understanding.paragraph2")}
					</p>
					<ListSection
						items={[
							{
								content: t(
									"responsibleGambling.understanding.tips.0"
								),
							},
							{
								content: t(
									"responsibleGambling.understanding.tips.1"
								),
							},
							{
								content: t(
									"responsibleGambling.understanding.tips.2"
								),
							},
							{
								content: t(
									"responsibleGambling.understanding.tips.3"
								),
							},
							{
								content: t(
									"responsibleGambling.understanding.tips.4"
								),
							},
							{
								content: t(
									"responsibleGambling.understanding.tips.5"
								),
							},
						]}
					/>
				</ContentSection>
			</SectionCard>

			{/* Self-Check */}
			<SectionCard
				title={t("responsibleGambling.selfCheck.title")}
				variant="warning"
				icon={AlertCircle}
			>
				<p className="mb-4">
					{t("responsibleGambling.selfCheck.intro")}
				</p>
				<ListSection
					items={[
						{
							content: t(
								"responsibleGambling.selfCheck.questions.0"
							),
						},
						{
							content: t(
								"responsibleGambling.selfCheck.questions.1"
							),
						},
						{
							content: t(
								"responsibleGambling.selfCheck.questions.2"
							),
						},
						{
							content: t(
								"responsibleGambling.selfCheck.questions.3"
							),
						},
						{
							content: t(
								"responsibleGambling.selfCheck.questions.4"
							),
						},
						{
							content: t(
								"responsibleGambling.selfCheck.questions.5"
							),
						},
					]}
				/>
				<p className="mt-4 font-semibold">
					{t("responsibleGambling.selfCheck.warning")}
				</p>
			</SectionCard>

			{/* Tools We Offer */}
			<SectionCard
				title={t("responsibleGambling.tools.title")}
				icon={Settings}
			>
				<ContentSection>
					{splitParagraphs(t("responsibleGambling.tools.intro")).map(
						(para, index) => (
							<p key={index} className="mb-4">
								{para}
							</p>
						)
					)}
				</ContentSection>

				{/* Self-Exclusion */}
				<div className="mb-6">
					<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
						<Shield className="size-5" />
						{t("responsibleGambling.tools.selfExclusion.title")}
					</h3>
					{splitParagraphs(
						t("responsibleGambling.tools.selfExclusion.description")
					).map((para, index) => (
						<p key={index} className="mb-2">
							{para}
						</p>
					))}
				</div>

				{/* Cooling-Off Periods */}
				<div className="mb-6">
					<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
						<Clock className="size-5" />
						{t("responsibleGambling.tools.coolingOff.title")}
					</h3>
					{splitParagraphs(
						t("responsibleGambling.tools.coolingOff.paragraph1")
					).map((para, index) => (
						<p key={index} className="mb-2">
							{para}
						</p>
					))}
					<ListSection
						items={[
							{
								content: t(
									"responsibleGambling.tools.coolingOff.periods.0"
								),
							},
							{
								content: t(
									"responsibleGambling.tools.coolingOff.periods.1"
								),
							},
							{
								content: t(
									"responsibleGambling.tools.coolingOff.periods.2"
								),
							},
						]}
					/>
					<p className="text-sm mt-2">
						{t("responsibleGambling.tools.coolingOff.paragraph2")}
					</p>
				</div>

				{/* Deposit & Loss Awareness */}
				<div>
					<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
						<DollarSign className="size-5" />
						{t("responsibleGambling.tools.depositAwareness.title")}
					</h3>
					{splitParagraphs(
						t(
							"responsibleGambling.tools.depositAwareness.description"
						)
					).map((para, index) => (
						<p key={index} className="mb-2">
							{para}
						</p>
					))}
				</div>
			</SectionCard>

			{/* Underage Gambling Prevention */}
			<SectionCard
				title={t("responsibleGambling.underagePrevention.title")}
				icon={Baby}
			>
				<ContentSection>
					{splitParagraphs(
						t("responsibleGambling.underagePrevention.paragraph1")
					).map((para, index) => (
						<p key={index} className="mb-4">
							{para}
						</p>
					))}
					<h4 className="font-semibold mb-2">
						{t("responsibleGambling.underagePrevention.tipsTitle")}
					</h4>
					<ListSection
						items={[
							{
								content: t(
									"responsibleGambling.underagePrevention.tips.0"
								),
							},
							{
								content: t(
									"responsibleGambling.underagePrevention.tips.1"
								),
							},
							{
								content: t(
									"responsibleGambling.underagePrevention.tips.2"
								),
							},
							{
								content: t(
									"responsibleGambling.underagePrevention.tips.3"
								),
							},
							{
								content: t(
									"responsibleGambling.underagePrevention.tips.4"
								),
							},
						]}
					/>
					<p className="mt-4 font-semibold">
						{t("responsibleGambling.underagePrevention.warning")}
					</p>
				</ContentSection>
			</SectionCard>

			{/* Help and Support */}
			<SectionCard
				title={t("responsibleGambling.helpSupport.title")}
				icon={Phone}
			>
				{splitParagraphs(
					t("responsibleGambling.helpSupport.intro")
				).map((para, index) => (
					<p key={index} className="mb-4">
						{para}
					</p>
				))}
				<div className="mt-4 space-y-3">
					{[0, 1, 2, 3, 4].map((index) => (
						<div
							key={index}
							className="rounded-lg border border-border bg-background p-4"
						>
							<h4 className="font-semibold text-foreground mb-2">
								{t(
									`responsibleGambling.helpSupport.organizations.${index}.name`
								)}
							</h4>
							<a
								href={t(
									`responsibleGambling.helpSupport.organizations.${index}.url`
								)}
								className="text-primary hover:underline text-sm break-all"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t(
									`responsibleGambling.helpSupport.organizations.${index}.url`
								)}
							</a>
						</div>
					))}
				</div>
				<p className="mt-4">
					{t("responsibleGambling.helpSupport.paragraph2")}
				</p>
			</SectionCard>

			{/* Responsible Gaming Principles */}
			<SectionCard
				title={t("responsibleGambling.principles.title")}
				icon={Shield}
			>
				<p className="mb-4">
					{t("responsibleGambling.principles.intro")}
				</p>
				<ListSection
					items={[
						{
							title: t(
								"responsibleGambling.principles.items.0.title"
							),
							content: t(
								"responsibleGambling.principles.items.0.description"
							),
						},
						{
							title: t(
								"responsibleGambling.principles.items.1.title"
							),
							content: t(
								"responsibleGambling.principles.items.1.description"
							),
						},
						{
							title: t(
								"responsibleGambling.principles.items.2.title"
							),
							content: t(
								"responsibleGambling.principles.items.2.description"
							),
						},
						{
							title: t(
								"responsibleGambling.principles.items.3.title"
							),
							content: t(
								"responsibleGambling.principles.items.3.description"
							),
						},
						{
							title: t(
								"responsibleGambling.principles.items.4.title"
							),
							content: t(
								"responsibleGambling.principles.items.4.description"
							),
						},
					]}
				/>
			</SectionCard>

			{/* Play Smart Reminders */}
			<SectionCard
				title={t("responsibleGambling.playSmart.title")}
				variant="primary"
				icon={Heart}
			>
				<ContentSection>
					{splitParagraphs(
						t("responsibleGambling.playSmart.intro")
					).map((para, index) => (
						<p key={index} className="mb-4">
							{para}
						</p>
					))}
					<ListSection
						items={[
							{
								content: t(
									"responsibleGambling.playSmart.reminders.0"
								),
							},
							{
								content: t(
									"responsibleGambling.playSmart.reminders.1"
								),
							},
							{
								content: t(
									"responsibleGambling.playSmart.reminders.2"
								),
							},
							{
								content: t(
									"responsibleGambling.playSmart.reminders.3"
								),
							},
							{
								content: t(
									"responsibleGambling.playSmart.reminders.4"
								),
							},
						]}
					/>
				</ContentSection>
			</SectionCard>

			{/* Final Message */}
			<SectionCard variant="primary">
				<ContentSection>
					{splitParagraphs(
						t("responsibleGambling.finalMessage.paragraph1")
					).map((para, index) => (
						<p key={index} className="mb-4 text-lg font-semibold">
							{para}
						</p>
					))}
					<p className="mb-2">
						{t("responsibleGambling.finalMessage.paragraph2")}
					</p>
					<p className="text-primary font-medium">
						{t("responsibleGambling.finalMessage.contact")}
					</p>
				</ContentSection>
			</SectionCard>
		</div>
	);
}
