// import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import { getSession } from "@/modules/auth/lib/auth";

// export async function POST(request: NextRequest) {
// 	const session = await getSession();
// 	if (!session) {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	const formData = await request.formData();
// 	const file = formData.get("file") as File;

// 	if (!file) {
// 		return NextResponse.json(
// 			{ error: "No file uploaded" },
// 			{ status: 400 }
// 		);
// 	}

// 	const buffer = Buffer.from(await file.arrayBuffer());
// 	// Sanitize filename: remove special characters, replace spaces with hyphens, convert to lowercase
// 	const sanitizedName = file.name
// 		.toLowerCase()
// 		.replace(/[^a-z0-9.\-]/g, "-") // Replace any non-alphanumeric chars (except dots and hyphens) with hyphens
// 		.replace(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
// 		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
// 	const filename = Date.now() + "-" + sanitizedName;
// 	const uploadDir = path.join(process.cwd(), "/public/assets/uploads");

// 	try {
// 		// Create uploads directory if it doesn't exist
// 		await mkdir(uploadDir, { recursive: true });

// 		await writeFile(path.join(uploadDir, filename), buffer);
// 		return NextResponse.json({
// 			url: `/assets/uploads/${filename}`,
// 		});
// 	} catch (error) {
// 		console.error("Upload failed:", error);
// 		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
// 	}
// }

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/modules/auth/lib/auth";

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file") as File;

	if (!file) {
		return NextResponse.json(
			{ error: "No file uploaded" },
			{ status: 400 }
		);
	}

	const buffer = Buffer.from(await file.arrayBuffer());

	// Sanitize filename
	const sanitizedName = file.name
		.toLowerCase()
		.replace(/[^a-z0-9.\-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	const filename = Date.now() + "-" + sanitizedName;

	// CHANGE 1: Save to a persistent "uploads" directory in project root (not public)
	const uploadDir = path.join(process.cwd(), "uploads");

	try {
		await mkdir(uploadDir, { recursive: true });
		await writeFile(path.join(uploadDir, filename), buffer);

		// CHANGE 2: Return a URL pointing to our new API route
		return NextResponse.json({ url: `/api/upload/${filename}` });
	} catch (error) {
		console.error("Upload failed:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
