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

	try {
		await prisma.seoPage.create({
			data: {
				...restData,
				carousels: normalizeCarousels(carousels),
				published: published ?? false,
			},
		});
		revalidatePath("/admin/seo");
		return { success: true };
	} catch (error) {
		// Prisma unique constraint error check
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return {
					success: false,
					error: "This slug is already in use. Please choose a different one.",
				};
			}
		}

		console.error("Error creating SEO page:", error);
		return {
			success: false,
			error: "An unexpected error occurred while saving the page.",
		};
	}
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
	const { carousels, published, ...restData } = data;

	try {
		await prisma.seoPage.update({
			where: { id },
			data: {
				...restData,
				carousels: normalizeCarousels(carousels),
				published: published ?? false,
			},
		});

		revalidatePath("/admin/seo");
		revalidatePath(`/${data.slug}`);
		return { success: true, error: null };
	} catch (error) {
		// P2002 error: Duplicate slug during update
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return {
					success: false,
					error: "This slug is already in use by another page.",
				};
			}
		}

		console.error("Error updating SEO page:", error);
		return {
			success: false,
			error: "Failed to update the page. Please try again.",
		};
	}
}

export async function deleteSeoPage(id: string) {
	try {
		await prisma.seoPage.delete({
			where: { id },
		});

		revalidatePath("/admin/seo");
		return { success: true, error: null };
	} catch (error) {
		// P2025 error: Record to delete does not exist
		console.error("Error deleting SEO page:", error);
		return {
			success: false,
			error: "Could not delete the page. It might have been already removed.",
		};
	}
}
