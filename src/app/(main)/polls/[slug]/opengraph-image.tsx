import { normalizePoll } from "@/lib/content-utils";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { excerpt, fetchApiRecord } from "@/lib/server-api";

export const runtime = "edge";
export const alt = "A civic poll on Choice9ja";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await fetchApiRecord(`/polls/${params.slug}`);
  if (!record) return renderOgImage({ background: "ink", label: "Poll", title: "Have your say on Choice9ja" });
  const poll = normalizePoll(record);
  const votes = poll.votes;
  return renderOgImage({
    background: "ink",
    label: `Poll · ${votes.toLocaleString()} ${votes === 1 ? "vote" : "votes"}${poll.closed ? " · Final results" : ""}`,
    title: excerpt(poll.question, 110),
    subtitle: poll.options.map((option) => option.label).slice(0, 4).join("  ·  ")
  });
}
