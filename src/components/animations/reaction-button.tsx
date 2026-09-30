"use client";

import { useState } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { ReactionBurst } from "@/components/animations/reaction-burst";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ReactionButtonProps = {
  type: "like" | "dislike";
  icon: IconSvgElement;
  count: number;
  label: string;
  disabled?: boolean;
  active?: boolean;
  onAction: () => void;
  className?: string;
};

const TONE = {
  like: {
    text: "text-rose-500",
    hoverText: "group-hover:text-rose-500",
    hoverBg: "group-hover:bg-rose-500/10"
  },
  dislike: {
    text: "text-indigo-500",
    hoverText: "group-hover:text-indigo-500",
    hoverBg: "group-hover:bg-indigo-500/10"
  }
} as const;

/**
 * Twitter-style reaction: no pill behind the whole control. The tinted circle
 * sits behind the icon alone and only on hover, and the active state is carried
 * by filling the icon plus colouring the count.
 */
export function ReactionButton({
  type,
  icon,
  count,
  label,
  disabled,
  active,
  onAction,
  className
}: ReactionButtonProps) {
  const [burst, setBurst] = useState(0);
  const tone = TONE[type];

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={active ? `Undo ${label.toLowerCase()}` : label}
      aria-pressed={active}
      className={cn(
        "group inline-flex items-center rounded-full text-[13px] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors disabled:pointer-events-none disabled:opacity-50",
        active && tone.text,
        className
      )}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        onAction();
        // Only burst when adding a reaction, not when withdrawing one.
        if (!active) setBurst((value) => value + 1);
      }}
    >
      <span
        className={cn(
          "relative flex size-[34px] items-center justify-center rounded-full transition-colors",
          tone.hoverBg,
          tone.hoverText
        )}
      >
        <ReactionBurst type={type} trigger={burst} />
        <AppIcon
          icon={icon}
          size={18}
          // Only the heart is a single closed path, so only it fills cleanly.
          // Targeting the path beats the inline fill="none" presentation attribute.
          className={cn(
            "transition-transform duration-200",
            active && type === "like" && "[&_path]:fill-current",
            active && "scale-110"
          )}
        />
      </span>
      {/* Blank rather than "0", as on X; the button's label still names it. */}
      <span className={cn("min-w-[1ch] pr-2 tabular-nums transition-colors", tone.hoverText)}>
        {count > 0 ? count.toLocaleString() : ""}
      </span>
    </button>
  );
}
