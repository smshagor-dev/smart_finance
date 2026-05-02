import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { publishLiveEvent } from "@/lib/live-events";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, and GIF images are allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image size must be 5MB or smaller" }, { status: 400 });
    }

    const extension = path.extname(file.name) || ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "profiles");
    const filePath = path.join(uploadDirectory, fileName);

    await mkdir(uploadDirectory, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    publishLiveEvent({ userId: user.id, resource: "profile", action: "uploaded" });

    return NextResponse.json({
      success: true,
      fileUrl: `/uploads/profiles/${fileName}`,
      originalName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
