"use server";

import prisma from "@/modules/admin/lib/db";
import { revalidatePath } from "next/cache";
import { CarouselsState } from "./components/SeoPageForm";
import { Prisma } from "@prisma/client";

const normalizeCarousels = (value?: CarouselsState): Prisma.InputJsonValue =>
	(value ?? {}) as unknown as Prisma.InputJsonValue;

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
	carousels?: CarouselsState;
	published?: boolean;
}) {
	const { carousels, published, ...restData } = data;

	await prisma.seoPage.create({
		data: {
			...restData,
			carousels: normalizeCarousels(carousels),
			published: published ?? false,
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
		carousels?: CarouselsState;
		published?: boolean;
	}
) {
	const { carousels, ...restData } = data;

	await prisma.seoPage.update({
		where: { id },
		data: {
			...restData,
			...(carousels !== undefined && {
				carousels: normalizeCarousels(carousels),
			}),
		},
	});
	revalidatePath("/admin/seo");
	revalidatePath(`/${data.slug}`);
	return { success: true };
}

export async function deleteSeoPage(id: string) {
	await prisma.seoPage.delete({
		where: { id },
	});
	revalidatePath("/admin/seo");
	return { success: true };
}
