"use server";


import prisma from "@/modules/admin/lib/db";
import { getSession } from "@/modules/auth/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPost(prevState: any, formData: FormData) {
	const session = await getSession();
	if (!session) return { error: "Unauthorized" };

	const title = formData.get("title") as string;
	const slug = formData.get("slug") as string;
	const content = formData.get("content") as string;
	const excerpt = formData.get("excerpt") as string;
	const coverImage = formData.get("coverImage") as string;
	const published = formData.get("published") === "on";
	const seoTitle = formData.get("seoTitle") as string;
	const seoDescription = formData.get("seoDescription") as string;
	const tags = formData.get("tags") as string; // Comma separated

	try {
		await prisma.post.create({
			data: {
				title,
				slug,
				content,
				excerpt,
				coverImage,
				published,
				seoTitle,
				seoDescription,
				authorId: session.id,
				tags: {
					connectOrCreate: tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean)
						.map((tag) => ({
							where: {
								slug: tag.toLowerCase().replace(/\s+/g, "-"),
							},
							create: {
								name: tag,
								slug: tag.toLowerCase().replace(/\s+/g, "-"),
							},
						})),
				},
			},
		});
	} catch (e) {
		console.error(e);
		return { error: "Failed to create post. Slug might be taken." };
	}

	revalidatePath("/admin/posts");
	revalidatePath("/blog");
	return { success: true };
}

export async function updatePost(
	id: string,
	prevState: any,
	formData: FormData
) {
	const session = await getSession();
	if (!session) return { error: "Unauthorized" };

	const title = formData.get("title") as string;
	const slug = formData.get("slug") as string;
	const content = formData.get("content") as string;
	const excerpt = formData.get("excerpt") as string;
	const coverImage = formData.get("coverImage") as string;
	const published = formData.get("published") === "on";
	const seoTitle = formData.get("seoTitle") as string;
	const seoDescription = formData.get("seoDescription") as string;
	const tags = formData.get("tags") as string;

	// First disconnect all tags, then connect new ones (simple approach)
	// Or just set.

	try {
		await prisma.post.update({
			where: { id },
			data: {
				title,
				slug,
				content,
				excerpt,
				coverImage,
				published,
				seoTitle,
				seoDescription,
				tags: {
					set: [], // Disconnect all
					connectOrCreate: tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean)
						.map((tag) => ({
							where: {
								slug: tag.toLowerCase().replace(/\s+/g, "-"),
							},
							create: {
								name: tag,
								slug: tag.toLowerCase().replace(/\s+/g, "-"),
							},
						})),
				},
			},
		});
	} catch (e) {
		return { error: "Failed to update post" };
	}

	revalidatePath("/admin/posts");
	revalidatePath("/blog");
	revalidatePath(`/blog/${slug}`);
	return { success: true };
}

export async function deletePost(id: string) {
	const session = await getSession();
	if (!session) return { error: "Unauthorized" };

	try {
		await prisma.post.delete({ where: { id } });
	} catch (e) {
		console.error(e);
		return { error: "Failed to delete post" };
	}

	revalidatePath("/admin/posts");
	revalidatePath("/blog");
	return { success: true };
}
