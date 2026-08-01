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
        uploadStorageDriver: process.env.FILE_STORAGE_DRIVER || process.env.UPLOAD_STORAGE_DRIVER || (process.env.FTP_HOST ? "ftp" : "local"),
        uploadsRoot: process.env.UPLOADS_ROOT || "backend/storage/uploads",
        ftpHost: process.env.FTP_HOST || "",
        ftpPort: Number(process.env.FTP_PORT || 21),
        ftpRoot: process.env.FTP_ROOT || "smart-finance/uploads",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Environment validation failed: ${error.message}`);
  process.exit(1);
}
