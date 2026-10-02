import { normalizeIssue } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { excerpt, fetchApiRecord } from "@/lib/server-api";

export const runtime = "nodejs";
export const alt = "A civic issue on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/issues/${params.slug}`);
  if (!record) return renderOgImage({ background: "clay", label: "Issue", title: "Report what you see on Choice9ja" });
  const issue = normalizeIssue(record);
  const upvotes = issue.upvotes;
  return renderOgImage({
    background: "clay",
    label: `${issue.category} · ${upvotes.toLocaleString()} ${upvotes === 1 ? "upvote" : "upvotes"}`,
    title: excerpt(issue.title, 100),
    subtitle: issue.location
  });
}
