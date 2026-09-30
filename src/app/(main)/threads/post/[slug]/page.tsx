import type { Metadata } from "next";
import { PostDetailView } from "@/components/posts/post-detail-view";
import { normalizePost } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/posts/${params.slug}`);
  if (!record) return pageMetadata({ title: "Post", description: "A post on Choice9ja.", path: `/threads/post/${params.slug}` });
  const post = normalizePost(record);
  return pageMetadata({
    title: `${post.author} on Choice9ja`,
    description: excerpt(post.message) || "A post on Choice9ja.",
    path: `/threads/post/${params.slug}`
  });
}

export default function ThreadPostPage({ params }: Props) {
  return <PostDetailView slug={params.slug} />;
}
