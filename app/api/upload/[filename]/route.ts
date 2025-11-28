import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    // 1. Get the filename from the URL
    const { filename } = await params;

    // 2. Define path to the root uploads folder
    const filePath = path.join(process.cwd(), "uploads", filename);

    try {
        // 3. Read the file from disk
        const fileBuffer = await readFile(filePath);

        // 4. Determine content type (default to generic binary if unknown)
        // You can simply stick to 'image/jpeg' or install 'mime' package: yarn add mime @types/mime
        // For now, let's do basic detection or default:
        const ext = path.extname(filename).toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".webp") contentType = "image/webp";
        else if (ext === ".gif") contentType = "image/gif";

        // 5. Return the image
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch  {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}