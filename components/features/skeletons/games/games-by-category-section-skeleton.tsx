import { Skeleton } from "@/components/ui/skeleton";

interface DynamicGameCarouselListSkeletonProps {
	totalRows?: number;
	totalColumns?: number;
}

export default function DynamicGameCarouselListSkeleton({
	totalRows = 3,
	totalColumns = 5,
}: DynamicGameCarouselListSkeletonProps) {
	return (
		<div className="space-y-12">
			{[...Array(totalRows)].map((_, i) => (
				<div key={i} className="w-full space-y-4">
					<div className="relative w-48">
						<Skeleton className="h-8 w-48 rounded-xl bg-linear-to-br from-muted/50 to-muted/30" />
						<div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
					</div>
					<div className="flex space-x-4">
						{[...Array(totalColumns)].map((_, j) => (
							<div key={j} className="relative flex-1">
								<Skeleton className="h-48 w-full rounded-2xl bg-linear-to-br from-muted/40 to-muted/20" />
								<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
