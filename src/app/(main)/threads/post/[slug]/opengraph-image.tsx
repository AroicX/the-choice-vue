import { normalizePost } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { excerpt, fetchApiRecord } from "@/lib/server-api";

export const runtime = "edge";
export const alt = "A post on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/posts/${params.slug}`);
  if (!record) return renderOgImage({ label: "Post", title: "Join the conversation on Choice9ja" });
  const post = normalizePost(record);
  return renderOgImage({
    background: "forest",
    label: post.topic ? `In ${excerpt(post.topic, 48)}` : "Post",
    title: `“${excerpt(post.message, 110) || "Shared a photo"}”`,
    subtitle: `${post.author} ${post.handle.startsWith("@") ? post.handle : `@${post.handle}`}`,
    portraits: post.user?.profilePic ? [post.user.profilePic] : []
  });
}
