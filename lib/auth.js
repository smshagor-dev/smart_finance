import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getInternalApiBaseUrl() {
  return (process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000").replace(/\/$/, "");
}

async function fetchProfile() {
  const cookieStore = await cookies();
  const response = await fetch(`${getInternalApiBaseUrl()}/api/profile`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load current user");
  }

  return response.json();
}

export async function getCurrentUser() {
  const profile = await fetchProfile();
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    image: profile.image,
    role: profile.role,
    defaultCurrencyId: profile.defaultCurrencyId,
    defaultCurrencyCode: profile.defaultCurrencyCode,
    emailVerified: profile.emailVerified,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/dashboard");
  }
  return user;
}
