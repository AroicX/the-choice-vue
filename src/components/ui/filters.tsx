"use client";

import { AppIcon } from "@/components/ui/icon";
import { ArrowDown01Icon, Search01Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Pill search input used above lists. */
export function SearchField({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <AppIcon
        icon={Search01Icon}
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-full border border-transparent bg-secondary pl-11 pr-4 text-[15px] placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
      />
    </div>
  );
}

/** Native select dressed as a pill; highlights when a filter is applied. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  const active = value !== "";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={cn(
          "h-10 appearance-none rounded-full border pl-4 pr-9 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "border-foreground bg-foreground text-background" : "border-input bg-transparent text-foreground hover:bg-accent"
        )}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <AppIcon
        icon={ArrowDown01Icon}
        size={16}
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
          active ? "text-background" : "text-muted-foreground"
        )}
      />
    </div>
  );
}

/** Underline tabs for wide pages, with optional counts. Not sticky. */
export function UnderlineTabs<T extends string>({
  tabs,
  active,
  onSelect,
  label
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  active: T;
  onSelect: (id: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b [scrollbar-width:none]">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className="text-[13px] font-medium tabular-nums text-muted-foreground">{tab.count}</span>
            ) : null}
            {isActive ? <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-primary" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
}
