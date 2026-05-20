import sanitizeHtml from "sanitize-html";
import { prisma } from "./prisma.js";

export const PAGE_STATUSES = ["draft", "published"];
export const POLICY_PAGE_KEYWORDS = [
  "policy",
  "privacy",
  "terms",
  "condition",
  "refund",
  "return",
  "cancellation",
  "cookie",
  "legal",
  "gdpr",
  "compliance",
  "agreement",
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SANITIZE_OPTIONS = {
  allowedTags: [
    "a",
    "abbr",
    "article",
    "aside",
    "b",
    "blockquote",
    "br",
    "caption",
    "code",
    "col",
    "colgroup",
    "dd",
    "del",
    "div",
    "dl",
    "dt",
    "em",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "iframe",
    "img",
    "ins",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "section",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: [
      "src",
      "width",
      "height",
      "title",
      "allow",
      "allowfullscreen",
      "frameborder",
    ],
    "*": ["class", "style", "id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
      color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
      "font-size": [/^\d+(?:px|em|rem|%)$/],
      width: [/^\d+(?:px|%)$/],
      height: [/^\d+(?:px|%)$/],
    },
    img: {
      float: [/^left$/, /^right$/, /^none$/],
    },
  },
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "youtu.be",
    "player.vimeo.com",
    "www.dailymotion.com",
  ],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    }, true),
  },
};

export function sanitizePageSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 160);
}

export function isValidPageSlug(value) {
  return SLUG_PATTERN.test(String(value || ""));
}

export function sanitizePageContent(value) {
  return sanitizeHtml(String(value || ""), SANITIZE_OPTIONS).trim();
}

export function normalizePageText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

export function serializeCustomPage(page) {
  if (!page) {
    return null;
  }

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    shortDescription: page.shortDescription,
    content: page.content,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    metaKeywords: page.metaKeywords,
    status: page.status,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    publishedAt: page.publishedAt,
  };
}

export function isPolicyPage(page) {
  const haystack = [
    page?.slug,
    page?.title,
    page?.shortDescription,
    page?.metaTitle,
    page?.metaKeywords,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return POLICY_PAGE_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export async function listPublishedPolicyPages() {
  const pages = await prisma.customPage.findMany({
    where: {
      status: "published",
    },
    orderBy: [
      { publishedAt: "desc" },
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  return pages.filter(isPolicyPage).map(serializeCustomPage);
}

export async function ensureUniquePageSlug(slug, excludeId = "") {
  const existing = await prisma.customPage.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  return !existing;
}

export function resolvePublishedAt(status, existingPublishedAt = null) {
  if (status === "published") {
    return existingPublishedAt || new Date();
  }

  return null;
}
