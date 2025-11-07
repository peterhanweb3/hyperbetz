/**
 * PageHeader Component
 * Reusable header for legal and informational pages
 */

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	lastUpdated?: string;
}

export function PageHeader({ title, subtitle, lastUpdated }: PageHeaderProps) {
	return (
		<div className="space-y-3 border-b border-border pb-6">
			<h1 className="text-3xl font-bold tracking-tight text-foreground">
				{title}
			</h1>
			{subtitle && (
				<p className="text-base text-muted-foreground">{subtitle}</p>
			)}
			{lastUpdated && (
				<p className="text-sm text-muted-foreground/80">
					Last updated: {lastUpdated}
				</p>
			)}
		</div>
	);
}
