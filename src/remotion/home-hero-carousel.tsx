import { AbsoluteFill, Series, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type HomeHeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export const HOME_HERO_SLIDES: HomeHeroSlide[] = [
  {
    eyebrow: "Civic dashboard",
    title: "The future of democracy in Nigeria.",
    description: "Know your leaders. Track performance. Hold power accountable with live civic intelligence.",
    primaryLabel: "Explore civic feed",
    primaryHref: "/feed",
    secondaryLabel: "Report an issue",
    secondaryHref: "/issues/create"
  },
  {
    eyebrow: "Accountability",
    title: "Track leaders by results, not rhetoric.",
    description: "Follow ratings, scorecards, and public records so performance stays visible between elections.",
    primaryLabel: "Browse politicians",
    primaryHref: "/politicians",
    secondaryLabel: "View ratings",
    secondaryHref: "/ratings"
  },
  {
    eyebrow: "Citizen voice",
    title: "Report issues where they happen.",
    description: "Surface local problems, rally attention, and push for responses from the people who can fix them.",
    primaryLabel: "Report an issue",
    primaryHref: "/issues/create",
    secondaryLabel: "Browse issues",
    secondaryHref: "/issues"
  },
  {
    eyebrow: "Public opinion",
    title: "Shape the conversation with your vote.",
    description: "Join live polls and discourse that turn everyday civic questions into measurable public signal.",
    primaryLabel: "Join a poll",
    primaryHref: "/polls",
    secondaryLabel: "Enter discourse",
    secondaryHref: "/discourse"
  }
];

export const HOME_HERO_FPS = 30;
export const HOME_HERO_FRAMES_PER_SLIDE = 90;
export const HOME_HERO_WIDTH = 1100;
export const HOME_HERO_HEIGHT = 340;
export const HOME_HERO_DURATION = HOME_HERO_SLIDES.length * HOME_HERO_FRAMES_PER_SLIDE;

export function slideIndexFromFrame(frame: number) {
  const total = HOME_HERO_DURATION;
  const normalized = ((frame % total) + total) % total;
  return Math.min(HOME_HERO_SLIDES.length - 1, Math.floor(normalized / HOME_HERO_FRAMES_PER_SLIDE));
}

function HeroSlide({ slide }: { slide: HomeHeroSlide }) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.7 }
  });

  const exitStart = HOME_HERO_FRAMES_PER_SLIDE - 18;
  const opacity = interpolate(frame, [0, 14, exitStart, HOME_HERO_FRAMES_PER_SLIDE - 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const translateY = interpolate(enter, [0, 1], [32, 0]);
  const titleSize = width < 720 ? 34 : width < 960 ? 44 : 56;
  const bodySize = width < 720 ? 15 : 18;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`
      }}
    >
      <div style={{ maxWidth: 760, width: "100%" }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgb(var(--primary))"
          }}
        >
          {slide.eyebrow}
        </p>
        <h1
          style={{
            margin: "16px 0 0",
            fontSize: titleSize,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            backgroundImage: "linear-gradient(90deg, rgb(var(--primary)), #10b981, #84cc16)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          {slide.title}
        </h1>
        <p
          style={{
            margin: "18px 0 0",
            maxWidth: 640,
            fontSize: bodySize,
            lineHeight: 1.65,
            color: "rgb(var(--muted-foreground))"
          }}
        >
          {slide.description}
        </p>
      </div>
    </AbsoluteFill>
  );
}

export function HomeHeroCarouselComposition() {
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <Series>
        {HOME_HERO_SLIDES.map((slide) => (
          <Series.Sequence key={slide.title} durationInFrames={HOME_HERO_FRAMES_PER_SLIDE}>
            <HeroSlide slide={slide} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
}
