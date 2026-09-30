import Link from "next/link";

/**
 * Minimal auth layout: one centred column on a plain background, no card and
 * no side panel. The brand mark leads; the form carries the rest.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background px-6">
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-[360px]">
          <Link href="/home" aria-label="Choice9ja home" className="mb-8 inline-block rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192x192.png" alt="" className="size-9" />
          </Link>
          {children}
        </div>
      </div>
      <p className="pb-6 text-center text-[12px] text-muted-foreground">© {new Date().getFullYear()} Choice9ja</p>
    </main>
  );
}

/** Heading block shared by every auth screen. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
      {subtitle ? <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
