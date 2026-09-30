import type { Metadata } from "next";
import { ElectionDetailView } from "@/components/elections/election-detail-view";
import { electionPhase, normalizeElection } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/elections/${params.slug}`);
  if (!record) return pageMetadata({ title: "Mock election", description: "Vote in a mock election on Choice9ja.", path: `/elections/${params.slug}` });
  const election = normalizeElection(record);
  const names = election.options.map((option) => option.label).join(", ");
  const phase = electionPhase(election.status);
  const call = phase === "live" ? "Cast your vote" : phase === "upcoming" ? "Voting opens soon" : "See the results";
  return pageMetadata({
    title: election.title,
    description: excerpt(`${call}: ${names}. ${election.description ?? ""}`),
    path: `/elections/${params.slug}`
  });
}

export default function ElectionDetailPage({ params }: Props) {
  return <ElectionDetailView electionId={params.slug} />;
}
