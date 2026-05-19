import { requireUser } from "../../../../../lib/auth.js";
import { createAuditLog } from "../../../../../lib/audit.js";
import { prisma } from "../../../../../lib/prisma.js";
import { assertTrustedOrigin } from "../../../../../lib/security.js";

export async function PATCH(request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireUser();
    const payload = await request.json();
    const defaultCurrencyId = String(payload.defaultCurrencyId || "").trim();

    if (!defaultCurrencyId) {
      return Response.json({ error: "Default currency is required" }, { status: 400 });
    }

    const currency = await prisma.currency.findFirst({
      where: {
        id: defaultCurrencyId,
        isActive: true,
      },
    });

    if (!currency) {
      return Response.json({ error: "Currency not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultCurrencyId,
      },
      include: { defaultCurrency: true },
    });

    await createAuditLog({
      actorUserId: updated.id,
      action: "user.default_currency.updated",
      entityType: "user",
      entityId: updated.id,
      description: "User updated default currency",
      meta: {
        currencyId: defaultCurrencyId,
        currencyCode: updated.defaultCurrency?.code || "",
      },
      request,
    });

    return Response.json({
      success: true,
      defaultCurrencyId: updated.defaultCurrencyId,
      defaultCurrencyCode: updated.defaultCurrency?.code || "USD",
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN_ORIGIN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
