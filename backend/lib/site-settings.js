import { prisma } from "./prisma.js";
import { getBaseUrl } from "./app-url.js";

function isValidEmail(value) {
  if (!value) {
    return false;
  }

  return /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/.test(String(value));
}

const defaultSupportEmail = isValidEmail(process.env.SMTP_USER) ? process.env.SMTP_USER : null;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const DEFAULT_SITE_SETTINGS = {
  id: "global",
  siteName: "Finance Tracker",
  siteTagline: "Personal finance command center",
  siteDescription: "Personal finance tracker built with Next.js, Prisma, and MongoDB",
  seoTitle: "Finance Tracker",
  seoDescription: "Personal finance tracker built with Next.js, Prisma, and MongoDB",
  seoKeywords: "finance tracker, budgeting, expenses, income, wallet, reports",
  logoUrl: null,
  iconUrl: null,
  supportEmail: defaultSupportEmail,
  siteUrl: getBaseUrl(),
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
  const supportEmail = isValidEmail(record?.supportEmail) ? record.supportEmail : DEFAULT_SITE_SETTINGS.supportEmail;

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(record || {}),
    supportEmail,
  };
}

function isMissingSiteSettingsTableError(error) {
  return (
    error?.code === "P2021" ||
    error?.message?.includes('The table `site_settings` does not exist in the current database.') ||
    error?.message?.includes("Collection not found")
  );
}

function normalizeSiteSettings(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    smtpPort:
      typeof record.smtpPort === "bigint"
        ? Number(record.smtpPort)
        : Number(record.smtpPort ?? DEFAULT_SITE_SETTINGS.smtpPort),
    smtpSecure: Boolean(record.smtpSecure),
    requireEmailVerification: Boolean(record.requireEmailVerification),
    verificationCodeExpiryMinutes:
      typeof record.verificationCodeExpiryMinutes === "bigint"
        ? Number(record.verificationCodeExpiryMinutes)
        : Number(
            record.verificationCodeExpiryMinutes ??
              DEFAULT_SITE_SETTINGS.verificationCodeExpiryMinutes,
          ),
  };
}

async function findSiteSettingsRecord(client = prisma) {
  if (isBuildPhase) {
    return null;
  }

  try {
    const settings = await client.siteSetting.findUnique({
      where: { id: DEFAULT_SITE_SETTINGS.id },
    });

    return normalizeSiteSettings(settings);
  } catch (error) {
    if (isMissingSiteSettingsTableError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveSiteSettings(data, client = prisma) {
  const merged = mergeSettings({ ...data, id: "global" });

  const saved = await client.siteSetting.upsert({
    where: { id: merged.id },
    update: {
      siteName: merged.siteName,
      siteTagline: merged.siteTagline,
      siteDescription: merged.siteDescription,
      seoTitle: merged.seoTitle,
      seoDescription: merged.seoDescription,
      seoKeywords: merged.seoKeywords,
      logoUrl: merged.logoUrl,
      iconUrl: merged.iconUrl,
      supportEmail: merged.supportEmail,
      siteUrl: merged.siteUrl,
      smtpHost: merged.smtpHost,
      smtpPort: merged.smtpPort,
      smtpSecure: merged.smtpSecure,
      smtpUser: merged.smtpUser,
      smtpPass: merged.smtpPass,
      smtpFrom: merged.smtpFrom,
      requireEmailVerification: merged.requireEmailVerification,
      verificationCodeExpiryMinutes: merged.verificationCodeExpiryMinutes,
    },
    create: merged,
  });

  return normalizeSiteSettings(saved);
}

export async function ensureSiteSettings() {
  const existing = await findSiteSettingsRecord();
  if (existing) {
    return mergeSettings(existing);
  }

  try {
    return await saveSiteSettings(DEFAULT_SITE_SETTINGS);
  } catch (error) {
    if (isMissingSiteSettingsTableError(error)) {
      return mergeSettings();
    }

    throw error;
  }
}

export async function getSiteSettings() {
  const settings = await findSiteSettingsRecord();

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
