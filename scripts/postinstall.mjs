import { spawnSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1";

if (isVercel) {
  console.log("Skipping backend Prisma generate during Vercel install.");
  process.exit(0);
}

const result = spawnSync("node", ["backend/scripts/run-prisma.cjs", "generate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
