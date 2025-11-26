"use client";

import { memo } from "react";
import { useT } from "@/hooks/useI18n";
import { Clock, Zap, Shield } from "lucide-react";

function ContactResponseTimeBase() {
	const t = useT();

	const responseItems = [
		{
			icon: <Zap className="h-5 w-5" />,
			title: t("contact.responseTime.liveChat.title"),
			time: t("contact.responseTime.liveChat.time"),
		},
		{
			icon: <Clock className="h-5 w-5" />,
			title: t("contact.responseTime.email.title"),
			time: t("contact.responseTime.email.time"),
		},
		{
			icon: <Shield className="h-5 w-5" />,
			title: t("contact.responseTime.priority.title"),
			time: t("contact.responseTime.priority.time"),
		},
	];

	return (
		<div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
			<h2 className="mb-4 text-xl font-semibold text-foreground">
				{t("contact.responseTime.title")}
			</h2>
			<p className="mb-6 text-sm text-muted-foreground">
				{t("contact.responseTime.description")}
			</p>
			<div className="grid gap-4 sm:grid-cols-3">
				{responseItems.map((item, index) => (
					<div
						key={index}
						className="flex items-center gap-3 rounded-md bg-background/60 p-3 backdrop-blur-sm"
					>
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
							{item.icon}
						</div>
						<div>
							<p className="text-sm font-medium text-foreground">
								{item.title}
							</p>
							<p className="text-xs text-muted-foreground">
								{item.time}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export const ContactResponseTime = memo(ContactResponseTimeBase);
