"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useI18n";
import { Shield, Users, Globe, Zap, Award, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
	const t = useT();

	const stats = [
		{
			label: t("about.stats.0.label"),
			value: t("about.stats.0.value"),
			icon: Zap,
		},
		{
			label: t("about.stats.1.label"),
			value: t("about.stats.1.value"),
			icon: Users,
		},
		{
			label: t("about.stats.2.label"),
			value: t("about.stats.2.value"),
			icon: Globe,
		},
		{
			label: t("about.stats.3.label"),
			value: t("about.stats.3.value"),
			icon: Shield,
		},
	];

	const features = [
		{
			title: t("about.features.0.title"),
			description: t("about.features.0.description"),
			icon: Zap,
		},
		{
			title: t("about.features.1.title"),
			description: t("about.features.1.description"),
			icon: CheckCircle,
		},
		{
			title: t("about.features.2.title"),
			description: t("about.features.2.description"),
			icon: Shield,
		},
		{
			title: t("about.features.3.title"),
			description: t("about.features.3.description"),
			icon: Users,
		},
	];

	const providers = [
		"Pragmatic Play",
		"Red Tiger",
		"Microgaming",
		"KA Gaming",
		"Evolution",
		"NetEnt",
		"Play'n GO",
		"Hacksaw Gaming",
	];

	const values = [
		{
			title: t("about.sections.missionVisionValues.items.0.title"),
			content: t("about.sections.missionVisionValues.items.0.content"),
		},
		{
			title: t("about.sections.missionVisionValues.items.1.title"),
			content: t("about.sections.missionVisionValues.items.1.content"),
		},
		{
			title: t("about.sections.missionVisionValues.items.2.title"),
			content: t("about.sections.missionVisionValues.items.2.content"),
		},
	];

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("about.title")}
				</h1>
				<p className="text-muted-foreground">{t("about.subtitle")}</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.label}
							className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50"
						>
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="size-6 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold">
										{stat.value}
									</p>
									<p className="text-sm text-muted-foreground">
										{stat.label}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Who We Are */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.sections.whoWeAre.title")}
				</h2>
				<div className="space-y-4 text-muted-foreground">
					<p>{t("about.sections.whoWeAre.paragraph1")}</p>
					<p>{t("about.sections.whoWeAre.paragraph2")}</p>
				</div>
			</div>

			{/* Features Grid */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">
					{t("about.sections.whatMakesUsDifferent.title")}
				</h2>
				<div className="grid gap-4 md:grid-cols-2">
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<div
								key={feature.title}
								className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50"
							>
								<div className="mb-3 flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
										<Icon className="size-5 text-primary" />
									</div>
									<h3 className="font-semibold">
										{feature.title}
									</h3>
								</div>
								<p className="text-sm text-muted-foreground">
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>

			{/* Providers */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">
					{t("about.sections.providers.title")}
				</h2>
				<div className="rounded-lg border border-border bg-card space-y-4 p-6">
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{providers.map((provider) => (
							<div
								key={provider}
								className="flex items-center justify-center rounded-lg border border-border bg-background/50 p-4 text-center text-sm font-medium transition-colors hover:bg-accent/50"
							>
								{provider}
							</div>
						))}
					</div>
					<div className="flex justify-center items-center w-full gap-4">
						<Link href="/providers">
							<Button variant="outline">
								{t("about.sections.providers.seeAllButton")}
							</Button>
						</Link>
						<Link href="/games">
							<Button variant="outline">
								{t(
									"about.sections.providers.exploreGamesButton"
								)}
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Mission, Vision, Values */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">
					{t("about.sections.missionVisionValues.title")}
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					{values.map((item) => (
						<div
							key={item.title}
							className="rounded-lg border border-border bg-card p-6"
						>
							<h3 className="mb-3 font-semibold">{item.title}</h3>
							<p className="text-sm text-muted-foreground">
								{item.content}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* Responsible Gaming */}
			<div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
				<div className="mb-4 flex items-center gap-3">
					<Shield className="size-6 text-primary" />
					<h2 className="text-xl font-semibold">
						{t("about.sections.responsibleGaming.title")}
					</h2>
				</div>
				<div className="space-y-3 text-sm text-muted-foreground">
					<p>{t("about.sections.responsibleGaming.description")}</p>
					<div className="grid gap-3 md:grid-cols-2">
						<div className="flex gap-2 rounded-lg border border-border bg-card/50 p-3">
							<Award className="size-5 shrink-0 text-primary" />
							<div>
								<p className="font-medium text-foreground">
									{t(
										"about.sections.responsibleGaming.points.0.title"
									)}
								</p>
								<p className="text-xs">
									{t(
										"about.sections.responsibleGaming.points.0.description"
									)}
								</p>
							</div>
						</div>
						<div className="flex gap-2 rounded-lg border border-border bg-card/50 p-3">
							<Shield className="size-5 shrink-0 text-primary" />
							<div>
								<p className="font-medium text-foreground">
									{t(
										"about.sections.responsibleGaming.points.1.title"
									)}
								</p>
								<p className="text-xs">
									{t(
										"about.sections.responsibleGaming.points.1.description"
									)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Our Promise */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-4 text-xl font-semibold">
					{t("about.sections.ourPromise.title")}
				</h2>
				<div className="space-y-3 text-muted-foreground">
					<p>{t("about.sections.ourPromise.paragraph1")}</p>
					<p>{t("about.sections.ourPromise.paragraph2")}</p>
				</div>
			</div>

			{/* Description */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
					{t("about.sections.description.title")}
				</h2>
				<div className="space-y-6 text-muted-foreground leading-relaxed">
					{/* Introduction */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.intro.heading")}
						</h3>
						<p>
							<span className="font-semibold text-foreground">
								{t("about.sections.description.intro.brand")}
							</span>{" "}
							{t("about.sections.description.intro.paragraph1")}
						</p>
						<p>
							{t("about.sections.description.intro.paragraph2")}
						</p>
						<p>
							{t("about.sections.description.intro.paragraph3")}
						</p>
					</div>

					{/* Game Collection */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.games.heading")}
						</h3>
						<p>
							{t("about.sections.description.games.paragraph1")}{" "}
							<span className="font-semibold text-primary">
								{t("about.sections.description.games.count")}
							</span>
							{t("about.sections.description.games.paragraph2")}
						</p>
						<ul className="list-disc list-inside space-y-2 ml-4">
							<li>
								<span className="font-semibold text-foreground">
									{t(
										"about.sections.description.games.slots.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.games.slots.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-foreground">
									{t(
										"about.sections.description.games.liveCasino.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.games.liveCasino.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-foreground">
									{t(
										"about.sections.description.games.sports.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.games.sports.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-foreground">
									{t(
										"about.sections.description.games.poker.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.games.poker.description"
								)}
							</li>
						</ul>
					</div>

					{/* Technology */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.technology.heading")}
						</h3>
						<p>
							{t(
								"about.sections.description.technology.paragraph1"
							)}{" "}
							<span className="font-semibold text-primary">
								{t(
									"about.sections.description.technology.blockchain"
								)}
							</span>
							{t(
								"about.sections.description.technology.paragraph2"
							)}
						</p>
						<p>
							{t(
								"about.sections.description.technology.paragraph3"
							)}
						</p>
						<p>
							{t(
								"about.sections.description.technology.paragraph4"
							)}{" "}
							<span className="font-semibold text-primary">
								{t(
									"about.sections.description.technology.uptime"
								)}
							</span>
							{t(
								"about.sections.description.technology.paragraph5"
							)}
						</p>
					</div>

					{/* Security & Fair Play */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.security.heading")}
						</h3>
						<p>
							{t(
								"about.sections.description.security.paragraph1"
							)}{" "}
							<span className="font-semibold text-primary">
								{t("about.sections.description.security.rng")}
							</span>
							{t(
								"about.sections.description.security.paragraph2"
							)}
						</p>
						<p>
							{t(
								"about.sections.description.security.paragraph3"
							)}
						</p>
						<p>
							{t(
								"about.sections.description.security.paragraph4"
							)}
						</p>
					</div>

					{/* Global Reach */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.global.heading")}
						</h3>
						<p>
							{t("about.sections.description.global.paragraph1")}{" "}
							<span className="font-semibold text-primary">
								{t("about.sections.description.global.players")}
							</span>{" "}
							{t("about.sections.description.global.paragraph2")}{" "}
							<span className="font-semibold text-primary">
								{t(
									"about.sections.description.global.countries"
								)}
							</span>
							{t("about.sections.description.global.paragraph3")}
						</p>
						<p>
							{t("about.sections.description.global.paragraph4")}
						</p>
					</div>

					{/* Payment Methods */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.payments.heading")}
						</h3>
						<p>
							{t(
								"about.sections.description.payments.paragraph1"
							)}
						</p>
						<p>
							{t(
								"about.sections.description.payments.paragraph2"
							)}{" "}
							<span className="font-semibold text-primary">
								{t(
									"about.sections.description.payments.instant"
								)}
							</span>
							{t(
								"about.sections.description.payments.paragraph3"
							)}
						</p>
					</div>

					{/* Mobile Experience */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.mobile.heading")}
						</h3>
						<p>
							{t("about.sections.description.mobile.paragraph1")}
						</p>
						<p>
							{t("about.sections.description.mobile.paragraph2")}
						</p>
					</div>

					{/* Customer Support */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.support.heading")}
						</h3>
						<p>
							{t("about.sections.description.support.paragraph1")}{" "}
							<span className="font-semibold text-primary">
								{t(
									"about.sections.description.support.availability"
								)}
							</span>
							{t("about.sections.description.support.paragraph2")}
						</p>
						<p>
							{t("about.sections.description.support.paragraph3")}
						</p>
					</div>

					{/* Responsible Gaming */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t(
								"about.sections.description.responsible.heading"
							)}
						</h3>
						<p>
							{t(
								"about.sections.description.responsible.paragraph1"
							)}
						</p>
						<p>
							{t(
								"about.sections.description.responsible.paragraph2"
							)}
						</p>
					</div>

					{/* Why Choose HyperBetz */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">
							{t("about.sections.description.whyChoose.heading")}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-4">
							<li>
								<span className="font-semibold text-primary">
									{t(
										"about.sections.description.whyChoose.point1.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.whyChoose.point1.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-primary">
									{t(
										"about.sections.description.whyChoose.point2.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.whyChoose.point2.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-primary">
									{t(
										"about.sections.description.whyChoose.point3.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.whyChoose.point3.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-primary">
									{t(
										"about.sections.description.whyChoose.point4.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.whyChoose.point4.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-primary">
									{t(
										"about.sections.description.whyChoose.point5.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.whyChoose.point5.description"
								)}
							</li>
							<li>
								<span className="font-semibold text-primary">
									{t(
										"about.sections.description.whyChoose.point6.title"
									)}
								</span>{" "}
								{t(
									"about.sections.description.whyChoose.point6.description"
								)}
							</li>
						</ul>
					</div>

					{/* Closing Statement */}
					<div className="space-y-4 border-t border-border pt-6 mt-6">
						<p className="text-base">
							{t("about.sections.description.closing.paragraph1")}
						</p>
						<p className="text-lg font-semibold text-foreground">
							{t("about.sections.description.closing.tagline")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
