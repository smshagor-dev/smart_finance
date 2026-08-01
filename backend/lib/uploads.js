import path from "node:path";
import { access, mkdir, readFile, stat, unlink, writeFile, constants as fsConstants } from "node:fs/promises";
import { Readable, Writable } from "node:stream";
import * as ftp from "basic-ftp";
import runtimeEnv from "../config/runtime-env.cjs";

const DEFAULT_UPLOADS_ROOT = path.join(runtimeEnv.backendRoot, "storage", "uploads");
const contentTypeByExtension = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".bmp", "image/bmp"],
  [".tiff", "image/tiff"],
  [".pdf", "application/pdf"],
  [".txt", "text/plain; charset=utf-8"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".xls", "application/vnd.ms-excel"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
]);

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function getBooleanEnv(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

function getFtpConfig() {
  return {
    host: process.env.FTP_HOST || "",
    port: Number(process.env.FTP_PORT || 21),
    user: process.env.FTP_USER || "anonymous",
    password: process.env.FTP_PASSWORD || "",
    secure: getBooleanEnv("FTP_SECURE", false),
    root: `/${trimSlashes(process.env.FTP_ROOT || "smart-finance/uploads")}`,
    timeout: Number(process.env.FTP_TIMEOUT_MS || 10000),
  };
}

export function getUploadStorageDriver() {
  const configuredDriver = String(process.env.FILE_STORAGE_DRIVER || process.env.UPLOAD_STORAGE_DRIVER || "").toLowerCase();
  if (configuredDriver === "ftp" || configuredDriver === "local") {
    return configuredDriver;
  }

  return process.env.FTP_HOST ? "ftp" : "local";
}

export function getUploadStorageConfig() {
  const driver = getUploadStorageDriver();
  if (driver === "ftp") {
    const config = getFtpConfig();
    return {
      driver,
      host: config.host,
      port: config.port,
      user: config.user,
      secure: config.secure,
      root: config.root,
      configured: Boolean(config.host),
    };
  }

  return {
    driver,
    root: getUploadsRoot(),
    configured: true,
  };
}

export function getUploadsRoot() {
  return process.env.UPLOADS_ROOT
    ? path.resolve(process.env.UPLOADS_ROOT)
    : DEFAULT_UPLOADS_ROOT;
}

export function getUploadDirectory(bucket) {
  return path.join(getUploadsRoot(), bucket);
}

export async function ensureUploadDirectory(bucket) {
  if (getUploadStorageDriver() === "ftp") {
    await withFtpClient((client) => client.ensureDir(getRemoteBucketPath(bucket)));
    return getRemoteBucketPath(bucket);
  }

  const directory = getUploadDirectory(bucket);
  await mkdir(directory, { recursive: true });
  await access(directory, fsConstants.W_OK);
  return directory;
}

export function getUploadUrl(bucket, fileName) {
  return `/uploads/${bucket}/${fileName}`;
}

export function isManagedUploadUrl(fileUrl) {
  return String(fileUrl || "").trim().startsWith("/uploads/");
}

function normalizeUploadSegments(...segments) {
  const normalized = path.posix.normalize(segments.map(trimSlashes).filter(Boolean).join("/"));
  if (!normalized || normalized === "." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error("Invalid upload path");
  }

  return normalized;
}

function getRelativeUploadPathFromUrl(fileUrl) {
  const relativePath = String(fileUrl || "").replace(/^\/+/, "");
  if (!relativePath.startsWith("uploads/")) {
    throw new Error("Invalid upload URL");
  }

  return normalizeUploadSegments(relativePath.replace(/^uploads\//, ""));
}

function getRelativeUploadPathFromPathname(pathname) {
  const relativePath = String(pathname || "").replace(/^\/uploads\//, "");
  return normalizeUploadSegments(relativePath);
}

export function getUploadFilePathFromUrl(fileUrl) {
  return path.join(getUploadsRoot(), getRelativeUploadPathFromUrl(fileUrl));
}

function getRemoteBucketPath(bucket) {
  const { root } = getFtpConfig();
  return path.posix.join(root, normalizeUploadSegments(bucket));
}

function getRemoteFilePath(relativePath) {
  const { root } = getFtpConfig();
  return path.posix.join(root, normalizeUploadSegments(relativePath));
}

async function withFtpClient(operation) {
  const config = getFtpConfig();
  if (!config.host) {
    throw new Error("FTP_HOST must be configured for FTP upload storage");
  }

  const client = new ftp.Client(config.timeout);
  client.ftp.verbose = getBooleanEnv("FTP_VERBOSE", false);

  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: config.secure,
    });
    return await operation(client);
  } finally {
    client.close();
  }
}

function createBufferWritable(chunks) {
  return new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    },
  });
}

