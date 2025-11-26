import prisma from "@/modules/admin/lib/db";

export async function getDashboardStats() {
	const [totalPosts, publishedPosts, drafts, totalTags] = await Promise.all([
		prisma.post.count(),
		prisma.post.count({ where: { published: true } }),
		prisma.post.count({ where: { published: false } }),
		prisma.tag.count(),
	]);

	return { totalPosts, publishedPosts, drafts, totalTags };
}

export async function getPosts(
	page = 1,
	limit = 10,
	search = "",
	status?: string
) {
	const skip = (page - 1) * limit;
	const where: any = {};

	if (search) {
		where.OR = [
			{ title: { contains: search } }, // SQLite doesn't support mode: 'insensitive' easily without extension, but Prisma might handle it or we accept case sensitive
			{ content: { contains: search } },
		];
	}

	if (status === "published") {
		where.published = true;
	} else if (status === "draft") {
		where.published = false;
	}

	const [posts, total] = await Promise.all([
		prisma.post.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: { author: true, tags: true },
		}),
		prisma.post.count({ where }),
	]);

	return { posts, total, totalPages: Math.ceil(total / limit) };
}

export async function getPostBySlug(slug: string) {
	return await prisma.post.findUnique({
		where: { slug },
		include: { author: true, tags: true },
	});
}

export async function getPostById(id: string) {
	return await prisma.post.findUnique({
		where: { id },
		include: { author: true, tags: true },
	});
}
