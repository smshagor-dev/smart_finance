import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicPolicyPages } from "@/lib/custom-pages";
import { getPublicSiteSettings } from "@/lib/site-settings";

function formatDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export async function PolicyCenterPage({ inDashboard = false }) {
  const [pages, siteSettings] = await Promise.all([
    getPublicPolicyPages(),
    getPublicSiteSettings().catch(() => null),
  ]);

  return (
    <section className={inDashboard ? "space-y-6" : ""}>
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Policy Center</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Legal and policy pages</h1>
            <p className="mt-4 text-base leading-7 text-slate-500">
              Explore published privacy, legal, and compliance content for {siteSettings?.siteName || "Finance Tracker"}.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-2 text-sm text-slate-500">
            <FileText className="h-4 w-4 text-primary" />
            {pages.length} published {pages.length === 1 ? "page" : "pages"}
          </div>
        </div>

        <div className="pt-6">
          {pages.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pages.map((page) => {
                const updatedText = formatDate(page.updatedAt || page.publishedAt);

                return (
                  <Link key={page.id} href={`/${page.slug}`} className="group block h-full">
                    <Card className="flex h-full flex-col rounded-[1.75rem] bg-white/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_50px_rgba(15,118,110,0.12)] dark:bg-slate-900/70">
                      <div className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-xl font-semibold tracking-tight">{page.title}</h2>
                          <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                            Policy
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                          {page.shortDescription || "Open this page to read the full published policy details."}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
                          <div className="min-h-5 text-xs text-slate-500">
                            {updatedText ? `Updated ${updatedText}` : null}
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">
                            Read Policy
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No published policy pages yet"
              description="Publish privacy, terms, refund, or other policy pages from the admin custom pages area and they will appear here automatically."
            />
          )}
        </div>
      </div>
    </section>
  );
}
