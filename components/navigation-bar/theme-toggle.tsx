"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  });

  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2">
      <Sun size={18} className="text-yellow-500" aria-hidden="true" />   {" "}
      <Switch
        checked={isDark}
        onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
        className="bg-[var(--muted)] border-[var(--border)]"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} // Add aria-label
      />
      <Moon size={18} className="text-blue-500" aria-hidden="true" />   {" "}
    </div>
  );
};

export default ThemeToggle;
