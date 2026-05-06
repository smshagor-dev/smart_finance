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
  siteDescription: "Personal finance tracker built with Next.js, Prisma, and MySQL",
  seoTitle: "Finance Tracker",
  seoDescription: "Personal finance tracker built with Next.js, Prisma, and MySQL",
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
    error?.message?.includes('The table `site_settings` does not exist in the current database.')
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

async function hasSiteSettingsTable(client = prisma) {
  if (isBuildPhase) {
    return false;
  }

  const [result] = await client.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'site_settings'
    ) AS tableExists
  `;

  return Boolean(result?.tableExists);
}

async function findSiteSettingsRecord(client = prisma) {
  try {
    if (!(await hasSiteSettingsTable(client))) {
      return null;
    }

    const [settings] = await client.$queryRaw`
      SELECT
        id,
        site_name AS siteName,
        site_tagline AS siteTagline,
        site_description AS siteDescription,
        seo_title AS seoTitle,
        seo_description AS seoDescription,
        seo_keywords AS seoKeywords,
        logo_url AS logoUrl,
        icon_url AS iconUrl,
        support_email AS supportEmail,
        site_url AS siteUrl,
        smtp_host AS smtpHost,
        smtp_port AS smtpPort,
        smtp_secure AS smtpSecure,
        smtp_user AS smtpUser,
        smtp_pass AS smtpPass,
        smtp_from AS smtpFrom,
        require_email_verification AS requireEmailVerification,
        verification_code_expiry_minutes AS verificationCodeExpiryMinutes
      FROM site_settings
      WHERE id = ${DEFAULT_SITE_SETTINGS.id}
      LIMIT 1
    `;

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

  await client.$executeRaw`
    INSERT INTO site_settings (
      id,
      site_name,
      site_tagline,
      site_description,
      seo_title,
      seo_description,
      seo_keywords,
      logo_url,
      icon_url,
      support_email,
      site_url,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_pass,
      smtp_from,
      require_email_verification,
      verification_code_expiry_minutes,
      created_at,
      updated_at
    ) VALUES (
      ${merged.id},
      ${merged.siteName},
      ${merged.siteTagline},
      ${merged.siteDescription},
      ${merged.seoTitle},
      ${merged.seoDescription},
      ${merged.seoKeywords},
      ${merged.logoUrl},
      ${merged.iconUrl},
      ${merged.supportEmail},
      ${merged.siteUrl},
      ${merged.smtpHost},
      ${merged.smtpPort},
      ${merged.smtpSecure},
      ${merged.smtpUser},
      ${merged.smtpPass},
      ${merged.smtpFrom},
      ${merged.requireEmailVerification},
      ${merged.verificationCodeExpiryMinutes},
      NOW(),
      NOW()
    )
    ON DUPLICATE KEY UPDATE
      site_name = VALUES(site_name),
      site_tagline = VALUES(site_tagline),
      site_description = VALUES(site_description),
      seo_title = VALUES(seo_title),
      seo_description = VALUES(seo_description),
      seo_keywords = VALUES(seo_keywords),
      logo_url = VALUES(logo_url),
      icon_url = VALUES(icon_url),
      support_email = VALUES(support_email),
      site_url = VALUES(site_url),
      smtp_host = VALUES(smtp_host),
      smtp_port = VALUES(smtp_port),
      smtp_secure = VALUES(smtp_secure),
      smtp_user = VALUES(smtp_user),
      smtp_pass = VALUES(smtp_pass),
      smtp_from = VALUES(smtp_from),
      require_email_verification = VALUES(require_email_verification),
      verification_code_expiry_minutes = VALUES(verification_code_expiry_minutes),
      updated_at = NOW()
  `;

  return merged;
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
