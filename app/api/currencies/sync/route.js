import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { syncCurrencies } from "@/lib/currency";
import { publishGlobalLiveEvent } from "@/lib/live-events";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const result = await syncCurrencies(prisma);
    publishGlobalLiveEvent({ resource: "currencies", action: "synced" });
    return NextResponse.json({
      success: true,
      syncedCurrencyCount: result.count,
      baseCode: result.baseCode,
      lastSyncedAt: result.syncedAt,
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
