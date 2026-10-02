import { normalizePolitician, ratingOfficeLabel } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { fetchApiRecord } from "@/lib/server-api";

export const runtime = "nodejs";
export const alt = "A politician's scorecard on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/politicians/${params.slug}`);
  if (!record) return renderOgImage({ background: "ink", label: "Scorecard", title: "Know your leaders on Choice9ja" });
  const politician = normalizePolitician(record);
  const office = ratingOfficeLabel(politician.position).replace(/s$/, "");
  const place = [office, politician.state].filter(Boolean).join(" · ");
  return renderOgImage({
    background: "ink",
    label: politician.approvalScore > 0 ? `${Math.round(politician.approvalScore)}% public approval` : "Not yet rated · Be the first",
    title: politician.name,
    subtitle: [place, politician.party].filter(Boolean).join(" · "),
    hero: politician.imageUrl ?? null
  });
}
