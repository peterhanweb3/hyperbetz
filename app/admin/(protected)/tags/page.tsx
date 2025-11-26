import prisma from "@/modules/admin/lib/db";
import { TagForm } from "@/modules/tags/components/tag-form";
import { TagList } from "@/modules/tags/components/tag-list";

export default async function TagsPage() {
	const tags = await prisma.tag.findMany({
		orderBy: { name: "asc" },
		include: { _count: { select: { posts: true } } },
	});

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div>
				<h1 className="text-2xl font-bold mb-6">Tags</h1>
				<TagList tags={tags} />
			</div>
			<div>
				<h2 className="text-xl font-semibold mb-4">Create Tag</h2>
				<TagForm />
			</div>
		</div>
	);
}
