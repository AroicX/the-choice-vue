"use client";

import { Moon02Icon, Sun03Icon } from "@/lib/icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // resolvedTheme, not theme: with the "system" default, theme is "system", so
  // a dark-mode user saw a moon icon and the first click switched to light.
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      size="icon"
      variant="ghost"
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      <AppIcon icon={mounted && isDark ? Sun03Icon : Moon02Icon} size={20} />
    </Button>
  );
}
