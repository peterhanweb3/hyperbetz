"use client";

import {
	PageHeader,
	SectionCard,
	ListSection,
	ContentSection,
} from "@/components/legal";
import { FileText } from "lucide-react";
import { useT } from "@/hooks/useI18n";

export default function TermsPage() {
	const t = useT();

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<PageHeader
				title={t("terms.title")}
				subtitle={t("terms.subtitle")}
				lastUpdated={t("terms.lastUpdated")}
			/>

			<SectionCard variant="primary" icon={FileText}>
				<p className="text-base">{t("terms.intro")}</p>
			</SectionCard>

			{Array.from({ length: 12 }).map((_, index) => (
				<SectionCard
					key={index}
					title={t(`terms.sections.${index}.title`)}
				>
					<ContentSection>
						<p>{t(`terms.sections.${index}.content`)}</p>
						{t(`terms.sections.${index}.hasPoints`) === "true" && (
							<ListSection
								items={JSON.parse(
									t(`terms.sections.${index}.points`) || "[]"
								).map((point: string) => ({
									content: point,
								}))}
							/>
						)}
					</ContentSection>
				</SectionCard>
			))}
		</div>
	);
}
