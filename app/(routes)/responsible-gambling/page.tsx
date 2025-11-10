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
				<p className="text-base mb-4">
					{t("responsibleGambling.intro.paragraph1")}
				</p>
				<p className="text-base mb-4">
					{t("responsibleGambling.intro.paragraph2")}
				</p>
				<p className="text-base font-semibold">
					{t("responsibleGambling.intro.paragraph3")}
				</p>
			</SectionCard>

			{/* Our Mission */}
			<SectionCard
				title={t("responsibleGambling.mission.title")}
				icon={Target}
			>
				<ContentSection>
					<p className="mb-4">
						{t("responsibleGambling.mission.content")}
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
					<p className="mb-4">
						{t("responsibleGambling.understanding.paragraph1")}
					</p>
					<p className="mb-4">
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
					<p className="mb-4">
						{t("responsibleGambling.tools.intro")}
					</p>
				</ContentSection>

				{/* Self-Exclusion */}
				<div className="mb-6">
					<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
						<Shield className="size-5" />
						{t("responsibleGambling.tools.selfExclusion.title")}
					</h3>
					<p className="mb-2">
						{t(
							"responsibleGambling.tools.selfExclusion.description"
						)}
					</p>
					<p className="text-sm">
						{t("responsibleGambling.tools.selfExclusion.contact")}
					</p>
				</div>

				{/* Cooling-Off Periods */}
				<div className="mb-6">
					<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
						<Clock className="size-5" />
						{t("responsibleGambling.tools.coolingOff.title")}
					</h3>
					<p className="mb-2">
						{t("responsibleGambling.tools.coolingOff.description")}
					</p>
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
						{t("responsibleGambling.tools.coolingOff.note")}
					</p>
				</div>

				{/* Deposit & Loss Awareness */}
				<div>
					<h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
						<DollarSign className="size-5" />
						{t("responsibleGambling.tools.depositAwareness.title")}
					</h3>
					<p>
						{t(
							"responsibleGambling.tools.depositAwareness.description"
						)}
					</p>
				</div>
			</SectionCard>

			{/* Underage Gambling Prevention */}
			<SectionCard
				title={t("responsibleGambling.underagePrevention.title")}
				icon={Baby}
			>
				<ContentSection>
					<p className="mb-4">
						{t("responsibleGambling.underagePrevention.paragraph1")}
					</p>
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
				<p className="mb-4">
					{t("responsibleGambling.helpSupport.intro")}
				</p>
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
							<p className="text-sm mb-2">
								{t(
									`responsibleGambling.helpSupport.organizations.${index}.description`
								)}
							</p>
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
			</SectionCard>

			{/* Responsible Gaming Principles */}
			<SectionCard
				title={t("responsibleGambling.principles.title")}
				icon={Shield}
			>
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
					<p className="mb-4">
						{t("responsibleGambling.playSmart.intro")}
					</p>
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
					<p className="mb-4 text-lg font-semibold">
						{t("responsibleGambling.finalMessage.paragraph1")}
					</p>
					<p className="mb-4">
						{t("responsibleGambling.finalMessage.paragraph2")}
					</p>
					<p className="text-sm">
						{t("responsibleGambling.finalMessage.contact")}
					</p>
				</ContentSection>
			</SectionCard>
		</div>
	);
}
