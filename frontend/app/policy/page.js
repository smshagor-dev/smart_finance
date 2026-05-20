import { getMetadataBaseUrl } from "@/lib/app-url";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { PolicyCenterPage } from "@/components/dashboard/policy-center-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata() {
  const siteSettings = await getPublicSiteSettings().catch(() => null);
  const title = "Policy Center";
  const description = "Browse published legal, privacy, and policy pages.";

  return {
    title,
    description,
    metadataBase: getMetadataBaseUrl(siteSettings?.siteUrl),
    alternates: {
      canonical: "/policy",
    },
    openGraph: {
      title,
      description,
      url: "/policy",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PolicyPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <PolicyCenterPage />
      </div>
    </main>
  );
}
