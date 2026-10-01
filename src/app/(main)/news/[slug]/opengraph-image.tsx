import { normalizeNews } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { excerpt, fetchApiRecord } from "@/lib/server-api";

export const runtime = "edge";
export const alt = "A civic news story on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/news/${params.slug}`);
  if (!record) return renderOgImage({ background: "ink", label: "News", title: "Civic news on Choice9ja" });
  const article = normalizeNews(record);
  return renderOgImage({
    background: "ink",
    label: ["News", article.source].filter(Boolean).join(" · "),
    title: excerpt(article.title, 110),
    subtitle: article.summary ? excerpt(article.summary, 110) : undefined
  });
}
