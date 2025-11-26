"use server";

import { encrypt } from "@/modules/auth/lib/auth";
import { cookies } from "next/headers";
import { verifyPassword } from "@/modules/auth/lib/password";
import prisma from "@/modules/admin/lib/db";

export async function loginAction(prevState: any, formData: FormData) {
	const username = formData.get("username") as string;
	const password = formData.get("password") as string;

	if (!username || !password) {
		return { error: "Username and password are required" };
	}

	const user = await prisma.user.findUnique({
		where: { username },
	});

	if (!user) {
		return { error: "Invalid credentials" };
	}

	const isValid = await verifyPassword(password, user.password);

	if (!isValid) {
		return { error: "Invalid credentials" };
	}

	const session = await encrypt({
		id: user.id,
		username: user.username,
		role: user.role,
	});

	const cookieStore = await cookies();
	cookieStore.set("blog_session", session, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24, // 1 day
		path: "/",
	});

	return { success: true };
}

export async function logoutAction() {
	const cookieStore = await cookies();
	cookieStore.set("blog_session", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
	return { success: true };
}
