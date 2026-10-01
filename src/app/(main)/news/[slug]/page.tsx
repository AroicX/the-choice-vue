import type { Metadata } from "next";
import { NewsArticleView } from "@/components/news/news-article-view";
import { normalizeNews } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/news/${params.slug}`);
  if (!record) return pageMetadata({ title: "News", description: "Civic news on Choice9ja.", path: `/news/${params.slug}` });
  const article = normalizeNews(record);
  return pageMetadata({
    title: article.title,
    description: excerpt(article.summary ?? article.content) || "Civic news on Choice9ja.",
    path: `/news/${params.slug}`
  });
}

export default function NewsDetailPage({ params }: Props) {
  return <NewsArticleView articleId={params.slug} />;
}
