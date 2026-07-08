"use client";

import { GooeyToaster } from "goey-toast";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <GooeyToaster
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      preset="smooth"
      closeButton="top-right"
      showProgress
      swipeToDismiss
      visibleToasts={4}
    />
  );
}
