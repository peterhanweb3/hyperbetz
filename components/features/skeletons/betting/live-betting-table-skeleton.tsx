import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";

export function LiveBettingTableSkeleton({
	className,
}: {
	className?: string;
}) {
	return (
		<div className={cn("w-full space-y-4", className)}>
			{/* Stats Cards Skeleton */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-3"
					>
						<Skeleton className="h-3 w-16 mb-2 bg-linear-to-br from-muted/40 to-muted/20" />
						<Skeleton className="h-6 w-20 bg-linear-to-br from-muted/40 to-muted/20" />
						<div className="absolute inset-0 rounded-lg bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
					</div>
				))}
			</div>

			{/* Header Skeleton */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="relative">
						<Skeleton className="h-8 w-48 bg-linear-to-br from-muted/50 to-muted/30" />
						<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 animate-pulse" />
					</div>
					<Skeleton className="h-4 w-64 bg-linear-to-br from-muted/40 to-muted/20" />
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<Skeleton className="w-2 h-2 rounded-full bg-linear-to-br from-muted/40 to-muted/20" />
						<Skeleton className="h-4 w-16 bg-linear-to-br from-muted/40 to-muted/20" />
					</div>
					<Button variant="outline" size="sm" disabled>
						<Skeleton className="h-4 w-12 bg-linear-to-br from-muted/40 to-muted/20" />
					</Button>
				</div>
			</div>

			{/* Tabs Skeleton */}
			<Tabs value="all">
				<TabsList className="grid w-full grid-cols-3 max-w-md">
					{["all", "win", "lose"].map((tab) => (
						<TabsTrigger
							key={tab}
							value={tab}
							disabled
							className="text-xs"
						>
							<Skeleton className="h-4 w-16 bg-linear-to-br from-muted/40 to-muted/20" />
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="all" className="mt-4">
					<div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
						<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 animate-pulse pointer-events-none" />

						<div className="relative max-h-[600px] overflow-hidden">
							<Table>
								<TableHeader className="sticky top-0 bg-background/80 backdrop-blur-md z-10">
									<TableRow className="border-border/50">
										{[16, 12, 16, 20, 12, 20, 12].map(
											(w, i) => (
												<TableHead
													key={i}
													className={cn(
														"font-semibold text-foreground",
														i >= 4 && "text-right",
														i === 5 && "text-center"
													)}
												>
													<Skeleton
														className={cn(
															`h-4 w-${w}`,
															i >= 4 && "ml-auto",
															i === 5 &&
																"mx-auto",
															"bg-linear-to-br from-muted/40 to-muted/20"
														)}
													/>
												</TableHead>
											)
										)}
									</TableRow>
								</TableHeader>

								<TableBody>
									{Array.from({ length: 12 }).map(
										(_, index) => (
											<TableRow
												key={index}
												className="hover:bg-primary/5 transition-all duration-300 border-border/30"
											>
												<TableCell>
													<Skeleton className="h-4 w-32 bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-16 bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-20 rounded-full bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-24 bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
												<TableCell className="text-right">
													<Skeleton className="h-4 w-16 ml-auto bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
												<TableCell className="text-center">
													<Skeleton className="h-4 w-12 mx-auto bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
												<TableCell className="text-right">
													<Skeleton className="h-6 w-20 ml-auto rounded-md bg-linear-to-br from-muted/40 to-muted/20" />
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
