import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp01Icon, Comment01Icon, Location01Icon } from "@/lib/icons";
import type { Issue } from "@/types";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{issue.title}</CardTitle>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <AppIcon icon={Location01Icon} size={16} /> {issue.location}
            </p>
          </div>
          <Badge variant={issue.priority === "High" ? "warning" : "secondary"}>{issue.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{issue.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{issue.category}</Badge>
          <Badge variant="info">{issue.status.replaceAll("_", " ")}</Badge>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><AppIcon icon={ArrowUp01Icon} size={16} />{issue.upvotes}</span>
            <span className="flex items-center gap-1"><AppIcon icon={Comment01Icon} size={16} />{issue.comments}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/issues/${issue.id}`}>Track issue</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
