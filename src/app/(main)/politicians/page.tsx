import { PoliticianCard } from "@/components/cards/politician-card";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { politicians } from "@/lib/mock-data";

export default function PoliticiansPage() {
  return (
    <div>
      <PageHeader title="Politicians" description="Search leader profiles, scorecards, promises, ratings, and related public issues." />
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <Input placeholder="Search by name" />
        <Input placeholder="Party" />
        <Input placeholder="State" />
        <Input placeholder="Office level" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {politicians.concat(politicians).map((politician, index) => (
          <PoliticianCard politician={politician} key={`${politician.id}-${index}`} />
        ))}
      </div>
    </div>
  );
}
