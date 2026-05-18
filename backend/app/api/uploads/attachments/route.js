import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireUser } from "../../../../lib/auth.js";
import { ensureUploadDirectory, getUploadErrorMessage, getUploadUrl } from "../../../../lib/uploads.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

export async function POST(request) {
  try {
    await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File size must be 10MB or smaller" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return Response.json({ error: "Unsupported file type. Upload an image, PDF, or document file." }, { status: 400 });
    }

    const extension = path.extname(file.name) || ".bin";
    const fileName = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
    const uploadDirectory = await ensureUploadDirectory("attachments");
    const filePath = path.join(uploadDirectory, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    return Response.json({
      success: true,
      fileUrl: getUploadUrl("attachments", fileName),
      originalName: file.name,
      fileType: file.type || "application/octet-stream",
    });
  } catch (error) {
    return Response.json(
      { error: error.message === "UNAUTHORIZED" ? error.message : getUploadErrorMessage(error) },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 },
    );
  }
}
