import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMetadataBaseUrl } from "@/lib/app-url";
import { getCurrentUser } from "@/lib/auth";
import { getPublicCustomPageBySlug } from "@/lib/custom-pages";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function PublicCustomPageContent({ page, inDashboard = false }) {
  return (
    <div className={inDashboard ? "" : "mx-auto max-w-4xl"}>
      <section className="overflow-hidden rounded-[2rem] border border-border bg-white/96 p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-slate-900/70 dark:text-slate-100 sm:p-8 lg:p-10">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            {inDashboard ? "Policy Page" : "Public Page"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{page.title}</h1>
          {page.shortDescription ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{page.shortDescription}</p>
          ) : null}
        </div>

        <article className="custom-page-content pt-6 text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: page.content }} />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const [page, siteSettings] = await Promise.all([
      getPublicCustomPageBySlug(slug),
      getPublicSiteSettings().catch(() => null),
    ]);

    if (!page) {
      return {
        title: "Page not found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = page.metaTitle || page.title;
    const description = page.metaDescription || page.shortDescription || siteSettings?.siteDescription || "Custom page";
    const keywords = (page.metaKeywords || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title,
      description,
      keywords,
      metadataBase: getMetadataBaseUrl(siteSettings?.siteUrl),
      alternates: {
        canonical: `/${page.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `/${page.slug}`,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Page",
    };
  }
}

export default async function PublicCustomPage({ params }) {
  const { slug } = await params;
  const [page, user, siteSettings] = await Promise.all([
    getPublicCustomPageBySlug(slug),
    getCurrentUser().catch(() => null),
    getPublicSiteSettings().catch(() => null),
  ]);

  if (!page || page.status !== "published") {
    notFound();
  }

  if (user) {
    const siteName = siteSettings?.siteName || "Finance Tracker";
    const siteTagline = siteSettings?.siteTagline || "Personal finance command center";

    return (
      <DashboardShell user={user} siteName={siteName} siteTagline={siteTagline}>
        <PublicCustomPageContent page={page} inDashboard />
      </DashboardShell>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PublicCustomPageContent page={page} />
    </main>
  );
}
