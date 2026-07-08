import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Poll } from "@/types";

export function PollCard({ poll }: { poll: Poll }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{poll.question}</CardTitle>
          <Badge variant="secondary">{poll.expiresIn}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {poll.options.map((option) => (
            <div key={option.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{option.label}</span>
                <span className="font-medium">{option.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${option.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{poll.votes.toLocaleString()} votes</span>
          <Button size="sm" asChild>
            <Link href={`/polls/${poll.id}`}>Vote</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
