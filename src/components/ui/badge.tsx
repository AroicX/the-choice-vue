import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide", {
  variants: {
    variant: {
      default: "bg-primary/15 text-primary ring-1 ring-primary/20",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input text-foreground",
      warning: "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800/40",
      info: "bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-800/40"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
