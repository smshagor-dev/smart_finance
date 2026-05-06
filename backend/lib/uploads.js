import path from "node:path";
import runtimeEnv from "../config/runtime-env.cjs";

const DEFAULT_UPLOADS_ROOT = path.join(runtimeEnv.backendRoot, "storage", "uploads");

export function getUploadsRoot() {
  return process.env.UPLOADS_ROOT
    ? path.resolve(process.env.UPLOADS_ROOT)
    : DEFAULT_UPLOADS_ROOT;
}

export function getUploadDirectory(bucket) {
  return path.join(getUploadsRoot(), bucket);
}

export function getUploadUrl(bucket, fileName) {
  return `/uploads/${bucket}/${fileName}`;
}

export function getUploadFilePathFromUrl(fileUrl) {
  const relativePath = String(fileUrl || "").replace(/^\/+/, "");
  if (!relativePath.startsWith("uploads/")) {
    throw new Error("Invalid upload URL");
  }

  return path.join(runtimeEnv.backendRoot, relativePath.replace(/^uploads[\\/]/, "storage/uploads/"));
}
