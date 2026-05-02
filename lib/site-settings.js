import { prisma } from "@/lib/prisma";

const DEFAULT_SITE_SETTINGS = {
  id: "global",
  siteName: "Finance Tracker",
  siteTagline: "Personal finance command center",
  siteDescription: "Personal finance tracker built with Next.js, Prisma, and MySQL",
  seoTitle: "Finance Tracker",
  seoDescription: "Personal finance tracker built with Next.js, Prisma, and MySQL",
  seoKeywords: "finance tracker, budgeting, expenses, income, wallet, reports",
  logoUrl: null,
  iconUrl: null,
  supportEmail: process.env.SMTP_FROM || process.env.SMTP_USER || null,
  siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  smtpHost: null,
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: null,
  smtpPass: null,
  smtpFrom: null,
  requireEmailVerification: true,
  verificationCodeExpiryMinutes: 15,
};

function mergeSettings(record) {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(record || {}),
  };
}

export async function ensureSiteSettings() {
  const settings = await prisma.siteSetting.upsert({
    where: { id: "global" },
    update: {},
    create: DEFAULT_SITE_SETTINGS,
  });

  return mergeSettings(settings);
}

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "global" },
  });

  return mergeSettings(settings);
}

export async function getPublicSiteSettings() {
  const settings = await getSiteSettings();

  return {
    id: settings.id,
    siteName: settings.siteName,
    siteTagline: settings.siteTagline,
    siteDescription: settings.siteDescription,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    seoKeywords: settings.seoKeywords,
    logoUrl: settings.logoUrl,
    iconUrl: settings.iconUrl,
    supportEmail: settings.supportEmail,
    siteUrl: settings.siteUrl,
    requireEmailVerification: settings.requireEmailVerification,
    verificationCodeExpiryMinutes: settings.verificationCodeExpiryMinutes,
  };
}

export async function getResolvedSmtpSettings() {
  const settings = await getSiteSettings();

  const host = settings.smtpHost || process.env.SMTP_HOST || "";
  const port = Number(settings.smtpPort || process.env.SMTP_PORT || 587);
  const secure = typeof settings.smtpSecure === "boolean" ? settings.smtpSecure : process.env.SMTP_SECURE === "true";
  const user = settings.smtpUser || process.env.SMTP_USER || "";
  const pass = settings.smtpPass || process.env.SMTP_PASS || "";
  const from = settings.smtpFrom || settings.supportEmail || process.env.SMTP_FROM || user || "";

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
  };
}
