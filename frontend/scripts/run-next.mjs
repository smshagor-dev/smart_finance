import { spawn } from "node:child_process";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const runtimeEnv = require("../../backend/config/runtime-env.cjs");
const nextBin = require.resolve("next/dist/bin/next");

runtimeEnv.ensureRuntimeEnv("frontend");

const command = process.argv[2] || "dev";
const port = process.env.FRONTEND_PORT || process.env.PORT || "3001";
const normalizedHost = String(process.env.FRONTEND_HOST || "0.0.0.0").trim();
const host = normalizedHost.toLowerCase() === "localhost" ? "127.0.0.1" : normalizedHost;

const args = [nextBin, command, "-p", port, "-H", host];

const child = spawn(process.execPath, args, {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
