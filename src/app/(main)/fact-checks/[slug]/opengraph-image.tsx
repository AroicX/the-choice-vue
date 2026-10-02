import { normalizeFactCheck } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { excerpt, fetchApiRecord } from "@/lib/server-api";

export const runtime = "nodejs";
export const alt = "A fact check on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const VERDICT: Record<string, string> = {
  TRUE: "True", MOSTLY_TRUE: "Mostly true", MIXED: "Mixed", UNVERIFIED: "Unverified",
  MISLEADING: "Misleading", MOSTLY_FALSE: "Mostly false", FALSE: "False"
};

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/fact-checks/${params.slug}`);
  if (!record) return renderOgImage({ background: "ink", label: "Fact check", title: "Claims, checked, on Choice9ja" });
  const factCheck = normalizeFactCheck(record);
  return renderOgImage({
    background: "ink",
    label: `Fact check · Verdict: ${VERDICT[factCheck.verdict.toUpperCase()] ?? "Unverified"}`,
    title: `“${excerpt(factCheck.claim, 100)}”`
  });
}
