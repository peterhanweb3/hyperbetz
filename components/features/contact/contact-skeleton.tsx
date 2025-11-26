export function ContactPageSkeleton() {
	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y animate-pulse">
			{/* Header Skeleton */}
			<div className="space-y-3">
				<div className="h-9 w-48 rounded-md bg-muted" />
				<div className="h-5 w-96 max-w-full rounded-md bg-muted" />
			</div>

			{/* Contact Methods Grid Skeleton */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="rounded-lg border border-border bg-card p-6"
					>
						<div className="flex items-start gap-4">
							<div className="h-12 w-12 rounded-lg bg-muted" />
							<div className="flex-1 space-y-2">
								<div className="h-5 w-24 rounded bg-muted" />
								<div className="h-4 w-full rounded bg-muted" />
								<div className="h-4 w-3/4 rounded bg-muted" />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Form Skeleton */}
			<div className="rounded-lg border border-border bg-card p-6">
				<div className="h-6 w-40 rounded bg-muted mb-6" />
				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<div className="h-4 w-16 rounded bg-muted" />
						<div className="h-10 w-full rounded-md bg-muted" />
					</div>
					<div className="space-y-2">
						<div className="h-4 w-16 rounded bg-muted" />
						<div className="h-10 w-full rounded-md bg-muted" />
					</div>
					<div className="space-y-2 md:col-span-2">
						<div className="h-4 w-20 rounded bg-muted" />
						<div className="h-10 w-full rounded-md bg-muted" />
					</div>
					<div className="space-y-2 md:col-span-2">
						<div className="h-4 w-20 rounded bg-muted" />
						<div className="h-32 w-full rounded-md bg-muted" />
					</div>
				</div>
				<div className="mt-6 h-10 w-32 rounded-md bg-muted" />
			</div>

			{/* FAQ Section Skeleton */}
			<div className="rounded-lg border border-border bg-card p-6">
				<div className="h-6 w-56 rounded bg-muted mb-6" />
				<div className="space-y-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="h-14 w-full rounded-md bg-muted"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
