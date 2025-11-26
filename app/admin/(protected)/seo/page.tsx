import { getSeoPages } from "@/modules/seo/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DeleteSeoPageButton } from "@/modules/seo/components/DeleteSeoPageButton";

export default async function SeoPagesList() {
	const pages = await getSeoPages();

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						SEO Landing Pages
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage dynamic SEO pages for targeted keywords
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/seo/new">
						<Plus className="mr-2 h-4 w-4" />
						Create Page
					</Link>
				</Button>
			</div>

			<div className="grid gap-4">
				{pages.map(
					(page: {
						id: string;
						slug: string;
						title: string;
						published: boolean;
						updatedAt: Date;
					}) => (
						<Card key={page.id} className="overflow-hidden">
							<CardContent className="p-6">
								<div className="flex items-center justify-between gap-4">
									<div className="space-y-2 flex-1 min-w-0">
										<div className="flex items-center gap-3 flex-wrap">
											<h3 className="font-semibold text-lg truncate">
												{page.title}
											</h3>
											<Badge
												variant={
													page.published
														? "default"
														: "secondary"
												}
											>
												{page.published
													? "Published"
													: "Draft"}
											</Badge>
										</div>
										<div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
											<code className="bg-muted px-2 py-1 rounded font-mono text-xs">
												/{page.slug}
											</code>
											<span className="hidden sm:inline">
												•
											</span>
											<span className="text-xs">
												Updated{" "}
												{format(
													new Date(page.updatedAt),
													"MMM d, yyyy"
												)}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-2 flex-shrink-0">
										<Button
											variant="ghost"
											size="icon"
											asChild
										>
											<Link
												href={`/${page.slug}`}
												target="_blank"
											>
												<ExternalLink className="h-4 w-4" />
											</Link>
										</Button>
										<Button
											variant="outline"
											size="icon"
											asChild
										>
											<Link
												href={`/admin/seo/${page.id}`}
											>
												<Edit className="h-4 w-4" />
											</Link>
										</Button>
										<DeleteSeoPageButton
											pageId={page.id}
											pageTitle={page.title}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				)}

				{pages.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
						<Plus className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							No SEO pages found
						</h3>
						<p className="text-muted-foreground mb-4 max-w-md">
							Create your first landing page to start ranking for
							targeted keywords
						</p>
						<Button asChild>
							<Link href="/admin/seo/new">
								<Plus className="mr-2 h-4 w-4" />
								Create Page
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
