import { appendCookieHeader, buildSessionCookie } from "../../../../lib/session.js";

export async function POST() {
  const headers = new Headers();
  appendCookieHeader(headers, buildSessionCookie("", { clear: true }));

  return Response.json(
    { success: true },
    { headers },
  );
}
