"use client";

import { useState } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { ReactionBurst } from "@/components/animations/reaction-burst";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
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

export function ReactionButton({ type, icon, count, label, disabled, active, onAction, className }: ReactionButtonProps) {
  const [burst, setBurst] = useState(0);
  const activeTone =
    type === "like"
      ? active
        ? "text-rose-500 bg-rose-500/10"
        : "hover:text-rose-500 hover:bg-rose-500/10"
      : active
        ? "text-indigo-500 bg-indigo-500/10"
        : "hover:text-indigo-500 hover:bg-indigo-500/10";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn("relative overflow-visible transition-all duration-200", activeTone, className)}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled || active) return;
        onAction();
        setBurst((value) => value + 1);
      }}
    >
      <ReactionBurst type={type} trigger={burst} />
      <AppIcon icon={icon} size={18} className="mr-2" />
      {count}
    </Button>
  );
}
