"use client";

import {
	PageHeader,
	SectionCard,
	ListSection,
	ContentSection,
} from "@/components/legal";
import { Shield, Heart, AlertCircle, Phone, Settings } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResponsibleGamblingPage() {
	const t = useT();

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<PageHeader
				title={t("responsibleGambling.title")}
				subtitle={t("responsibleGambling.subtitle")}
			/>

			<SectionCard variant="primary" icon={Heart}>
				<p className="text-base">
					{t("responsibleGambling.intro.paragraph1")}
				</p>
				<p>{t("responsibleGambling.intro.paragraph2")}</p>
			</SectionCard>

			<SectionCard
				title={t("responsibleGambling.sections.commitment.title")}
				icon={Shield}
			>
				<ContentSection>
					<p>
						{t("responsibleGambling.sections.commitment.content")}
					</p>
				</ContentSection>
			</SectionCard>

			<SectionCard
				title={t("responsibleGambling.sections.tools.title")}
				icon={Settings}
			>
				<ListSection
					items={[
						{
							title: t(
								"responsibleGambling.sections.tools.items.0.title"
							),
							content: t(
								"responsibleGambling.sections.tools.items.0.description"
							),
						},
						{
							title: t(
								"responsibleGambling.sections.tools.items.1.title"
							),
							content: t(
								"responsibleGambling.sections.tools.items.1.description"
							),
						},
						{
							title: t(
								"responsibleGambling.sections.tools.items.2.title"
							),
							content: t(
								"responsibleGambling.sections.tools.items.2.description"
							),
						},
						{
							title: t(
								"responsibleGambling.sections.tools.items.3.title"
							),
							content: t(
								"responsibleGambling.sections.tools.items.3.description"
							),
						},
					]}
				/>
			</SectionCard>

			<SectionCard
				title={t("responsibleGambling.sections.signs.title")}
				variant="warning"
				icon={AlertCircle}
			>
				<p>{t("responsibleGambling.sections.signs.intro")}</p>
				<ListSection
					items={t("responsibleGambling.sections.signs.list")
						.split("|")
						.map((sign: string) => ({
							content: sign,
						}))}
				/>
			</SectionCard>

			<SectionCard
				title={t("responsibleGambling.sections.help.title")}
				icon={Phone}
			>
				<p>{t("responsibleGambling.sections.help.intro")}</p>
				<div className="mt-4 space-y-3">
					<div className="rounded-lg border border-border bg-background p-4">
						<h4 className="font-semibold text-foreground mb-2">
							{t(
								"responsibleGambling.sections.help.organizations.0.name"
							)}
						</h4>
						<p className="text-sm mb-2">
							{t(
								"responsibleGambling.sections.help.organizations.0.description"
							)}
						</p>
						<a
							href={t(
								"responsibleGambling.sections.help.organizations.0.url"
							)}
							className="text-primary hover:underline text-sm"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t(
								"responsibleGambling.sections.help.organizations.0.url"
							)}
						</a>
					</div>
					<div className="rounded-lg border border-border bg-background p-4">
						<h4 className="font-semibold text-foreground mb-2">
							{t(
								"responsibleGambling.sections.help.organizations.1.name"
							)}
						</h4>
						<p className="text-sm mb-2">
							{t(
								"responsibleGambling.sections.help.organizations.1.description"
							)}
						</p>
						<a
							href={t(
								"responsibleGambling.sections.help.organizations.1.url"
							)}
							className="text-primary hover:underline text-sm"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t(
								"responsibleGambling.sections.help.organizations.1.url"
							)}
						</a>
					</div>
				</div>
			</SectionCard>

			<SectionCard
				title={t("responsibleGambling.sections.protection.title")}
			>
				<ContentSection>
					<p>
						{t("responsibleGambling.sections.protection.content")}
					</p>
				</ContentSection>
			</SectionCard>

			<div className="flex justify-center">
				<Link href="/profile">
					<Button size="lg" className="gap-2">
						<Settings className="size-4" />
						{t("responsibleGambling.manageSettingsButton")}
					</Button>
				</Link>
			</div>
		</div>
	);
}
