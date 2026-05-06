import { requireAdmin } from "../../../../lib/auth.js";
import { publishGlobalLiveEvent } from "../../../../lib/live-events.js";
import { ensureSiteSettings, saveSiteSettings } from "../../../../lib/site-settings.js";
import { siteSettingsPatchSchema, siteSettingsSchema } from "../../../../lib/validators/index.js";

function sanitizePayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value]),
  );
}

export async function GET() {
  try {
    await requireAdmin();
    const settings = await ensureSiteSettings();
    return Response.json(settings);
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const payload = sanitizePayload(await request.json());
    const data = siteSettingsSchema.parse(payload);

    const settings = await saveSiteSettings(data);

    publishGlobalLiveEvent({ resource: "site-settings", action: "updated" });

    return Response.json(settings);
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const payload = sanitizePayload(await request.json());
    const currentSettings = await ensureSiteSettings();
    const partial = siteSettingsPatchSchema.parse(payload);
    const data = {
      ...currentSettings,
      ...partial,
    };

    const settings = await saveSiteSettings(data);

    publishGlobalLiveEvent({ resource: "site-settings", action: "updated" });

    return Response.json(settings);
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
