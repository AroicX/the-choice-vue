import Link from "next/link";
import { mainNav, mobileNav } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { issues, politicians, polls } from "@/lib/mock-data";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/home" className="flex items-center gap-2 font-bold text-primary">
            <img src="/legacy/logo.png" alt="Choice9ja" className="h-9 w-9 rounded-md object-contain" />
            TheChoice9ja
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_330px]">
        <aside className="sticky top-0 hidden h-screen border-r bg-card px-4 py-5 lg:block">
          <Link href="/home" className="mb-8 flex items-center gap-3 font-bold text-primary">
            <img src="/legacy/logo.png" alt="Choice9ja" className="h-10 w-10 rounded-md object-contain" />
            <span>TheChoice9ja</span>
          </Link>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-5 left-4 right-4 space-y-3">
            <Button className="w-full">Create report</Button>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <main className="min-h-screen px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>

        <aside className="sticky top-0 hidden h-screen overflow-y-auto border-l bg-card px-5 py-6 xl:block">
          <div className="space-y-5">
            <Card className="p-4">
              <h3 className="font-semibold">Trending Issues</h3>
              <div className="mt-3 space-y-3">
                {issues.slice(0, 3).map((issue) => (
                  <Link href={`/issues/${issue.id}`} key={issue.id} className="block rounded-md border p-3 hover:bg-accent">
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{issue.location}</p>
                  </Link>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold">Top Scorecards</h3>
              <div className="mt-3 space-y-3">
                {politicians.map((person) => (
                  <div key={person.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.position}</p>
                    </div>
                    <Badge variant="secondary">{person.performanceScore}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold">Active Poll</h3>
              <p className="mt-2 text-sm text-muted-foreground">{polls[0].question}</p>
              <Button className="mt-4 w-full" variant="outline">Vote now</Button>
            </Card>
          </div>
        </aside>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-1 py-3 text-xs font-medium text-muted-foreground">
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
