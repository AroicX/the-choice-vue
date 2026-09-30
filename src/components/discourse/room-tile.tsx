import { cn } from "@/lib/utils";

// Each room gets a stable tint from its title, so lists scan by colour
// without anyone having to upload a room image.
const TONES = [
  "bg-primary/15 text-primary",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400"
];

function toneFor(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

export function RoomTile({ title, className }: { title: string; className?: string }) {
  return (
    <span
      className={cn("grid size-12 shrink-0 place-items-center rounded-xl text-lg font-bold", toneFor(title), className)}
      aria-hidden
    >
      {title.trim().charAt(0).toUpperCase() || "#"}
    </span>
  );
}
