"use client";

import { memo } from "react";
import { useT } from "@/hooks/useI18n";

function ContactHeaderBase() {
	const t = useT();

	return (
		<div className="space-y-3">
			<h1 className="text-3xl font-bold tracking-tight text-foreground">
				{t("contact.title")}
			</h1>
			<p className="text-lg text-muted-foreground max-w-2xl">
				{t("contact.subtitle")}
			</p>
		</div>
	);
}

export const ContactHeader = memo(ContactHeaderBase);
