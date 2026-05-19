import { appendCookieHeader, buildSessionCookie } from "../../../../lib/session.js";
import { assertTrustedOrigin } from "../../../../lib/security.js";

export async function POST(request) {
  assertTrustedOrigin(request);
  const headers = new Headers();
  appendCookieHeader(headers, buildSessionCookie("", { clear: true }));

  return Response.json(
    { success: true },
    { headers },
  );
}
