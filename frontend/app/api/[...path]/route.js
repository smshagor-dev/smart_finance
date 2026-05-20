function getApiBaseUrl() {
  return (process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000").replace(/\/$/, "");
}

function buildTargetUrl(pathSegments, requestUrl) {
  const incomingUrl = new URL(requestUrl);
  const joinedPath = Array.isArray(pathSegments) ? pathSegments.join("/") : "";
  const targetUrl = new URL(`${getApiBaseUrl()}/api/${joinedPath}`);
  targetUrl.search = incomingUrl.search;
  return targetUrl;
}

async function proxyRequest(request, context) {
  const { path = [] } = await context.params;
  const targetUrl = buildTargetUrl(path, request.url);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-forwarded-host", new URL(request.url).host);
  headers.set("x-forwarded-proto", new URL(request.url).protocol.replace(":", ""));

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    duplex: request.method === "GET" || request.method === "HEAD" ? undefined : "half",
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(response.headers);
  const setCookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];

  if (setCookies.length) {
    responseHeaders.delete("set-cookie");
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function GET(request, context) {
  return proxyRequest(request, context);
}

export function POST(request, context) {
  return proxyRequest(request, context);
}

export function PUT(request, context) {
  return proxyRequest(request, context);
}

export function PATCH(request, context) {
  return proxyRequest(request, context);
}

export function DELETE(request, context) {
  return proxyRequest(request, context);
}

export function OPTIONS(request, context) {
  return proxyRequest(request, context);
}
