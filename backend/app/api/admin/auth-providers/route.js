import { requireAdmin } from "../../../../lib/auth.js";
import { getAllAuthProviderSettings, toAdminProviderSetting } from "../../../../lib/auth-provider-settings.js";

export async function GET() {
  try {
    await requireAdmin();
    const items = await getAllAuthProviderSettings();

    return Response.json({
      items: items.map(toAdminProviderSetting),
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
