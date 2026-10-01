import type { Metadata } from "next";
import { FactCheckDetailView } from "@/components/fact-checks/fact-check-detail-view";
import { normalizeFactCheck } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

const VERDICT: Record<string, string> = {
  TRUE: "True", MOSTLY_TRUE: "Mostly true", MIXED: "Mixed", UNVERIFIED: "Unverified",
  MISLEADING: "Misleading", MOSTLY_FALSE: "Mostly false", FALSE: "False"
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/fact-checks/${params.slug}`);
  if (!record) return pageMetadata({ title: "Fact check", description: "A fact check on Choice9ja.", path: `/fact-checks/${params.slug}` });
  const factCheck = normalizeFactCheck(record);
  return pageMetadata({
    title: `${VERDICT[factCheck.verdict.toUpperCase()] ?? "Fact check"}: “${excerpt(factCheck.claim, 80)}”`,
    description: excerpt(factCheck.explanation) || "A fact check on Choice9ja.",
    path: `/fact-checks/${params.slug}`
  });
}

export default function FactCheckDetailPage({ params }: Props) {
  return <FactCheckDetailView factCheckId={params.slug} />;
}
