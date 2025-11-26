"use client";

import { memo } from "react";
import { useT } from "@/hooks/useI18n";
import { Mail, MessageCircle, Headphones, Clock } from "lucide-react";

interface ContactMethodCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	// action: string;
	href?: string;
	availability?: string;
}

function ContactMethodCard({
	icon,
	title,
	description,
	// action,
	href,
	availability,
}: ContactMethodCardProps) {
	const content = (
		<div className="group rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-md">
			<div className="flex items-start gap-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
					{icon}
				</div>
				<div className="flex-1 space-y-1">
					<h3 className="font-semibold text-foreground">{title}</h3>
					<p className="text-sm text-muted-foreground">
						{description}
					</p>
					{availability && (
						<div className="flex items-center gap-1.5 pt-2">
							<Clock className="h-3.5 w-3.5 text-muted-foreground" />
							<span className="text-xs text-muted-foreground">
								{availability}
							</span>
						</div>
					)}
					<p className="pt-2 text-sm font-medium text-primary">
						{title == "Email Support" ? "info@hyperbetz.com" : ""}
						{/* {action} */}
					</p>
				</div>
			</div>
		</div>
	);

	if (href) {
		return (
			// <a
			// 	href={href}
			// 	className="block"
			// 	target="_blank"
			// 	rel="noopener noreferrer"
			// >
			<div>{content}</div>
			// </a>
		);
	}

	return content;
}

function ContactMethodsBase() {
	const t = useT();

	const contactMethods: ContactMethodCardProps[] = [
		{
			icon: <MessageCircle className="h-6 w-6" />,
			title: t("contact.methods.liveChat.title"),
			description: t("contact.methods.liveChat.description"),
			// action: t("contact.methods.liveChat.action"),
			availability: t("contact.methods.liveChat.availability"),
		},
		{
			icon: <Mail className="h-6 w-6" />,
			title: t("contact.methods.email.title"),
			description: t("contact.methods.email.description"),
			// action: t("contact.methods.email.action"),
			href: "mailto:support@hyperbetz.com",
			availability: t("contact.methods.email.availability"),
		},
		{
			icon: <Headphones className="h-6 w-6" />,
			title: t("contact.methods.support.title"),
			description: t("contact.methods.support.description"),
			// action: t("contact.methods.support.action"),
			availability: t("contact.methods.support.availability"),
		},
	];

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{contactMethods.map((method, index) => (
				<ContactMethodCard key={index} {...method} />
			))}
		</div>
	);
}

export const ContactMethods = memo(ContactMethodsBase);
