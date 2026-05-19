import { getAllAuthProviderSettings } from "../../../../lib/auth-provider-settings.js";

export async function GET() {
  const items = await getAllAuthProviderSettings();

  return Response.json({
    items: items.map((item) => ({
      provider: item.provider,
      isEnabled: Boolean(item.isEnabled),
      isAvailable: Boolean(item.isEnabled) && Boolean(item.callbackUrl) && Boolean(item.successRedirectUrl) && Boolean(item.failureRedirectUrl) && (item.provider === "telegram" ? Boolean(item.botToken) : Boolean(item.clientId && item.clientSecret)),
    })),
  });
}
