import { getPosts } from "@/modules/blog/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, FileText } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeletePostButton } from "@/modules/blog/components/DeletePostButton";
// import { SearchInput } from "@/modules/blog/components/SearchInput";

export default async function PostsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string; search?: string }>;
}) {
	const { page, search } = await searchParams;
	const { posts } = await getPosts(Number(page) || 1, 20, search || "");

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Blog Posts
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage your blog content
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/posts/new">
						<Plus className="mr-2 h-4 w-4" /> New Post
					</Link>
				</Button>
			</div>

			{/* <div className="flex items-center gap-2">
				<SearchInput placeholder="Filter posts..." />
			</div> */}

			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">
								Title
							</TableHead>
							<TableHead className="font-semibold">
								Status
							</TableHead>
							<TableHead className="hidden md:table-cell font-semibold">
								Author
							</TableHead>
							<TableHead className="hidden md:table-cell font-semibold">
								Date
							</TableHead>
							<TableHead className="text-right font-semibold">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{posts.map((post) => (
							<TableRow key={post.id}>
								<TableCell className="font-medium">
									<div className="flex flex-col gap-1">
										<span className="truncate max-w-[250px] sm:max-w-[350px] font-semibold">
											{post.title}
										</span>
										<span className="text-xs text-muted-foreground truncate max-w-[250px]">
											/{post.slug}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											post.published
												? "default"
												: "secondary"
										}
									>
										{post.published ? "Published" : "Draft"}
									</Badge>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{post.author.username}
								</TableCell>
								<TableCell className="hidden md:table-cell text-muted-foreground">
									{new Date(
										post.createdAt
									).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">
													Actions
												</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>
												Actions
											</DropdownMenuLabel>
											<DropdownMenuItem asChild>
												<Link
													href={`/admin/posts/${post.id}`}
												>
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href={`/blog/${post.slug}`}
													target="_blank"
												>
													View Live
												</Link>
											</DropdownMenuItem>
											<DeletePostButton
												postId={post.id}
												postTitle={post.title}
											/>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
						{posts.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-12"
								>
									<div className="flex flex-col items-center justify-center gap-3">
										<FileText className="h-12 w-12 text-muted-foreground" />
										<div>
											<p className="font-semibold">
												No posts found
											</p>
											<p className="text-sm text-muted-foreground mt-1">
												Get started by creating your
												first post
											</p>
										</div>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
