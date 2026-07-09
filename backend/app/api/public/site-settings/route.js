import { getPublicSiteSettings } from "../../../../lib/site-settings.js";

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();
    return Response.json(settings);
  } catch {
    return Response.json({
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
    });
  }
}
