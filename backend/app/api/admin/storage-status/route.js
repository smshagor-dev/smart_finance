import { requireAdmin } from "../../../../lib/auth.js";
import { getUploadStorageStatus } from "../../../../lib/uploads.js";

export async function GET() {
  try {
    await requireAdmin();
    const status = await getUploadStorageStatus();
    return Response.json(status);
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
