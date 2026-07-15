"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CallbackListener, PlayerRef } from "@remotion/player";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HOME_HERO_DURATION,
  HOME_HERO_FPS,
  HOME_HERO_FRAMES_PER_SLIDE,
  HOME_HERO_HEIGHT,
  HOME_HERO_SLIDES,
  HOME_HERO_WIDTH,
  HomeHeroCarouselComposition,
  slideIndexFromFrame
} from "@/remotion/home-hero-carousel";

const Player = dynamic(() => import("@remotion/player").then((module) => module.Player), { ssr: false });

export function HomeHeroCarousel() {
  const playerRef = useRef<PlayerRef>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [ready, setReady] = useState(false);
  const slide = HOME_HERO_SLIDES[activeSlide] ?? HOME_HERO_SLIDES[0];

  const syncSlide = useCallback<CallbackListener<"frameupdate">>(({ detail }) => {
    setActiveSlide(slideIndexFromFrame(detail.frame));
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    let attached = false;
    let player: PlayerRef | null = null;

    const attach = () => {
      player = playerRef.current;
      if (!player || attached) return false;
      player.addEventListener("frameupdate", syncSlide);
      attached = true;
      return true;
    };

    if (attach()) {
      return () => {
        player?.removeEventListener("frameupdate", syncSlide);
      };
    }

    const timer = window.setInterval(() => {
      if (attach()) window.clearInterval(timer);
    }, 50);

    return () => {
      window.clearInterval(timer);
      player?.removeEventListener("frameupdate", syncSlide);
    };
  }, [ready, syncSlide]);

  function goToSlide(index: number) {
    setActiveSlide(index);
    playerRef.current?.seekTo(index * HOME_HERO_FRAMES_PER_SLIDE);
    playerRef.current?.play();
  }

  return (
    <section className="hero-grid relative min-w-0 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-card via-background to-accent/30 p-5 shadow-panel sm:p-10">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${HOME_HERO_WIDTH} / ${HOME_HERO_HEIGHT}` }}>
          {ready ? (
            <Player
              ref={playerRef}
              component={HomeHeroCarouselComposition}
              durationInFrames={HOME_HERO_DURATION}
              compositionWidth={HOME_HERO_WIDTH}
              compositionHeight={HOME_HERO_HEIGHT}
              fps={HOME_HERO_FPS}
              style={{ width: "100%", height: "100%" }}
              loop
              autoPlay
              controls={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
              acknowledgeRemotionLicense
            />
          ) : (
            <div className="flex h-full max-w-3xl flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{slide.eyebrow}</p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                <span className="civic-gradient-text">{slide.title}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {slide.description}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={slide.primaryHref}>{slide.primaryLabel}</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={slide.secondaryHref}>{slide.secondaryLabel}</Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {HOME_HERO_SLIDES.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
              aria-current={index === activeSlide}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === activeSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
