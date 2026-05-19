import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createInsertNotification, createListHandler } from "../../../lib/api.js";
import { requireUser } from "../../../lib/auth.js";
import { publishLiveEvent } from "../../../lib/live-events.js";
import { prisma } from "../../../lib/prisma.js";
import { ensureUploadDirectory, getUploadErrorMessage, getUploadUrl } from "../../../lib/uploads.js";

export const GET = createListHandler("receipts");

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
    const user = await requireUser();
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = path.extname(file.name) || ".bin";
    const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "receipt";
    const fileName = `${Date.now()}-${randomUUID()}-${baseName}${extension.toLowerCase()}`;
    const uploadDirectory = await ensureUploadDirectory("receipts");
    const filePath = path.join(uploadDirectory, fileName);
    await writeFile(filePath, buffer);

    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        fileUrl: getUploadUrl("receipts", fileName),
        fileType: file.type || "image/jpeg",
        originalName: file.name,
      },
    });

    await createInsertNotification({ userId: user.id, resource: "receipts", item: receipt });
    publishLiveEvent({ userId: user.id, resource: "receipts", action: "created" });

    return Response.json(receipt, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error.message === "UNAUTHORIZED" ? error.message : getUploadErrorMessage(error) },
      { status: error.message === "UNAUTHORIZED" ? 401 : 500 },
    );
  }
}
