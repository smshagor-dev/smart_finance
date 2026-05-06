const runtimeEnv = require("../config/runtime-env.cjs");

try {
  runtimeEnv.ensureRuntimeEnv("backend");
  const serverConfig = runtimeEnv.getServerConfig();
  const databaseConfig = runtimeEnv.getDatabaseConfig();

  console.log("Backend environment is valid.");
  console.log(
    JSON.stringify(
      {
        nodeEnv: process.env.NODE_ENV || "development",
        backendHost: serverConfig.host,
        backendPort: serverConfig.port,
        frontendUrl: serverConfig.frontendUrl,
        appUrl: serverConfig.appUrl,
        allowedOrigins: serverConfig.allowedOrigins,
        dbHost: databaseConfig.host,
        dbPort: databaseConfig.port,
        dbName: databaseConfig.name,
        hasAuthSecret: Boolean(process.env.AUTH_SECRET),
        uploadsRoot: process.env.UPLOADS_ROOT || "frontend/public/uploads",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Environment validation failed: ${error.message}`);
  process.exit(1);
}
