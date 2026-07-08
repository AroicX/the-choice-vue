import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input text-foreground",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
