import { getEnabledAuthProvider } from "../../../../lib/provider-auth.js";
import { buildGoogleAuthorizationUrl, buildOAuthStateCookie, buildProviderFailureRedirect, createProviderState } from "../../../../lib/provider-auth.js";

export async function GET(request) {
  try {
    const setting = await getEnabledAuthProvider("google");
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get("returnTo") || setting.successRedirectUrl || "/dashboard";
    const state = createProviderState("google", returnTo);
    const headers = new Headers();
    headers.set("Location", await buildGoogleAuthorizationUrl(setting, state));
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
      "google_unavailable",
      error.message,
      "/login",
    );

    return Response.redirect(fallback, 302);
  }
}
