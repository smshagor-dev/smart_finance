"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Eye, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { CkeditorField } from "@/components/dashboard/ckeditor-field";
import { formatDateTime } from "@/lib/utils";

const defaultForm = {
  title: "",
  slug: "",
  shortDescription: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: "draft",
};

function readJson(response) {
  return response.text().then((text) => {
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  });
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 160);
}

function StatusBadge({ status }) {
  const active = status === "published";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
      {active ? "Published" : "Draft"}
    </span>
  );
}

export function AdminCustomPageEditor({ pageId = "" }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(Boolean(pageId));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [slugEdited, setSlugEdited] = useState(Boolean(pageId));
  const [pageMeta, setPageMeta] = useState(null);

  useEffect(() => {
    if (!pageId) {
      return;
    }

    let active = true;

    fetch(`/api/admin/pages/${pageId}`, { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        if (!active) return;

        if (!data.item) {
          throw new Error(data.error || "Page not found");
        }

        setForm({
          title: data.item.title || "",
          slug: data.item.slug || "",
          shortDescription: data.item.shortDescription || "",
          content: data.item.content || "",
          metaTitle: data.item.metaTitle || "",
          metaDescription: data.item.metaDescription || "",
          metaKeywords: data.item.metaKeywords || "",
          status: data.item.status || "draft",
        });
        setPageMeta(data.item);
        setSlugEdited(true);
        setLoading(false);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Failed to load page");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageId]);

  const previewHref = useMemo(() => (form.slug ? `/${form.slug}` : ""), [form.slug]);

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function submitWithStatus(status) {
    setSubmitting(status);
    setError("");

    const response = await fetch(pageId ? `/api/admin/pages/${pageId}` : "/api/admin/pages", {
      method: pageId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        slug: slugify(form.slug || form.title),
        status,
      }),
    });
    const data = await readJson(response);
    setSubmitting("");

    if (!response.ok) {
      setError(data.error || "Could not save page");
      toast.push(data.error || "Could not save page", "error");
      return;
    }

    const item = data.item;
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      shortDescription: item.shortDescription || "",
      content: item.content || "",
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      metaKeywords: item.metaKeywords || "",
      status: item.status || status,
    });
    setPageMeta(item);
    setSlugEdited(true);
    toast.push(status === "published" ? "Page published" : "Draft saved");

    if (!pageId && item?.id) {
      router.replace(`/dashboard/admin/custom-pages/${item.id}`);
      router.refresh();
    }
  }

  if (loading) {
    return <LoadingSkeleton rows={12} />;
  }

  if (error && !pageMeta && pageId) {
    return <EmptyState title="Could not load page" description={error} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Page Studio</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{pageId ? "Edit custom page" : "Create custom page"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Build polished public pages with rich content, custom SEO, and publish controls.
            </p>
            {pageMeta ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <StatusBadge status={form.status} />
                <span>Updated {formatDateTime(pageMeta.updatedAt)}</span>
                {pageMeta.publishedAt ? <span>Published {formatDateTime(pageMeta.publishedAt)}</span> : null}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/admin/custom-pages">
              <Button variant="secondary">Back to list</Button>
            </Link>
            {form.status === "published" && previewHref ? (
              <a href={previewHref} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              </a>
            ) : null}
            <Button className="gap-2" variant="secondary" disabled={Boolean(submitting)} onClick={() => submitWithStatus("draft")}>
              <Save className="h-4 w-4" />
              Save draft
            </Button>
            <Button className="gap-2" disabled={Boolean(submitting)} onClick={() => submitWithStatus("published")}>
              <Eye className="h-4 w-4" />
              {pageId ? "Update & publish" : "Publish page"}
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6">
        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">1. Page details</h2>
            <p className="mt-1 text-sm text-slate-500">Set the public-facing title, URL slug, and supporting description.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Title</span>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Privacy Policy"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Slug</span>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  updateField("slug", slugify(event.target.value));
                }}
                placeholder="privacy-policy"
              />
              <p className="mt-2 text-xs text-slate-500">Public URL: {previewHref || "/your-page-slug"}</p>
            </label>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-medium">Short description</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.shortDescription}
                onChange={(event) => updateField("shortDescription", event.target.value)}
                placeholder="Short summary shown above the page content and used as SEO fallback."
              />
            </label>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">2. Content editor</h2>
            <p className="mt-1 text-sm text-slate-500">Write and format your page content using headings, lists, tables, links, blockquotes, images, code snippets, and embeds.</p>
          </div>
          <CkeditorField value={form.content} onChange={(nextValue) => updateField("content", nextValue)} />
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">3. SEO settings</h2>
            <p className="mt-1 text-sm text-slate-500">Control metadata for search engines and social previews.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Meta title</span>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.metaTitle}
                onChange={(event) => updateField("metaTitle", event.target.value)}
                placeholder="Privacy Policy | Finance Tracker"
              />
              <p className="mt-2 text-xs text-slate-500">{form.metaTitle.length}/160 characters</p>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Meta keywords</span>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.metaKeywords}
                onChange={(event) => updateField("metaKeywords", event.target.value)}
                placeholder="privacy policy, finance tracker, legal"
              />
            </label>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-medium">Meta description</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.metaDescription}
                onChange={(event) => updateField("metaDescription", event.target.value)}
                placeholder="Describe what this page covers for SEO and previews."
              />
              <p className="mt-2 text-xs text-slate-500">{form.metaDescription.length}/320 characters</p>
            </label>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">4. Publish settings</h2>
            <p className="mt-1 text-sm text-slate-500">Choose whether this page stays private as draft or becomes publicly available.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <label>
              <span className="mb-2 block text-sm font-medium">Status</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <div className="rounded-3xl border border-border bg-muted/40 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={form.status} />
                {pageMeta?.publishedAt ? <span className="text-sm text-slate-500">Published at {formatDateTime(pageMeta.publishedAt)}</span> : <span className="text-sm text-slate-500">This page is not public yet.</span>}
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Draft pages are hidden from the public route. Published pages become available at <span className="font-medium text-primary">{previewHref || "/your-slug"}</span>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