export async function saveUploadFile(bucket, fileName, buffer) {
  if (getUploadStorageDriver() === "ftp") {
    const remoteDirectory = getRemoteBucketPath(bucket);
    await withFtpClient(async (client) => {
      await client.ensureDir(remoteDirectory);
      await client.uploadFrom(Readable.from(Buffer.from(buffer)), path.posix.join(remoteDirectory, fileName));
    });
    return getUploadUrl(bucket, fileName);
  }

  const uploadDirectory = await ensureUploadDirectory(bucket);
  const filePath = path.join(uploadDirectory, fileName);
  await writeFile(filePath, Buffer.from(buffer));
  return getUploadUrl(bucket, fileName);
}

export function getUploadContentType(fileNameOrPath) {
  return contentTypeByExtension.get(path.extname(fileNameOrPath).toLowerCase()) || "application/octet-stream";
}

export async function getUploadFileByPathname(pathname) {
  const relativePath = getRelativeUploadPathFromPathname(pathname);

  if (getUploadStorageDriver() === "ftp") {
    const chunks = [];
    const remotePath = getRemoteFilePath(relativePath);
    await withFtpClient((client) => client.downloadTo(createBufferWritable(chunks), remotePath));
    const buffer = Buffer.concat(chunks);
    return {
      buffer,
      size: buffer.length,
      contentType: getUploadContentType(relativePath),
    };
  }

  const filePath = path.resolve(getUploadsRoot(), relativePath);
  const resolvedRoot = path.resolve(getUploadsRoot());
  if (!filePath.startsWith(resolvedRoot)) {
    throw new Error("Invalid upload path");
  }

  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    throw new Error("Upload file not found");
  }

  const buffer = await readFile(filePath);
  return {
    buffer,
    size: fileStat.size,
    contentType: getUploadContentType(filePath),
  };
}

export async function removeUploadFileByUrl(fileUrl) {
  if (!isManagedUploadUrl(fileUrl)) {
    return false;
  }

  try {
    if (getUploadStorageDriver() === "ftp") {
      const relativePath = getRelativeUploadPathFromUrl(fileUrl);
      await withFtpClient((client) => client.remove(getRemoteFilePath(relativePath)));
      return true;
    }

    const filePath = getUploadFilePathFromUrl(fileUrl);
    await unlink(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT" || String(error?.code || "") === "550") {
      return false;
    }

    throw error;
  }
}

export async function getUploadStorageStatus() {
  const startedAt = Date.now();
  const config = getUploadStorageConfig();

  try {
    if (config.driver === "ftp") {
      await withFtpClient(async (client) => {
        await client.ensureDir(getFtpConfig().root);
        await client.pwd();
      });
    } else {
      await ensureUploadDirectory(".healthcheck");
    }

    return {
      ...config,
      connected: true,
      pingMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...config,
      connected: false,
      pingMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error: getUploadErrorMessage(error),
    };
  }
}

export function getUploadErrorMessage(error) {
  if (error?.message?.includes("FTP_HOST")) {
    return error.message;
  }

  if (error?.code === "EACCES" || error?.code === "EPERM" || error?.code === "EROFS") {
    return "Upload storage is not writable on the live server. Set UPLOADS_ROOT to a writable backend directory.";
  }

  if (error?.code === "ENOENT") {
    return "Upload storage directory is missing on the live server. Set UPLOADS_ROOT to an existing writable backend directory.";
  }

  return error?.message || "Upload failed";
}
