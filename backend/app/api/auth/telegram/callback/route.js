import {
  buildProviderFailureRedirect,
  consumeProviderState,
  finalizeProviderLogin,
  findOrCreateSocialUser,
  getEnabledAuthProvider,
  getTelegramProfileFromQuery,
  verifyTelegramAuthPayload,
} from "../../../../../lib/provider-auth.js";

export async function GET(request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  let setting = null;

  try {
    setting = await getEnabledAuthProvider("telegram");
    const statePayload = consumeProviderState(request, "telegram", state);
    if (!statePayload) {
      throw new Error("Invalid or expired auth state");
    }

    const authDate = Number(url.searchParams.get("auth_date") || 0);
    if (!authDate || Date.now() / 1000 - authDate > 300) {
      throw new Error("Telegram login payload expired");
    }

    const payloadObject = Object.fromEntries(url.searchParams.entries());
    if (!verifyTelegramAuthPayload(payloadObject, setting.botToken)) {
      throw new Error("Invalid Telegram login signature");
    }

    const profile = getTelegramProfileFromQuery(url.searchParams);
    if (!profile.providerId) {
      throw new Error("Telegram account id is missing");
    }

    const user = await findOrCreateSocialUser({
      provider: "telegram",
      ...profile,
    });

    return finalizeProviderLogin({
      provider: "telegram",
      user,
      request,
      successRedirectUrl: setting.successRedirectUrl,
      returnTo: statePayload.returnTo || setting.successRedirectUrl,
    });
  } catch (error) {
    const redirectTo = buildProviderFailureRedirect(
      setting,
      "telegram_callback_failed",
      error.message,
      "/login",
    );

    return Response.redirect(redirectTo, 302);
  }
}
