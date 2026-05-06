import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireUser } from "../../../../lib/auth.js";
import { publishLiveEvent } from "../../../../lib/live-events.js";
import { getUploadDirectory, getUploadUrl } from "../../../../lib/uploads.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json({ error: "Only JPG, PNG, WEBP, and GIF images are allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "Image size must be 5MB or smaller" }, { status: 400 });
    }

    const extension = path.extname(file.name) || ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
    const uploadDirectory = getUploadDirectory("profiles");
    const filePath = path.join(uploadDirectory, fileName);

    await mkdir(uploadDirectory, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    publishLiveEvent({ userId: user.id, resource: "profile", action: "uploaded" });

    return Response.json({
      success: true,
      fileUrl: getUploadUrl("profiles", fileName),
      originalName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
