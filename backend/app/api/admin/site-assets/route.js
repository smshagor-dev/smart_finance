import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "../../../../lib/auth.js";
import { getUploadDirectory, getUploadUrl } from "../../../../lib/uploads.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

export async function POST(request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    const purpose = String(formData.get("purpose") || "asset");

    if (!file || typeof file === "string") {
      return Response.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json({ error: "Only image, SVG, and ICO files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File size must be 5MB or smaller" }, { status: 400 });
    }

    const extension = path.extname(file.name) || ".png";
    const fileName = `${purpose}-${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
    const uploadDirectory = getUploadDirectory("site");
    const filePath = path.join(uploadDirectory, fileName);

    await mkdir(uploadDirectory, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    return Response.json({
      success: true,
      fileUrl: getUploadUrl("site", fileName),
      originalName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
