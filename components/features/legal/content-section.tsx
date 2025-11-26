/**
 * ContentSection Component
 * Reusable component for text content sections
 */

import { ReactNode } from "react";

interface ContentSectionProps {
	title?: string;
	children: ReactNode;
	className?: string;
}

export function ContentSection({
	title,
	children,
	className = "",
}: ContentSectionProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			{title && (
				<h3 className="text-lg font-semibold text-foreground">
					{title}
				</h3>
			)}
			<div className="space-y-3 text-muted-foreground leading-relaxed">
				{children}
			</div>
		</div>
	);
}
