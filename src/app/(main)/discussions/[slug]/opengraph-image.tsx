import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { excerpt, fetchApiRecord } from "@/lib/server-api";

export const runtime = "edge";
export const alt = "A discussion room on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/discussions/${params.slug}`);
  if (!record) return renderOgImage({ background: "clay", label: "Discussion", title: "Join the conversation on Choice9ja" });
  const counts = (record._count ?? {}) as { rooms?: number; posts?: number };
  const members = Number(counts.rooms ?? 0);
  const posts = Number(counts.posts ?? 0);
  return renderOgImage({
    background: "clay",
    label: `Discussion · ${members.toLocaleString()} ${members === 1 ? "member" : "members"} · ${posts.toLocaleString()} ${posts === 1 ? "post" : "posts"}`,
    title: excerpt(record.topic, 90),
    subtitle: excerpt(record.question, 120) || undefined
  });
}
