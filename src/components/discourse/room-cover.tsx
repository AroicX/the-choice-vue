import { cn } from "@/lib/utils";

/**
 * Room covers: an owner-uploaded image when there is one, otherwise halftone
 * art matched to the room's topic. The art files are transparent dot masks
 * (scripts/make-carousel-art.py -> public/covers), coloured here with one of
 * a few palettes, so one image serves every colourway. The room id picks the
 * palette (and the image, when no topic matches), so a room's cover is stable.
 */

type Palette = { bg: string; ink: string };

// Fixed artwork colours, not theme tokens: covers look the same in both modes.
const PALETTES: Palette[] = [
  { bg: "#0E3B2E", ink: "#3FA37C" }, // forest
  { bg: "#161B26", ink: "#5B6B8C" }, // ink
  { bg: "#6E3526", ink: "#D08A6A" }, // clay
  { bg: "#EDE4D3", ink: "#B59B72" }, // sand
  { bg: "#D8E7F3", ink: "#6F9CC6" }, // sky
  { bg: "#33203A", ink: "#9B6FAE" } // plum
];

// First match wins, so more specific topics come first.
const TOPICS: Array<{ id: string; keywords: RegExp }> = [
  { id: "elections", keywords: /elect|vote|voting|ballot|democra|campaign|inec|candidate/i },
  { id: "power", keywords: /power|electric|energy|grid|nepa|blackout|light bill/i },
  { id: "economy", keywords: /econom|subsid|fuel|petrol|inflation|naira|price|cost of living|tax|budget|exchange rate|palliative|money|debt/i },
  { id: "education", keywords: /educat|school|student|universit|teacher|asuu|exam/i },
  { id: "health", keywords: /health|hospital|medic|doctor|nurse|disease|drug/i },
  { id: "infrastructure", keywords: /road|bridge|infrastruct|transport|rail|construct|housing|shelter/i },
  { id: "environment", keywords: /water|sanitation|flood|environment|climate|pollution|erosion/i },
  { id: "government", keywords: /foreign|diploma|federal|government|senate|assembly|policy|public office|allowance|constitution/i },
  { id: "local", keywords: /local|community|ward|lga|regional|market|food|hunger|street|neighbou?rhood/i }
];

const ALL_TOPICS = [...TOPICS.map((topic) => topic.id), "general"];

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function coverArt(seed: string, text = "") {
  const h = hash(seed);
  const matched = TOPICS.find((topic) => topic.keywords.test(text))?.id;
  return {
    topic: matched ?? ALL_TOPICS[h % ALL_TOPICS.length],
    palette: PALETTES[(h >>> 8) % PALETTES.length]
  };
}

/**
 * Uploaded cover when there is one, otherwise the room's halftone art.
 * `text` is the room's title/question, used to pick a relevant image.
 */
export function RoomCover({
  seed,
  text,
  src,
  className
}: {
  seed: string;
  text?: string;
  src?: string | null;
  className?: string;
}) {
  const { topic, palette } = coverArt(seed, text);
  const mask = `url(/covers/${topic}.webp)`;

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: palette.bg }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundColor: palette.ink,
            WebkitMaskImage: mask,
            maskImage: mask,
            WebkitMaskSize: "cover",
            maskSize: "cover",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat"
          }}
        />
      )}
    </div>
  );
}
