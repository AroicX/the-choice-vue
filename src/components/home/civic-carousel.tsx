"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useLoginModalStore } from "@/stores/login-modal-store";
import { cn } from "@/lib/utils";

type Action = { label: string; href?: string; onClick?: () => void };

type Slide = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  /** Slide colours are fixed artwork, the same in light and dark mode. */
  background: string;
  accent: string;
  /** Halftone art from scripts/make-carousel-art.py (public/carousel). */
  art: string;
  primary: Action;
  secondary?: Action;
};

const AUTO_ADVANCE_MS = 7_000;

const actionClass = {
  primary:
    "inline-flex h-10 items-center rounded-[10px] bg-white px-4 text-sm font-medium text-[#0F1419] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  secondary:
    "inline-flex h-10 items-center rounded-[10px] border border-white/30 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
};

function SlideAction({
  action,
  variant,
  focusable
}: {
  action: Action;
  variant: keyof typeof actionClass;
  /** Off-screen slides' actions leave the tab order. */
  focusable: boolean;
}) {
  const tabIndex = focusable ? undefined : -1;
  if (action.href) {
    return (
      <Link href={action.href} className={actionClass[variant]} tabIndex={tabIndex}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={actionClass[variant]} tabIndex={tabIndex}>
      {action.label}
    </button>
  );
}

/**
 * Three-slide home carousel: solid colour panels with a faint generated
 * pattern fading in from the right. Native scroll-snap does the swiping; the
 * dots and the auto-advance scroll the track. Auto-advance pauses on hover,
 * focus and touch, and is off under prefers-reduced-motion.
 */
export function CivicCarousel({ dateLabel }: { dateLabel: string }) {
  const router = useRouter();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const openLoginModal = useLoginModalStore((state) => state.open);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const reportIssue = () => {
    if (requireAuth("Sign in to report a civic issue.")) router.push("/issues/create");
  };

  const slides: Slide[] = [
    {
      id: "pulse",
      eyebrow: `Civic pulse · ${dateLabel}`,
      title: (
        <>
          The future of democracy in <span className="text-[#6EE7A0]">Nigeria.</span>
        </>
      ),
      body: "Know your leaders. Track their performance. Hold power to account.",
      background: "#0B2E22",
      accent: "#6EE7A0",
      art: "/carousel/pulse.webp", // Unsplash, Salem Ochidi
      primary: isAuthenticated ? { label: "Rate a leader", href: "/ratings" } : { label: "Create account", href: "/register" },
      secondary: isAuthenticated
        ? { label: "Report an issue", onClick: reportIssue }
        : { label: "Sign in", onClick: () => openLoginModal("Sign in to continue.") }
    },
    {
      id: "rate",
      eyebrow: "Ratings",
      title: "How is your governor really doing?",
      body: "Score leaders on jobs, security, power and more — it takes about a minute.",
      background: "#141A2B",
      accent: "#93A8D8",
      art: "/carousel/rate.webp", // Unsplash, Olumide Bamgbelu
      primary: { label: "Start rating", href: "/ratings" },
      secondary: { label: "Browse leaders", href: "/politicians" }
    },
    {
      id: "report",
      eyebrow: "Issues",
      title: "Seen a problem in your ward?",
      body: "Report broken roads, blackouts or vote buying, and follow it until it’s resolved.",
      background: "#4A2419",
      accent: "#F0A585",
      art: "/carousel/report.webp", // Unsplash, Opeyemi Adisa
      primary: { label: "Report an issue", onClick: reportIssue },
      secondary: { label: "See issues", href: "/issues" }
    }
  ];

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: index * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
  }, []);

  // Track which slide is in view, whether moved by swipe, dot or timer.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setActive(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => goTo((active + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [active, goTo, paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== active}
            className="relative w-full shrink-0 snap-start overflow-hidden"
            style={{ backgroundColor: slide.background }}
          >
            {/* Halftone art fades in from the right so the text side stays calm.
                Its background colour matches the slide, so the fade is seamless. */}
            <Image
              src={slide.art}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 660px"
              priority={index === 0}
              className="object-cover opacity-60 [mask-image:linear-gradient(to_left,black_25%,transparent_80%)]"
            />
            <div className="relative flex min-h-[236px] flex-col justify-between p-6 sm:p-7">
              <div>
                <p className="text-[13px] font-medium" style={{ color: slide.accent }} suppressHydrationWarning>
                  {slide.eyebrow}
                </p>
                <h2 className="mt-2 max-w-[440px] text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[30px]">
                  {slide.title}
                </h2>
                <p className="mt-2 max-w-[420px] text-[15px] leading-5 text-white/70">{slide.body}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <SlideAction action={slide.primary} variant="primary" focusable={index === active} />
                {slide.secondary ? (
                  <SlideAction action={slide.secondary} variant="secondary" focusable={index === active} />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Choose slide">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Slide ${index + 1}`}
            onClick={() => goTo(index)}
            className="grid h-6 place-items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
                index === active ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
