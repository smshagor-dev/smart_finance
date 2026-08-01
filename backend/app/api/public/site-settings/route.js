const FALLBACK_SITE_SETTINGS = {
  id: "global",
  siteName: "Finance Tracker",
  siteTagline: "Personal finance command center",
  siteDescription: "Personal finance tracker built with Next.js, Prisma, and MongoDB",
  seoTitle: "Finance Tracker",
  seoDescription: "Personal finance tracker built with Next.js, Prisma, and MongoDB",
  seoKeywords: "finance tracker, budgeting, expenses, income, wallet, reports",
  logoUrl: null,
  iconUrl: null,
  supportEmail: null,
  siteUrl: null,
  requireEmailVerification: true,
  verificationCodeExpiryMinutes: 15,
};

export async function GET() {
  try {
    const { getPublicSiteSettings } = await import("../../../../lib/site-settings.js");
    const settings = await getPublicSiteSettings();
    return Response.json(settings);
  } catch (error) {
    console.error("Failed to load public site settings.", error);
    return Response.json(FALLBACK_SITE_SETTINGS);
  }
}
