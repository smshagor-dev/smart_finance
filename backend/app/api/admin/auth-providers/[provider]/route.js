import { requireAdmin } from "../../../../../lib/auth.js";
import { createAuditLog } from "../../../../../lib/audit.js";
import { getAuthProviderSetting, saveAuthProviderSetting, toAdminProviderSetting } from "../../../../../lib/auth-provider-settings.js";
import { assertTrustedOrigin } from "../../../../../lib/security.js";
import { authProviderSettingSchema } from "../../../../../lib/validators/index.js";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { provider } = await params;
    const setting = await getAuthProviderSetting(provider);

    return Response.json({
      item: toAdminProviderSetting(setting || { provider }),
    });
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    assertTrustedOrigin(request);
    const admin = await requireAdmin();
    const { provider } = await params;
    const payload = authProviderSettingSchema.parse({
      ...(await request.json()),
      provider,
    });
    const saved = await saveAuthProviderSetting(provider, payload);

    await createAuditLog({
      actorUserId: admin.id,
      action: "auth_provider.updated",
      entityType: "auth_provider_setting",
      entityId: provider,
      description: `Updated ${provider} auth provider settings`,
      meta: {
        provider,
        isEnabled: saved.isEnabled,
        callbackUrl: saved.callbackUrl,
        successRedirectUrl: saved.successRedirectUrl,
        failureRedirectUrl: saved.failureRedirectUrl,
      },
      request,
    });

    return Response.json({
      success: true,
      item: toAdminProviderSetting(saved),
    });
  } catch (error) {
    const status =
      error.message === "UNAUTHORIZED"
        ? 401
        : error.message === "FORBIDDEN"
          ? 403
          : error.message === "FORBIDDEN_ORIGIN"
            ? 403
            : error.name === "ZodError"
              ? 400
              : 500;
    return Response.json({ error: error.message }, { status });
  }
}
