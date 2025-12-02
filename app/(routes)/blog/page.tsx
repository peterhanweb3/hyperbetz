import { getPosts } from "@/modules/blog/lib/api";
import { BlogCard } from "@/modules/blog/components/BlogCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/utils/seo/seo-provider";
import { getDynamicSEOConfig } from "@/lib/utils/seo/seo-config-loader";

export async function generateMetadata(): Promise<Metadata> {
	const config = await getDynamicSEOConfig();
	const siteName = config.defaults.siteName;

	return generateSEOMetadata({
		title: `Blog | ${siteName} - Strategies, Tips & Platform Updates`,
		description: `Discover expert betting strategies, platform updates, and winning tips from the ${siteName} team. Stay ahead of the game with our latest insights.`,
		keywords: [
			`${siteName} blog`,
			"betting strategies",
			"casino tips",
			"platform updates",
			"gaming insights",
			"crypto casino blog",
			"gambling strategies",
			"winning tips",
		],
		path: "/blog",
		pageType: "blog",
		ogTitle: `Blog | ${siteName} - Expert Strategies & Tips`,
		ogDescription: `Discover expert betting strategies, platform updates, and winning tips. Stay ahead of the game with our latest insights and community stories.`,
		ogType: "website",
		ogUrl: `${config.defaultDomain}/blog`,
		ogImage: "/assets/seo/og.png",
	});
}

export default async function BlogPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string; search?: string }>;
}) {
	const { page: pageParam, search: searchParam } = await searchParams;
	const page = Number(pageParam) || 1;
	const search = searchParam || "";
	const { posts, total } = await getPosts(page, 9, search, "published");

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="relative overflow-hidden border-b bg-gradient-to-br from-background via-primary/5 to-background py-24">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
				<div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

				<div className="container relative mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
						<TrendingUp className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium text-primary">
							Latest Insights & Strategies
						</span>
					</div>

					<h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
						The <span className="text-primary">Hyper</span>Blog
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
						Discover the latest game strategies, platform updates,
						and community stories.
						<br className="hidden sm:block" />
						Expert insights to elevate your game.
					</p>

					<div className="mx-auto max-w-lg mb-8">
						<form className="relative flex items-center">
							<Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
							<Input
								type="search"
								name="search"
								placeholder="Search articles..."
								defaultValue={search}
								className="h-14 rounded-full border-primary/20 bg-background/50 pl-12 text-lg backdrop-blur-sm focus-visible:ring-primary"
							/>
						</form>
					</div>

					{/* Quick Stats */}
					<div className="flex items-center justify-center gap-8 text-sm">
						<div className="flex items-center gap-2">
							<Zap className="h-4 w-4 text-primary" />
							<span className="text-muted-foreground">
								{total} Articles
							</span>
						</div>
						<div className="h-4 w-px bg-border" />
						<div className="flex items-center gap-2">
							<Target className="h-4 w-4 text-primary" />
							<span className="text-muted-foreground">
								Expert Tips
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Featured Categories */}
			<div className="border-b bg-muted/20 py-6">
				<div className="container mx-auto px-4">
					<div className="flex flex-wrap items-center justify-center gap-3">
						<span className="text-sm font-medium text-muted-foreground">
							Browse by topic:
						</span>
						<Link href="/blog?tag=strategy">
							<Badge
								variant="secondary"
								className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
							>
								Strategy
							</Badge>
						</Link>
						<Link href="/blog?tag=news">
							<Badge
								variant="secondary"
								className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
							>
								News
							</Badge>
						</Link>
						<Link href="/blog?tag=tips">
							<Badge
								variant="secondary"
								className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
							>
								Tips & Tricks
							</Badge>
						</Link>
						<Link href="/blog?tag=updates">
							<Badge
								variant="secondary"
								className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
							>
								Platform Updates
							</Badge>
						</Link>
					</div>
				</div>
			</div>

			{/* Content Grid */}
			<div className="container mx-auto px-4 py-20">
				{posts.length > 0 ? (
					<>
						<div className="mb-8 flex items-center justify-between">
							<h2 className="text-2xl font-bold">
								{search
									? `Search results for "${search}"`
									: "Latest Articles"}
							</h2>
							<p className="text-sm text-muted-foreground">
								Showing {posts.length} of {total} posts
							</p>
						</div>

						<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{posts.map((post, index) => (
								<BlogCard
									key={post.id}
									post={post}
									index={index}
								/>
							))}
						</div>

						{/* Pagination */}
						{total > 9 && (
							<div className="mt-12 flex items-center justify-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
								>
									Previous
								</Button>
								<div className="flex items-center gap-1">
									{Array.from(
										{ length: Math.ceil(total / 9) },
										(_, i) => (
											<Button
												key={i}
												variant={
													page === i + 1
														? "default"
														: "ghost"
												}
												size="sm"
												asChild
											>
												<Link
													href={`/blog?page=${i + 1}${
														search
															? `&search=${search}`
															: ""
													}`}
												>
													{i + 1}
												</Link>
											</Button>
										)
									)}
								</div>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= Math.ceil(total / 9)}
								>
									Next
								</Button>
							</div>
						)}
					</>
				) : (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<div className="mb-4 rounded-full bg-muted p-6">
							<Search className="h-10 w-10 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold">
							No posts found
						</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search terms or browse all posts.
						</p>
						<Button asChild>
							<Link href="/blog">View All Posts</Link>
						</Button>
					</div>
				)}
			</div>

			{/* Newsletter CTA */}
			<div className="border-t bg-muted/20 py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
					<p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
						Get the latest strategies, tips, and platform updates
						delivered straight to your inbox.
					</p>
					<div className="flex items-center justify-center gap-2 max-w-md mx-auto">
						<Input
							placeholder="Enter your email"
							type="email"
							className="h-12"
						/>
						<Button className="h-12 px-8">Subscribe</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
