import { requireAdmin } from "../../../../lib/auth.js";
import { syncCurrencies } from "../../../../lib/currency.js";
import { publishGlobalLiveEvent } from "../../../../lib/live-events.js";
import { prisma } from "../../../../lib/prisma.js";

export async function GET() {
  try {
    await requireAdmin();
    const result = await syncCurrencies(prisma);
    publishGlobalLiveEvent({ resource: "currencies", action: "synced" });
    return Response.json({
      success: true,
      syncedCurrencyCount: result.count,
      baseCode: result.baseCode,
      lastSyncedAt: result.syncedAt,
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
