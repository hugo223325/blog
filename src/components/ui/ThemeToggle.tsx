"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-page-sand dark:hover:bg-[#2d2922] transition-colors duration-200"
      aria-label={dark ? "切换亮色模式" : "切换暗色模式"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
