async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function loginWithCredentials({ email, password }) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await readJson(response);
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  const data = await readJson(response);
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export function startProviderAuth(provider, returnTo = "/dashboard") {
  const nextUrl = `/api/auth/${provider}?returnTo=${encodeURIComponent(returnTo)}`;
  window.location.assign(nextUrl);
}
