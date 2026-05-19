import {
  buildProviderFailureRedirect,
  consumeProviderState,
  exchangeFacebookCode,
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
    setting = await getEnabledAuthProvider("facebook");
    const statePayload = consumeProviderState(request, "facebook", state);
    if (!statePayload) {
      throw new Error("Invalid or expired auth state");
    }

    if (denied) {
      throw new Error(denied === "access_denied" ? "Facebook login was cancelled" : denied);
    }

    if (!code) {
      throw new Error("Facebook did not return an authorization code");
    }

    const profile = await exchangeFacebookCode(setting, code);
    const user = await findOrCreateSocialUser({
      provider: "facebook",
      ...profile,
    });

    return finalizeProviderLogin({
      provider: "facebook",
      user,
      request,
      successRedirectUrl: setting.successRedirectUrl,
      returnTo: statePayload.returnTo || setting.successRedirectUrl,
    });
  } catch (error) {
    const redirectTo = buildProviderFailureRedirect(
      setting,
      "facebook_callback_failed",
      error.message,
      "/login",
    );

    return Response.redirect(redirectTo, 302);
  }
}
