import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const runtimeEnv = require("../../backend/config/runtime-env.cjs");

try {
  runtimeEnv.ensureRuntimeEnv("frontend");
  console.log("Frontend environment is valid.");
  console.log(
    JSON.stringify(
      {
        nodeEnv: process.env.NODE_ENV || "development",
        frontendHost: process.env.FRONTEND_HOST || "0.0.0.0",
        frontendPort: process.env.FRONTEND_PORT || process.env.PORT || "3001",
        appUrl: process.env.APP_URL || "",
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
        internalApiBaseUrl: process.env.INTERNAL_API_BASE_URL || "",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Frontend environment validation failed: ${error.message}`);
  process.exit(1);
}
