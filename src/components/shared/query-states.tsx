import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type QueryListStateProps = {
  isLoading: boolean;
  isEmpty: boolean;
  count?: number;
  skeleton: ReactNode;
  emptyMessage: string;
  children: ReactNode;
  className?: string;
};

export function QueryListState({
  isLoading,
  isEmpty,
  count = 3,
  skeleton,
  emptyMessage,
  children,
  className
}: QueryListStateProps) {
  if (isLoading) {
    return (
      <div className={cn(className)}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index}>{skeleton}</div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return <>{children}</>;
}
