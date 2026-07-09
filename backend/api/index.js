import { Readable } from "node:stream";
import { handleBackendRequest } from "../lib/vercel-handler.js";

function createWebRequest(req) {
  const controller = new AbortController();
  req.on("aborted", () => controller.abort());

  const protocol = (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0].trim() || "https";
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "localhost").toString().split(",")[0].trim() || "localhost";
  const url = `${protocol}://${host}${req.url || "/"}`;
  const init = {
    method: req.method || "GET",
    headers: req.headers,
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function sendNodeResponse(res, response) {
  res.statusCode = response.status;

  const setCookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  if (setCookies.length) {
    res.setHeader("Set-Cookie", setCookies);
  }

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }

    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  await new Promise((resolve, reject) => {
    Readable.fromWeb(response.body).pipe(res);
    res.on("finish", resolve);
    res.on("error", reject);
  });
}

export default async function handler(req, res) {
  try {
    const request = createWebRequest(req);
    const response = await handleBackendRequest(request);
    await sendNodeResponse(res, response);
  } catch (error) {
    console.error("Vercel entrypoint failed", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
