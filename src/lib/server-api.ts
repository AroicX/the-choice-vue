import type { Metadata } from "next";

/**
 * Server-side API reads for metadata and link previews. Short timeout and a
 * null result on any failure: a slow API must never break page rendering or
 * a social preview, it just falls back to generic copy.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://thechoice9ja-api-production.up.railway.app/api").replace(/\/$/, "");

type Json = Record<string, unknown>;

export async function fetchApiRecord(path: string, timeoutMs = 4000): Promise<Json | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      next: { revalidate: 300 }
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Json;
    // The API wraps records inconsistently: { data }, { election }, { post }...
    for (const key of ["data", "election", "post", "discussion", "poll"]) {
      const value = payload[key];
      if (value && typeof value === "object" && !Array.isArray(value)) return value as Json;
    }
    return payload;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const SITE_NAME = "Choice9ja";
export const SITE_DESCRIPTION =
  "Know your leaders. Track their performance. Rate politicians, report local issues and join civic conversations in Nigeria.";

/** Trim to a length that fits social previews, on a word boundary. */
export function excerpt(text: unknown, max = 160) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max).replace(/\s+\S*$/, "")}…`;
}


/** Title/description plus matching Open Graph and Twitter fields. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title: `${title} · ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "article" },
    twitter: { card: "summary_large_image", title, description }
  };
}
