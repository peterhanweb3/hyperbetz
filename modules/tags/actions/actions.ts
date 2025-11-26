"use server";

import prisma from "@/modules/admin/lib/db";
import { getSession } from "@/modules/auth/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTag(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  try {
    await prisma.tag.create({
      data: { name, slug },
    });
  } catch (e) {
    return { error: "Failed to create tag. Name might be taken." };
  }

  revalidatePath("/admin/tags");
  return { success: true };
}

export async function deleteTag(id: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.tag.delete({ where: { id } });
  } catch (e) {
    return { error: "Failed to delete tag" };
  }

  revalidatePath("/admin/tags");
  return { success: true };
}
