import { buildFacebookAuthorizationUrl, buildOAuthStateCookie, buildProviderFailureRedirect, createProviderState, getEnabledAuthProvider } from "../../../../lib/provider-auth.js";

export async function GET(request) {
  try {
    const setting = await getEnabledAuthProvider("facebook");
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get("returnTo") || setting.successRedirectUrl || "/dashboard";
    const state = createProviderState("facebook", returnTo);
    const headers = new Headers();
    headers.set("Location", buildFacebookAuthorizationUrl(setting, state));
    headers.append("Set-Cookie", buildOAuthStateCookie(state));

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    const fallback = buildProviderFailureRedirect(
      {
        failureRedirectUrl: "/login",
      },
      "facebook_unavailable",
      error.message,
      "/login",
    );

    return Response.redirect(fallback, 302);
  }
}
