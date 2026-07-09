"use client";

import { Moon02Icon, Sun03Icon } from "@/lib/icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <Button
      aria-label="Toggle theme"
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
