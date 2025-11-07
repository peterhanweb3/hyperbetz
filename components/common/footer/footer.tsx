"use client";

import Link from "next/link";
import { useT } from "@/hooks/useI18n";
import {
	Facebook,
	Twitter,
	Instagram,
	Youtube,
	Mail,
	Shield,
	HelpCircle,
	FileText,
	Info,
} from "lucide-react";

export function Footer() {
	const t = useT();
	const currentYear = new Date().getFullYear();

	const footerSections = [
		{
			title: t("footer.sections.company.title"),
			links: [
				{
					label: t("footer.sections.company.links.about"),
					href: "/about",
					icon: Info,
				},
				{
					label: t("footer.sections.company.links.providers"),
					href: "/providers",
				},
				{
					label: t("footer.sections.company.links.affiliate"),
					href: "/affiliate",
				},
				{
					label: t("footer.sections.company.links.bonus"),
					href: "/bonus",
				},
			],
		},
		{
			title: t("footer.sections.legal.title"),
			links: [
				{
					label: t("footer.sections.legal.links.privacy"),
					href: "/privacy",
					icon: Shield,
				},
				{
					label: t("footer.sections.legal.links.terms"),
					href: "/terms",
					icon: FileText,
				},
				{
					label: t("footer.sections.legal.links.gambling"),
					href: "/responsible-gambling",
					icon: Shield,
				},
				{
					label: t("footer.sections.legal.links.faqs"),
					href: "/faqs",
					icon: HelpCircle,
				},
			],
		},
		{
			title: t("footer.sections.games.title"),
			links: [
				{
					label: t("footer.sections.games.links.lobby"),
					href: "/lobby",
				},
				{
					label: t("footer.sections.games.links.slots"),
					href: "/games?category=slots",
				},
				{
					label: t("footer.sections.games.links.live"),
					href: "/games?category=live",
				},
				{
					label: t("footer.sections.games.links.sports"),
					href: "/games?category=sports",
				},
			],
		},
		{
			title: t("footer.sections.support.title"),
			links: [
				{
					label: t("footer.sections.support.links.help"),
					href: "/faqs",
					icon: HelpCircle,
				},
				{
					label: t("footer.sections.support.links.contact"),
					href: "mailto:support@hyperbetz.games",
					icon: Mail,
				},
			],
		},
	];

	const socialLinks = [
		{
			icon: Twitter,
			href: "https://twitter.com/hyperbetz",
			label: "Twitter",
		},
		{
			icon: Facebook,
			href: "https://facebook.com/hyperbetz",
			label: "Facebook",
		},
		{
			icon: Instagram,
			href: "https://instagram.com/hyperbetz",
			label: "Instagram",
		},
		{
			icon: Youtube,
			href: "https://youtube.com/@hyperbetz",
			label: "YouTube",
		},
	];

	return (
		<footer className="border-t border-border bg-card mt-auto">
			<div className="container mx-auto consistent-padding-x py-12">
				{/* Main Footer Content */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
					{footerSections.map((section, index) => (
						<div key={index} className="space-y-4">
							<h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
								{section.title}
							</h3>
							<ul className="space-y-2">
								{section.links.map((link, linkIndex) => {
									const Icon = link.icon;
									return (
										<li key={linkIndex}>
											<Link
												href={link.href}
												className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
											>
												{Icon && (
													<Icon className="size-4" />
												)}
												{link.label}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>

				{/* Divider */}
				<div className="border-t border-border my-8" />

				{/* Bottom Footer */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					{/* Logo & Copyright */}
					<div className="flex flex-col items-center md:items-start gap-2">
						<Link
							href="/"
							className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
						>
							HyperBetz
						</Link>
						<p className="text-sm text-muted-foreground">
							{t("footer.copyright", {
								year: currentYear.toString(),
							})}
						</p>
					</div>

					{/* Social Links */}
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground hidden md:block">
							{t("footer.followUs")}
						</span>
						{socialLinks.map((social, index) => {
							const Icon = social.icon;
							return (
								<Link
									key={index}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center size-10 rounded-full border border-border bg-background hover:bg-accent hover:border-primary transition-all"
									aria-label={social.label}
								>
									<Icon className="size-5 text-muted-foreground hover:text-primary transition-colors" />
								</Link>
							);
						})}
					</div>
				</div>

				{/* Disclaimer */}
				<div className="mt-8 pt-6 border-t border-border">
					<div className="space-y-3 text-xs text-muted-foreground text-center">
						<p className="flex items-center justify-center gap-2">
							<Shield className="size-4 text-primary" />
							{t("footer.disclaimer.line1")}
						</p>
						<p>{t("footer.disclaimer.line2")}</p>
						<p className="font-medium text-foreground">
							{t("footer.disclaimer.line3")}
						</p>
					</div>
				</div>

				{/* Payment & License Badges */}
				<div className="mt-8 flex flex-wrap justify-center items-center gap-4 opacity-60">
					<div className="text-xs text-muted-foreground px-3 py-1 rounded border border-border">
						🔒 SSL Encrypted
					</div>
					<div className="text-xs text-muted-foreground px-3 py-1 rounded border border-border">
						⚡ Instant Crypto
					</div>
					<div className="text-xs text-muted-foreground px-3 py-1 rounded border border-border">
						🎮 5000+ Games
					</div>
					<div className="text-xs text-muted-foreground px-3 py-1 rounded border border-border">
						🌍 Global Access
					</div>
				</div>
			</div>
		</footer>
	);
}
