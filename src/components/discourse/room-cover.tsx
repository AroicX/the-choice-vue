import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Generated room covers. The room id seeds a PRNG that picks a palette, a
 * pattern style and its parameters, so a room always gets the same cover and
 * no two rooms look alike. Colours are fixed artwork, not theme tokens.
 */

type Palette = { bg: string; ink: string; soft: string };

// Hand-picked two-tone pairs rather than random hues, so every cover reads as
// intentional and holds up in both light and dark UI.
const PALETTES: Palette[] = [
  { bg: "#0E3B2E", ink: "#3FA37C", soft: "#1C5C47" }, // forest
  { bg: "#161B26", ink: "#5B6B8C", soft: "#28304A" }, // ink
  { bg: "#6E3526", ink: "#D08A6A", soft: "#8E4A37" }, // clay
  { bg: "#EDE4D3", ink: "#B59B72", soft: "#D9C8AA" }, // sand
  { bg: "#D8E7F3", ink: "#6F9CC6", soft: "#B6D0E6" }, // sky
  { bg: "#33203A", ink: "#9B6FAE", soft: "#4E3158" } // plum
];

const W = 600;
const H = 240;

function hashSeed(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32: small, fast, deterministic. */
function prng(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;

function contours(rand: Rand, p: Palette) {
  const cx = W * (0.2 + rand() * 0.6);
  const cy = H * (0.2 + rand() * 0.6);
  const gap = 14 + Math.floor(rand() * 10);
  const rings = [];
  for (let r = gap; r < W; r += gap) {
    // Slight squash so rings read as terrain, not a target.
    rings.push(
      <ellipse key={r} cx={cx} cy={cy} rx={r} ry={r * 0.72} fill="none" stroke={p.ink} strokeWidth={1.5} opacity={0.55} />
    );
  }
  return rings;
}

function truchet(rand: Rand, p: Palette) {
  const size = 40 + Math.floor(rand() * 3) * 10;
  const tiles = [];
  for (let x = 0; x < W; x += size) {
    for (let y = 0; y < H; y += size) {
      const flip = rand() > 0.5;
      const half = size / 2;
      const d = flip
        ? `M${x + half} ${y} A${half} ${half} 0 0 1 ${x + size} ${y + half} M${x} ${y + half} A${half} ${half} 0 0 0 ${x + half} ${y + size}`
        : `M${x + half} ${y} A${half} ${half} 0 0 0 ${x} ${y + half} M${x + size} ${y + half} A${half} ${half} 0 0 1 ${x + half} ${y + size}`;
      tiles.push(<path key={`${x}-${y}`} d={d} fill="none" stroke={p.ink} strokeWidth={size / 7} strokeLinecap="round" opacity={0.7} />);
    }
  }
  return tiles;
}

function dotField(rand: Rand, p: Palette) {
  const step = 18 + Math.floor(rand() * 8);
  const freq = 0.01 + rand() * 0.015;
  const phase = rand() * Math.PI * 2;
  const dots = [];
  for (let x = step / 2; x < W; x += step) {
    for (let y = step / 2; y < H; y += step) {
      // Radius follows a gentle wave so the field has a direction.
      const r = 1.2 + ((Math.sin(x * freq + y * freq * 0.6 + phase) + 1) / 2) * (step * 0.28);
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={p.ink} opacity={0.75} />);
    }
  }
  return dots;
}

function bands(rand: Rand, p: Palette) {
  const angle = -35 + rand() * 70;
  const shapes = [];
  let x = -W;
  let index = 0;
  while (x < W * 2) {
    const width = 8 + rand() * 34;
    shapes.push(
      <rect key={index} x={x} y={-H} width={width} height={H * 3} fill={index % 3 === 0 ? p.ink : p.soft} opacity={0.85} />
    );
    x += width + 6 + rand() * 26;
    index += 1;
  }
  return <g transform={`rotate(${angle} ${W / 2} ${H / 2})`}>{shapes}</g>;
}

function waves(rand: Rand, p: Palette) {
  const lines = [];
  const amp = 8 + rand() * 14;
  const len = 120 + rand() * 120;
  const gap = 12 + Math.floor(rand() * 6);
  for (let y = -amp; y < H + amp; y += gap) {
    const shift = rand() * len;
    let d = `M-20 ${y}`;
    for (let x = -20; x <= W + 20; x += 10) {
      d += ` L${x} ${y + Math.sin(((x + shift) / len) * Math.PI * 2) * amp}`;
    }
    lines.push(<path key={y} d={d} fill="none" stroke={p.ink} strokeWidth={1.75} opacity={0.6} />);
  }
  return lines;
}

const STYLES = [contours, truchet, dotField, bands, waves];

const STYLE_BY_NAME = { contours, truchet, dots: dotField, bands, waves };
export type PatternStyle = keyof typeof STYLE_BY_NAME;

/**
 * A single pattern style drawn in white on a transparent background, for
 * laying over a solid colour (e.g. the home carousel). Tune its strength with
 * opacity on the parent.
 */
export function PatternLayer({ style, seed, className }: { style: PatternStyle; seed: string; className?: string }) {
  const shapes = useMemo(
    () => STYLE_BY_NAME[style](prng(hashSeed(seed)), { bg: "none", ink: "#ffffff", soft: "#ffffff" }),
    [seed, style]
  );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block size-full", className)}
      aria-hidden
      focusable="false"
    >
      {shapes}
    </svg>
  );
}

export function RoomPattern({ seed, className }: { seed: string; className?: string }) {
  const art = useMemo(() => {
    const rand = prng(hashSeed(seed));
    const palette = PALETTES[Math.floor(rand() * PALETTES.length)];
    const style = STYLES[Math.floor(rand() * STYLES.length)];
    return { palette, shapes: style(rand, palette) };
  }, [seed]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block size-full", className)}
      aria-hidden
      focusable="false"
    >
      <rect width={W} height={H} fill={art.palette.bg} />
      {art.shapes}
    </svg>
  );
}

/** Uploaded cover when there is one, otherwise the room's generated pattern. */
export function RoomCover({ seed, src, className }: { seed: string; src?: string | null; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <RoomPattern seed={seed} className="absolute inset-0" />
      )}
    </div>
  );
}
