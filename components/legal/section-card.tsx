/**
 * SectionCard Component
 * Reusable card for content sections
 */

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
	title?: string;
	intro?: string;
	outro?: string;
	icon?: LucideIcon;
	children: ReactNode;
	variant?: "default" | "primary" | "warning";
	className?: string;
	classNames?: {
		intro?: string;
		outro?: string;
		title?: string;
	};
}

export function SectionCard({
	title,
	intro,
	outro,
	icon: Icon,
	children,
	variant = "default",
	className = "",
	classNames,
}: SectionCardProps) {
	const variantClasses = {
		default: "border-border bg-card",
		primary: "border-primary/20 bg-primary/5",
		warning: "border-destructive/20 bg-destructive/5",
	};

	return (
		<div
			className={`rounded-lg border p-6 ${variantClasses[variant]} ${className}`}
		>
			{(title || Icon) && (
				<div className="mb-4 flex items-center gap-3">
					{Icon && (
						<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
							<Icon className="size-5 text-primary" />
						</div>
					)}
					{title && (
						<h2
							className={cn(
								"text-xl font-semibold text-foreground",
								classNames?.title
							)}
						>
							{title}
						</h2>
					)}
				</div>
			)}
			{intro && (
				<p
					className={cn(
						"mb-4 text-muted-foreground",
						classNames?.intro
					)}
				>
					{intro}
				</p>
			)}
			<div className="space-y-4 text-muted-foreground">{children}</div>
			{outro && (
				<p
					className={cn(
						"mt-4 text-muted-foreground",
						classNames?.outro
					)}
				>
					{outro}
				</p>
			)}
		</div>
	);
}
