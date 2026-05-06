import { access, rm } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const frontendBaseUrl = "http://127.0.0.1:3001";
const password = "Secret123!";
const runId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const { prisma } = await import(pathToFileURL(path.resolve("backend/lib/prisma.js")).href);
const { getUploadFilePathFromUrl } = await import(pathToFileURL(path.resolve("backend/lib/uploads.js")).href);

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  store(headers) {
    const values = typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie")]
        : [];

    for (const value of values) {
      if (!value) continue;
      const [pair] = value.split(";");
      const separator = pair.indexOf("=");
      if (separator === -1) continue;
      const name = pair.slice(0, separator).trim();
      const cookieValue = pair.slice(separator + 1).trim();
      this.cookies.set(name, cookieValue);
    }
  }

  header() {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchWithJar(jar, target, init = {}) {
  const headers = new Headers(init.headers || {});
  const cookie = jar.header();
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const response = await fetch(target, { ...init, headers, redirect: "manual" });
  jar.store(response.headers);
  return response;
}

async function jsonRequest(jar, pathname, init = {}) {
  const response = await fetchWithJar(jar, `${frontendBaseUrl}${pathname}`, init);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { response, data, text };
}

async function pageRequest(jar, pathname) {
  const response = await fetchWithJar(jar, `${frontendBaseUrl}${pathname}`);
  const text = await response.text();
  return { response, text };
}

async function registerUser(email, name, defaultCurrencyId) {
  const jar = new CookieJar();
  const { response, data } = await jsonRequest(jar, "/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      confirmPassword: password,
      defaultCurrencyId,
    }),
  });

  assert(response.ok, `Register failed for ${email}: ${response.status} ${JSON.stringify(data)}`);
  assert(data?.devVerificationCode, `Missing dev verification code for ${email}`);

  const verify = await jsonRequest(jar, "/api/auth/verify-email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      code: data.devVerificationCode,
      password: "",
    }),
  });

  assert(verify.response.ok, `Verify email failed for ${email}: ${verify.response.status} ${JSON.stringify(verify.data)}`);
  return { registerData: data, verifyData: verify.data };
}

const createdFiles = [];
let originalSiteSettings = null;
let adminUser = null;
let memberUser = null;

