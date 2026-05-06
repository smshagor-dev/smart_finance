const path = require("path");
const { spawn } = require("child_process");
const { backendRoot, ensureRuntimeEnv, projectRoot } = require("../config/runtime-env.cjs");

ensureRuntimeEnv("backend");

const prismaBin = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);

function quoteWindowsArg(value) {
  if (!value) {
    return '""';
  }

  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : prismaBin;
const commandArgs =
  process.platform === "win32"
    ? [
        "/d",
        "/s",
        "/c",
        `${[prismaBin, ...process.argv.slice(2)].map(quoteWindowsArg).join(" ")}`,
      ]
    : process.argv.slice(2);

const child = spawn(command, commandArgs, {
  cwd: backendRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("Failed to start Prisma CLI.");
  console.error(error);
  process.exit(1);
});
