import Link from "next/link";
import { Search } from "lucide-react";
import { controlNav } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function ControlShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r bg-card p-4 lg:block">
        <Link href="/control/dashboard" className="mb-6 flex items-center gap-3 font-bold text-primary">
          <img src="/legacy/logo.png" alt="Choice9ja" className="h-10 w-10 rounded-md object-contain" />
          Control
        </Link>
        <nav className="space-y-1">
          {controlNav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:px-6">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search users, issues, politicians, reports..." />
          </div>
          <ThemeToggle />
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
