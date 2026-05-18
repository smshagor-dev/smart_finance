import path from "node:path";
import os from "node:os";
import { access, mkdir, constants as fsConstants } from "node:fs/promises";
import runtimeEnv from "../config/runtime-env.cjs";

const DEFAULT_UPLOADS_ROOT = path.join(os.tmpdir(), "smart-finance", "uploads");

export function getUploadsRoot() {
  return process.env.UPLOADS_ROOT
    ? path.resolve(process.env.UPLOADS_ROOT)
    : DEFAULT_UPLOADS_ROOT;
}

export function getUploadDirectory(bucket) {
  return path.join(getUploadsRoot(), bucket);
}

export async function ensureUploadDirectory(bucket) {
  const directory = getUploadDirectory(bucket);
  await mkdir(directory, { recursive: true });
  await access(directory, fsConstants.W_OK);
  return directory;
}

export function getUploadUrl(bucket, fileName) {
  return `/uploads/${bucket}/${fileName}`;
}

export function getUploadFilePathFromUrl(fileUrl) {
  const relativePath = String(fileUrl || "").replace(/^\/+/, "");
  if (!relativePath.startsWith("uploads/")) {
    throw new Error("Invalid upload URL");
  }

  return path.join(getUploadsRoot(), relativePath.replace(/^uploads[\\/]/, ""));
}

export function getUploadErrorMessage(error) {
  if (error?.code === "EACCES" || error?.code === "EPERM" || error?.code === "EROFS") {
    return "Upload storage is not writable on the live server. Set UPLOADS_ROOT to a writable backend directory.";
  }

  if (error?.code === "ENOENT") {
    return "Upload storage directory is missing on the live server. Set UPLOADS_ROOT to an existing writable backend directory.";
  }

  return error?.message || "Upload failed";
}
