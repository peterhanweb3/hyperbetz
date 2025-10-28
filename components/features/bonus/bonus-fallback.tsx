export const BonusFallback = () => {
	return (
		<div className="space-y-8">
			{/* Header skeleton */}
			<div className="flex items-center gap-3">
				<div className="h-12 w-12 bg-muted rounded-xl animate-pulse" />
				<div className="space-y-2">
					<div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
				</div>
			</div>

			{/* Stats cards skeleton */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className="border rounded-xl p-6 space-y-4 bg-card"
					>
						<div className="flex items-center justify-between">
							<div className="h-4 w-24 bg-muted rounded animate-pulse" />
							<div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
						</div>
						<div className="h-8 w-32 bg-muted rounded animate-pulse" />
					</div>
				))}
			</div>

			{/* Content skeleton */}
			<div className="border rounded-xl p-6 space-y-4 bg-card">
				<div className="h-6 w-48 bg-muted rounded animate-pulse" />
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="h-12 w-full bg-muted rounded animate-pulse"
						/>
					))}
				</div>
			</div>
		</div>
	);
};
