import { electionPhase, normalizeElection } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { fetchApiRecord } from "@/lib/server-api";

export const runtime = "edge";
export const alt = "A mock election on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const LABEL = { live: "Mock election · Voting now", upcoming: "Mock election · Coming soon", closed: "Mock election · Results" };

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/elections/${params.slug}`);
  if (!record) return renderOgImage({ label: "Mock election", title: "Cast your vote on Choice9ja" });
  const election = normalizeElection(record);
  const names = election.options.map((option) => option.label);
  return renderOgImage({
    background: "forest",
    label: LABEL[electionPhase(election.status)],
    title: election.title,
    subtitle: names.length > 4 ? `${names.slice(0, 4).join(" · ")} +${names.length - 4}` : names.join(" · "),
    portraits: election.options.map((option) => option.image ?? "").filter(Boolean)
  });
}
