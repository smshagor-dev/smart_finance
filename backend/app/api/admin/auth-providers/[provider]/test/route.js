import { requireAdmin } from "../../../../../../lib/auth.js";
import { createAuditLog } from "../../../../../../lib/audit.js";
import { getAuthProviderSetting, hasRequiredProviderConfig } from "../../../../../../lib/auth-provider-settings.js";
import { buildProviderConnectionTest } from "../../../../../../lib/provider-auth.js";
import { assertTrustedOrigin } from "../../../../../../lib/security.js";

export async function POST(request, { params }) {
  try {
    assertTrustedOrigin(request);
    const admin = await requireAdmin();
    const { provider } = await params;
    const setting = await getAuthProviderSetting(provider);
    if (!setting || !hasRequiredProviderConfig(setting)) {
      return Response.json({ error: "Provider settings are incomplete" }, { status: 400 });
    }
    const result = await buildProviderConnectionTest(provider, setting);

    await createAuditLog({
      actorUserId: admin.id,
      action: "auth_provider.tested",
      entityType: "auth_provider_setting",
      entityId: provider,
      description: `Tested ${provider} auth provider connection`,
      meta: result.meta || { provider },
      request,
    });

    return Response.json(result);
  } catch (error) {
    const status =
      error.message === "UNAUTHORIZED"
        ? 401
        : error.message === "FORBIDDEN"
          ? 403
          : error.message === "FORBIDDEN_ORIGIN"
            ? 403
            : 500;
    return Response.json({ error: error.message }, { status });
  }
}
