import type { Metadata } from "next";
import { PoliticianDetailView } from "@/components/politicians/politician-detail-view";
import { normalizePolitician, ratingOfficeLabel } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/politicians/${params.slug}`);
  if (!record) return pageMetadata({ title: "Politician", description: "Profile and scorecard on Choice9ja.", path: `/politicians/${params.slug}` });
  const politician = normalizePolitician(record);
  const office = ratingOfficeLabel(politician.position).replace(/s$/, "");
  const approval = politician.approvalScore > 0 ? `${Math.round(politician.approvalScore)}% public approval. ` : "";
  return pageMetadata({
    title: `${politician.name} · ${office}`,
    description: excerpt(`${approval}${politician.party ? `${politician.party}. ` : ""}${politician.biography ?? "See their scorecard, promises and public rating."}`),
    path: `/politicians/${params.slug}`
  });
}

export default function PoliticianDetailPage({ params }: Props) {
  return <PoliticianDetailView politicianId={params.slug} />;
}
