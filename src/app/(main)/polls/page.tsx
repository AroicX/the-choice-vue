import { PollCard } from "@/components/cards/poll-card";
import { PageHeader } from "@/components/shared/page-header";
import { TabList } from "@/components/ui/tabs";
import { polls } from "@/lib/mock-data";

export default function PollsPage() {
  return (
    <div>
      <PageHeader title="Polls" description="Vote on active civic questions and explore community sentiment." />
      <TabList tabs={["Active", "Trending", "Local", "My Votes", "Closed"]} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {polls.concat(polls).map((poll, index) => <PollCard key={`${poll.id}-${index}`} poll={poll} />)}
      </div>
    </div>
  );
}
