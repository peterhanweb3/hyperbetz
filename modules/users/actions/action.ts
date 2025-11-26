"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/modules/admin/lib/db";
import { getSession } from "@/modules/auth/lib/auth";
import { hashPassword, verifyPassword } from "@/modules/auth/lib/password";

export async function createUser(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Only Super Admins can create users." };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!username || !password || !role) {
    return { error: "All fields are required" };
  }

  try {
    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { error: "Failed to create user. Username might be taken." };
  }
}

export async function deleteUser(id: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  if (session.id === id) {
    return { error: "Cannot delete yourself" };
  }

  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete user" };
  }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized - No active session" };
  }

  if (!session.id) {
    return { error: "Invalid session - No user ID found" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  try {
    // Get current user with detailed logging
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      console.error(
        "Password update failed: User not found for ID:",
        session.id
      );
      return {
        error: `User not found (ID: ${session.id?.substring(0, 8)}...)`,
      };
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password updated successfully" };
  } catch (e) {
    console.error("Password update error:", e);
    return { error: "Failed to update password. Please try again." };
  }
}
