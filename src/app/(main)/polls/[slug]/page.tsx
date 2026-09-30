import type { Metadata } from "next";
import { PollDetailView } from "@/components/polls/poll-detail-view";
import { normalizePoll } from "@/lib/content-utils";
import { excerpt, fetchApiRecord, pageMetadata } from "@/lib/server-api";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const record = await fetchApiRecord(`/polls/${params.slug}`);
  if (!record) return pageMetadata({ title: "Poll", description: "Vote in a civic poll on Choice9ja.", path: `/polls/${params.slug}` });
  const poll = normalizePoll(record);
  return pageMetadata({
    title: excerpt(poll.question, 90),
    description: excerpt(`${poll.closed ? "Final results" : "Have your say"}: ${poll.options.map((option) => option.label).join(" · ")}`),
    path: `/polls/${params.slug}`
  });
}

export default function PollDetailPage({ params }: Props) {
  return <PollDetailView pollId={params.slug} />;
}
