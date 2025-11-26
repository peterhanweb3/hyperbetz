/**
 * ListSection Component
 * Reusable component for numbered or bulleted lists
 */

import { ReactNode } from "react";

interface ListSectionProps {
	title?: string;
	items: Array<{
		title?: string;
		content: ReactNode;
		subItems?: string[];
	}>;
	ordered?: boolean;
	className?: string;
}

export function ListSection({
	title,
	items,
	ordered = false,
	className = "",
}: ListSectionProps) {
	const ListTag = ordered ? "ol" : "ul";
	const listStyle = ordered
		? "list-decimal space-y-6"
		: "list-disc space-y-4";

	return (
		<div className={`space-y-4 ${className}`}>
			{title && (
				<h3 className="text-lg font-semibold text-foreground">
					{title}
				</h3>
			)}
			<ListTag className={`${listStyle} ml-6 text-muted-foreground`}>
				{items.map((item, index) => (
					<li key={index} className="pl-2">
						{item.title && (
							<strong className="text-foreground">
								{item.title}
								{typeof item.content === "string" ? ": " : ""}
							</strong>
						)}
						{item.content}
						{item.subItems && item.subItems.length > 0 && (
							<ul className="mt-2 ml-4 list-disc space-y-1">
								{item.subItems.map((subItem, subIndex) => (
									<li key={subIndex} className="text-sm">
										{subItem}
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ListTag>
		</div>
	);
}
