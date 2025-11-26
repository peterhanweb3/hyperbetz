"use server";

import prisma from "@/modules/admin/lib/db";
import { revalidatePath } from "next/cache";

export async function getSeoPages() {
	return await prisma.seoPage.findMany({
		orderBy: { createdAt: "desc" },
	});
}

export async function getSeoPageById(id: string) {
	return await prisma.seoPage.findUnique({
		where: { id },
	});
}

export async function getSeoPageBySlug(slug: string) {
	return await prisma.seoPage.findUnique({
		where: { slug },
	});
}

export async function createSeoPage(data: {
	slug: string;
	title: string;
	description: string;
	content: string;
	keywords?: string;
	structuredData?: string;
	published?: boolean;
}) {
	await prisma.seoPage.create({
		data: {
			...data,
			published: data.published ?? false,
		},
	});
	revalidatePath("/admin/seo");
	return { success: true };
}

export async function updateSeoPage(
	id: string,
	data: {
		slug: string;
		title: string;
		description: string;
		content: string;
		keywords?: string;
		structuredData?: string;
		published?: boolean;
	}
) {
	await prisma.seoPage.update({
		where: { id },
		data,
	});
	revalidatePath("/admin/seo");
	revalidatePath(`/${data.slug}`); // Revalidate the public page
	return { success: true };
}

export async function deleteSeoPage(id: string) {
	await prisma.seoPage.delete({
		where: { id },
	});
	revalidatePath("/admin/seo");
	return { success: true };
}
