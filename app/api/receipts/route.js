import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { createListHandler } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { publishLiveEvent } from "@/lib/live-events";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be 10MB or smaller" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Upload an image, PDF, or document file." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "receipts");
    const filePath = path.join(uploadDirectory, fileName);
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(filePath, buffer);

    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        fileUrl: `/uploads/receipts/${fileName}`,
        fileType: file.type || "image/jpeg",
        originalName: file.name,
      },
    });

    publishLiveEvent({ userId: user.id, resource: "receipts", action: "created" });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
