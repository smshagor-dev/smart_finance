import { getAllAuthProviderSettings } from "../../../../lib/auth-provider-settings.js";

export async function GET() {
  try {
    const items = await getAllAuthProviderSettings();

    return Response.json({
      items: items.map((item) => ({
        provider: item.provider,
        isEnabled: Boolean(item.isEnabled),
        isAvailable:
          Boolean(item.isEnabled) &&
          Boolean(item.callbackUrl) &&
          Boolean(item.successRedirectUrl) &&
          Boolean(item.failureRedirectUrl) &&
          (item.provider === "telegram" ? Boolean(item.botToken) : Boolean(item.clientId && item.clientSecret)),
      })),
    });
  } catch {
    return Response.json({
      items: [
        { provider: "google", isEnabled: false, isAvailable: false },
        { provider: "facebook", isEnabled: false, isAvailable: false },
        { provider: "telegram", isEnabled: false, isAvailable: false },
      ],
    });
  }
}
