import { getSiteSettings } from "../../../../lib/site-settings.js";
import {
  buildOAuthStateCookie,
  buildProviderFailureRedirect,
  buildTelegramWidgetHtml,
  createProviderState,
  getEnabledAuthProvider,
  getTelegramBotProfile,
} from "../../../../lib/provider-auth.js";

export async function GET(request) {
  let setting = null;

  try {
    setting = await getEnabledAuthProvider("telegram");
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get("returnTo") || setting.successRedirectUrl || "/dashboard";
    const state = createProviderState("telegram", returnTo);
    const bot = await getTelegramBotProfile(setting);
    const siteSettings = await getSiteSettings();
    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": buildOAuthStateCookie(state),
      "Content-Security-Policy": [
        "default-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "script-src https://telegram.org",
        "style-src 'unsafe-inline'",
        "img-src 'self' data: https://telegram.org https://oauth.telegram.org",
        "frame-src https://telegram.org https://oauth.telegram.org",
      ].join("; "),
    });

    return new Response(
      buildTelegramWidgetHtml({
        botUsername: bot.username,
        callbackUrl: setting.callbackUrl,
        state,
        siteName: siteSettings.siteName,
        failureRedirectUrl: setting.failureRedirectUrl,
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    const fallback = buildProviderFailureRedirect(
      setting || { failureRedirectUrl: "/login" },
      "telegram_unavailable",
      error.message,
      "/login",
    );

    return Response.redirect(fallback, 302);
  }
}
