/**
 * SectionCard Component
 * Reusable card for content sections
 */

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
	title?: string;
	icon?: LucideIcon;
	children: ReactNode;
	variant?: "default" | "primary" | "warning";
	className?: string;
}

export function SectionCard({
	title,
	icon: Icon,
	children,
	variant = "default",
	className = "",
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
						<h2 className="text-xl font-semibold text-foreground">
							{title}
						</h2>
					)}
				</div>
			)}
			<div className="space-y-4 text-muted-foreground">{children}</div>
		</div>
	);
}
