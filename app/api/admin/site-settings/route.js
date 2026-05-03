import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { publishGlobalLiveEvent } from "@/lib/live-events";
import { ensureSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { siteSettingsPatchSchema, siteSettingsSchema } from "@/lib/validators";

function sanitizePayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value]),
  );
}

export async function GET() {
  try {
    await requireAdmin();
    const settings = await ensureSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const payload = sanitizePayload(await request.json());
    const data = siteSettingsSchema.parse(payload);

    const settings = await saveSiteSettings(data);

    publishGlobalLiveEvent({ resource: "site-settings", action: "updated" });

    return NextResponse.json(settings);
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
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

    return NextResponse.json(settings);
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
