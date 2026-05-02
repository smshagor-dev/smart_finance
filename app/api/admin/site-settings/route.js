import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { publishGlobalLiveEvent } from "@/lib/live-events";
import { prisma } from "@/lib/prisma";
import { ensureSiteSettings } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/validators";

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

    const settings = await prisma.siteSetting.upsert({
      where: { id: "global" },
      update: data,
      create: {
        id: "global",
        ...data,
      },
    });

    publishGlobalLiveEvent({ resource: "site-settings", action: "updated" });

    return NextResponse.json(settings);
  } catch (error) {
    const status = error.name === "ZodError" ? 400 : error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
