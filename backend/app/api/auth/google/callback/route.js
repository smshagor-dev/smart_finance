import {
  buildProviderFailureRedirect,
  consumeProviderState,
  exchangeGoogleCode,
  finalizeProviderLogin,
  findOrCreateSocialUser,
  getEnabledAuthProvider,
} from "../../../../../lib/provider-auth.js";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const denied = url.searchParams.get("error") || "";

  let setting = null;

  try {
    setting = await getEnabledAuthProvider("google");
    const statePayload = consumeProviderState(request, "google", state);
    if (!statePayload) {
      throw new Error("Invalid or expired auth state");
    }

    if (denied) {
      throw new Error(denied === "access_denied" ? "Google login was cancelled" : denied);
    }

    if (!code) {
      throw new Error("Google did not return an authorization code");
    }

    const profile = await exchangeGoogleCode(setting, code);
    const user = await findOrCreateSocialUser({
      provider: "google",
      ...profile,
    });

    return finalizeProviderLogin({
      provider: "google",
      user,
      request,
      successRedirectUrl: setting.successRedirectUrl,
      returnTo: statePayload.returnTo || setting.successRedirectUrl,
    });
  } catch (error) {
    const redirectTo = buildProviderFailureRedirect(
      setting,
      "google_callback_failed",
      error.message,
      "/login",
    );

    return Response.redirect(redirectTo, 302);
  }
}