try {
  const publicCurrencies = await jsonRequest(new CookieJar(), "/api/public/currencies");
  assert(publicCurrencies.response.ok, "Could not load currencies");
  const defaultCurrencyId = publicCurrencies.data?.items?.[0]?.id || publicCurrencies.data?.[0]?.id;
  assert(defaultCurrencyId, "No currency found for QA setup");

  const adminEmail = `admin.qa.${runId}@example.com`;
  const memberEmail = `member.qa.${runId}@example.com`;

  await registerUser(adminEmail, "Admin QA", defaultCurrencyId);
  await registerUser(memberEmail, "Member QA", defaultCurrencyId);

  adminUser = await prisma.user.update({
    where: { email: adminEmail },
    data: { role: "admin" },
  });

  memberUser = await prisma.user.findUnique({ where: { email: memberEmail } });
  assert(memberUser, "Member user not found after registration");

  const jar = new CookieJar();
  const login = await jsonRequest(jar, "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password }),
  });
  assert(login.response.ok, `Admin login failed: ${login.response.status} ${JSON.stringify(login.data)}`);

  const adminPages = [
    "/dashboard/admin",
    "/dashboard/admin/users",
    "/dashboard/admin/users/" + memberUser.id,
    "/dashboard/admin/activity",
    "/dashboard/admin/access",
    "/dashboard/admin/finance",
    "/dashboard/admin/collaboration",
    "/dashboard/admin/integrity",
    "/dashboard/admin/platform",
    "/dashboard/admin/site-settings",
  ];

  for (const pathname of adminPages) {
    const page = await pageRequest(jar, pathname);
    assert(page.response.status === 200, `Page failed ${pathname}: ${page.response.status}`);
  }

  const overview = await jsonRequest(jar, "/api/admin/overview");
  assert(overview.response.ok, "Admin overview failed");
  assert(overview.data?.stats?.totalUsers >= 2, "Admin overview stats look wrong");

  const activity = await jsonRequest(jar, "/api/admin/activity?page=1&pageSize=10");
  assert(activity.response.ok, "Admin activity failed");
  assert(Array.isArray(activity.data?.items), "Admin activity payload missing items");

  for (const section of ["access", "finance", "collaboration", "integrity", "platform"]) {
    const sectionResponse = await jsonRequest(jar, `/api/admin/sections/${section}`);
    assert(sectionResponse.response.ok, `Admin section failed: ${section}`);
  }

  const siteSettingsGet = await jsonRequest(jar, "/api/admin/site-settings");
  assert(siteSettingsGet.response.ok, "Site settings GET failed");
  originalSiteSettings = siteSettingsGet.data;

  const invalidSiteSettings = await jsonRequest(jar, "/api/admin/site-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ verificationCodeExpiryMinutes: 2 }),
  });
  assert(invalidSiteSettings.response.status === 400, `Expected site settings validation 400, got ${invalidSiteSettings.response.status}`);

  const brandingPatch = await jsonRequest(jar, "/api/admin/site-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      siteName: `Finance Tracker QA ${runId}`,
      siteTagline: "Admin QA flow",
      siteDescription: "Admin QA updated site settings for frontend regression coverage.",
      supportEmail: adminEmail,
      siteUrl: frontendBaseUrl,
    }),
  });
  assert(brandingPatch.response.ok, `Branding patch failed: ${brandingPatch.response.status} ${JSON.stringify(brandingPatch.data)}`);
  assert(brandingPatch.data?.siteName?.includes(runId), "Branding patch did not persist");

  const assetForm = new FormData();
  assetForm.append("purpose", "logo");
  assetForm.append("file", new Blob([
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#0f172a"/><text x="32" y="38" text-anchor="middle" font-size="18" fill="#fff">QA</text></svg>`,
  ], { type: "image/svg+xml" }), "qa-logo.svg");

  const assetUpload = await jsonRequest(jar, "/api/admin/site-assets", {
    method: "POST",
    body: assetForm,
  });
  assert(assetUpload.response.ok, `Site asset upload failed: ${assetUpload.response.status} ${JSON.stringify(assetUpload.data)}`);
  assert(assetUpload.data?.fileUrl, "Site asset upload missing fileUrl");

  const uploadedFilePath = getUploadFilePathFromUrl(assetUpload.data.fileUrl);
  createdFiles.push(uploadedFilePath);
  await access(uploadedFilePath);

  const assetPatch = await jsonRequest(jar, "/api/admin/site-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      logoUrl: assetUpload.data.fileUrl,
      iconUrl: assetUpload.data.fileUrl,
    }),
  });
  assert(assetPatch.response.ok, `Asset patch failed: ${assetPatch.response.status} ${JSON.stringify(assetPatch.data)}`);

  const usersList = await jsonRequest(jar, "/api/admin/users?page=1&pageSize=10&search=qa.&role=user");
  assert(usersList.response.ok, "Admin users list failed");
  const listedMember = usersList.data?.items?.find((item) => item.email === memberEmail);
  assert(listedMember, "Member user missing from admin users list");

  const userDetail = await jsonRequest(jar, `/api/admin/users/${memberUser.id}`);
  assert(userDetail.response.ok, "Admin user detail failed");
  assert(userDetail.data?.email === memberEmail, "Admin user detail returned wrong user");

  const invalidUserUpdate = await jsonRequest(jar, `/api/admin/users/${memberUser.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "",
      email: memberEmail,
      role: "user",
      defaultCurrencyId,
      emailVerified: true,
    }),
  });
  assert(invalidUserUpdate.response.status === 400, `Expected invalid user update 400, got ${invalidUserUpdate.response.status}`);

  const userUpdate = await jsonRequest(jar, `/api/admin/users/${memberUser.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Member QA Updated",
      email: memberEmail,
      role: "user",
      defaultCurrencyId,
      emailVerified: true,
    }),
  });
  assert(userUpdate.response.ok, `User update failed: ${userUpdate.response.status} ${JSON.stringify(userUpdate.data)}`);

  const updatedUser = await prisma.user.findUnique({
    where: { id: memberUser.id },
    select: { name: true, emailVerified: true, defaultCurrencyId: true },
  });
  assert(updatedUser?.name === "Member QA Updated", "Updated user name did not persist");
  assert(Boolean(updatedUser?.emailVerified), "Updated user verification flag did not persist");
  assert(updatedUser?.defaultCurrencyId === defaultCurrencyId, "Updated default currency did not persist");

  const selfDelete = await jsonRequest(jar, `/api/admin/users/${adminUser.id}`, {
    method: "DELETE",
  });
  assert(selfDelete.response.status === 400, `Expected self delete protection 400, got ${selfDelete.response.status}`);

  const deleteUser = await jsonRequest(jar, `/api/admin/users/${memberUser.id}`, {
    method: "DELETE",
  });
  assert(deleteUser.response.ok, `User delete failed: ${deleteUser.response.status} ${JSON.stringify(deleteUser.data)}`);
  const deletedUser = await prisma.user.findUnique({ where: { id: memberUser.id } });
  assert(!deletedUser, "Deleted member user still exists");
  memberUser = null;

  console.log("ADMIN_FRONTEND_QA_OK");
} finally {
  if (originalSiteSettings) {
    const currentAdmin = adminUser
      ? await prisma.user.findUnique({ where: { id: adminUser.id }, select: { id: true } })
      : null;

    if (currentAdmin) {
      const jar = new CookieJar();
      const relogin = await jsonRequest(jar, "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: adminUser.email, password }),
      });

      if (relogin.response.ok) {
        await jsonRequest(jar, "/api/admin/site-settings", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(originalSiteSettings),
        });
      }
    }
  }

  for (const filePath of createdFiles) {
    await rm(filePath, { force: true }).catch(() => {});
  }

  if (memberUser) {
    await prisma.user.delete({ where: { id: memberUser.id } }).catch(() => {});
  }

  if (adminUser) {
    await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
  }

  await prisma.$disconnect().catch(() => {});
}
