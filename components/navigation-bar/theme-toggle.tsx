"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSystem, setIsSystem] = useState(theme === "system");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleToggle = () => {
    if (isSystem) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      setIsSystem(false);
    } else {
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  const handleLongPress = () => {
    setTheme("system");
    setIsSystem(true);
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun size={18} style={{ color: "var(--primary)" }} />

      <Switch
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
        className="bg-[var(--muted)] border-[var(--border)]"
      />

      <Moon size={18} style={{ color: "var(--accent)" }} />
    </div>
  );
}
