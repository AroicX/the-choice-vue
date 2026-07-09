"use client";

import { GooeyToaster } from "goey-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
