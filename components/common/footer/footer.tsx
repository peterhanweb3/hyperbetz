"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/hooks/useI18n";
import {
	Facebook,
	Twitter,
	Instagram,
	Youtube,
	Shield,
	HelpCircle,
	FileText,
	Info,
} from "lucide-react";
import { SeoContentSection } from "./seo-content-section";

export function Footer() {
	const t = useT();
	const currentYear = new Date().getFullYear();

	// Network logos
	const networks = [
		{
			name: "Ethereum",
			src: "/assets/footer/ethereum-eth-crypto-casino-logo.webp",
		},
		{
			name: "Arbitrum",
			src: "/assets/footer/arbitrum-crypto-casino-logo-B5Vr.webp",
		},
		{
			name: "Polygon",
			src: "/assets/footer/polygon-crypto-casino-logo-MYu0j.webp",
		},
		{
			name: "Optimism",
			src: "/assets/footer/optimism-op-crypto-casino-logo-C.webp",
		},
		{
			name: "zkSync",
			src: "/assets/footer/zksync-crypto-casino-logo-RaGKfo.webp",
		},
		{
			name: "Linea",
			src: "/assets/footer/linea-crypto-casino-logo-D3ZlEjT.webp",
		},
		{
			name: "BNB Chain",
			src: "/assets/footer/binance-smart-chain-bsc-crypto-c.webp",
		},
		{
			name: "Avalanche",
			src: "/assets/footer/avalanche-defi-crypto-casino-log.webp",
		},
		{
			name: "Base",
			src: "/assets/footer/base-network-crypto-casino-logo.webp",
		},
	];

	// Cryptocurrencies
	const cryptocurrencies = [
		{
			name: "USDC",
			src: "/assets/footer/usd-coin-usdc-crypto-casino-logo.webp",
		},
		{
			name: "USDT",
			src: "/assets/footer/tether-usdt-crypto-casino-logo-D.webp",
		},
	];

	// Security & Fair Play
	const securityLogos = [
		{
			name: "Infura",
			src: "/assets/footer/infura-api-crypto-casino-CCHEgGZ.webp",
		},
		{
			name: "Alchemy",
			src: "/assets/footer/alchemy-api-crypto-casino-DEd6Xf.webp",
		},
		{
			name: "QuickNode",
			src: "/assets/footer/quicknode-crypto-casino-node-BZv.webp",
		},
		{
			name: "Chainlink VRF",
			src: "/assets/footer/chainlink-vrf-crypto-casino-Ck4i.webp",
		},
		{
			name: "Blockchain Secure",
			src: "/assets/footer/blockchain-secure-crypto-casino.webp",
		},
		{
			name: "Responsible Gaming",
			src: "/assets/footer/responsible-crypto-casino-bettin.webp",
		},
		{
			name: "SSL Secure",
			src: "/assets/footer/ssl-secure-crypto-casino-USsAYwz.webp",
		},
		{
			name: "18+",
			src: "/assets/footer/18plus-crypto-casino-betting-yy8.webp",
		},
	];

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
				// {
				// 	label: t("footer.sections.support.links.contact"),
				// 	href: "mailto:support@hyperbetz.games",
				// 	icon: Mail,
				// },
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
		<>
			{/* SEO Content Section */}
			<SeoContentSection />

			{/* Main Footer */}
			<footer className="border-t border-border bg-card mb-10 md:mb-0">
				<div className="container mx-auto consistent-padding-x py-12">
					{/* Main Footer Content */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
						{footerSections.map((section, index) => (
							<div key={index} className="space-y-4">
								<h3 className="font-semibold text-foreground text-sm">
									{section.title}
								</h3>
								<ul className="space-y-2.5">
									{section.links.map((link, linkIndex) => {
										const Icon = link.icon;
										return (
											<li key={linkIndex}>
												<Link
													href={link.href}
													className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
												>
													{link.label}
												</Link>
											</li>
										);
									})}
								</ul>
							</div>
						))}
					</div>

					{/* Network Section */}
					<div className="mb-10">
						<h3 className="text-sm font-semibold text-foreground mb-5">
							Network
						</h3>
						<div className="flex flex-wrap items-center gap-8 py-2">
							{networks.map((network, index) => (
								<div
									key={index}
									className="relative h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
								>
									<Image
										src={network.src}
										alt={network.name}
										width={80}
										height={32}
										className="h-8 w-auto object-contain"
									/>
								</div>
							))}
						</div>
					</div>

					{/* Cryptocurrencies Section */}
					<div className="mb-10">
						<h3 className="text-sm font-semibold text-foreground mb-5">
							Cryptocurrencies
						</h3>
						<div className="flex flex-wrap items-center gap-8 py-2">
							{cryptocurrencies.map((crypto, index) => (
								<div
									key={index}
									className="relative h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
								>
									<Image
										src={crypto.src}
										alt={crypto.name}
										width={80}
										height={32}
										className="h-8 w-auto object-contain"
									/>
								</div>
							))}
						</div>
					</div>

					{/* Security & Fair Play Section */}
					<div className="mb-12">
						<h3 className="text-sm font-semibold text-foreground mb-5">
							Security &amp; Fair Play
						</h3>
						<div className="flex flex-wrap items-center gap-8 py-2">
							{securityLogos.map((logo, index) => (
								<div
									key={index}
									className="relative h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
								>
									<Image
										src={logo.src}
										alt={logo.name}
										width={80}
										height={32}
										className="h-8 w-auto object-contain"
									/>
								</div>
							))}
						</div>
					</div>

					{/* Divider */}
					<div className="border-t border-border my-8" />

					{/* Bottom Footer */}
					<div className="flex flex-col md:flex-row justify-between items-center lg:items-start gap-6">
						{/* Logo & Copyright */}
						<div className="flex flex-col items-center md:items-start gap-3">
							<Link
								href="/"
								className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
							>
								HyperBetz
							</Link>
							<p className="text-sm tracking-wider max-w-3xl text-muted-foreground">
								A multi-award-winning crypto gaming platform.
								With a player-centric approach, HyperBetz
								satisfies millions of gamblers globally.
								HyperBetz prioritizes its community, ensuring a
								continuously engaging and entertaining
								experience.
							</p>
							<p className="text-xs text-muted-foreground">
								{t("footer.copyright", {
									year: currentYear.toString(),
								})}
							</p>
						</div>

						{/* Social Links */}
						<div className="flex flex-col items-center md:items-end gap-4">
							<span className="text-sm text-muted-foreground">
								{t("footer.followUs")}
							</span>
							<div className="flex items-center gap-3">
								{socialLinks.map((social, index) => {
									const Icon = social.icon;
									return (
										<Link
											key={index}
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center justify-center size-10 rounded-full bg-accent hover:bg-primary/10 hover:text-primary transition-all"
											aria-label={social.label}
										>
											<Icon className="size-4" />
										</Link>
									);
								})}
							</div>
						</div>
					</div>

					{/* Disclaimer */}
					{/* <div className="mt-8 pt-6 border-t border-border">
						<div className="space-y-2 text-xs text-muted-foreground text-center">
							<p className="flex items-center justify-center gap-2 font-medium">
								<Shield className="size-4 text-primary" />
								{t("footer.disclaimer.line1")}
							</p>
							<p>{t("footer.disclaimer.line2")}</p>
							<p className="font-medium text-foreground">
								{t("footer.disclaimer.line3")}
							</p>
						</div>
					</div> */}
				</div>
			</footer>
		</>
	);
}
