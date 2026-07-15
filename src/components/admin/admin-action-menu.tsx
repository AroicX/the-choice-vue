"use client";

import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Cancel01Icon, Delete02Icon, Edit02Icon, MoreVerticalCircle01Icon, ViewIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type AdminActionItem = {
  id: string;
  label: string;
  destructive?: boolean;
};

const DEFAULT_ICONS: Record<string, typeof Edit02Icon> = {
  View: ViewIcon,
  Edit: Edit02Icon,
  Delete: Delete02Icon
};

export function AdminActionMenu({
  actions,
  onAction,
  className
}: {
  actions: Array<string | AdminActionItem>;
  onAction: (action: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const items = actions.map((action) =>
    typeof action === "string"
      ? { id: action, label: action, destructive: /delete|remove|ban/i.test(action) }
      : action
  );

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg"
        aria-label="Actions"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <AppIcon icon={MoreVerticalCircle01Icon} size={16} />
      </Button>
      {open ? (
        <div className="absolute right-0 z-40 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          {items.map((item) => {
            const Icon = DEFAULT_ICONS[item.id] ?? DEFAULT_ICONS[item.label] ?? Edit02Icon;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-accent",
                  item.destructive && "text-destructive hover:bg-destructive/10"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                  onAction(item.id);
                }}
              >
                <AppIcon icon={Icon} size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AdminConfirmDeleteModal({
  open,
  title,
  message,
  requireReason = true,
  onClose,
  onConfirm
}: {
  open: boolean;
  title: string;
  message: string;
  requireReason?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <AppIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>
        {requireReason ? (
          <textarea
            className="mt-4 min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm"
            placeholder="Reason (sent to the user with a ToS violation notice)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={requireReason && !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
