"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/diary", label: "日记" },
  { href: "/todo", label: "待办" },
  { href: "/schedule", label: "日程" },
  { href: "/weight", label: "体重" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-page-sand dark:border-[#2d2922] bg-page-cream/80 dark:bg-[#1a1814]/80 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold font-sans text-ink-primary dark:text-[#e8e0d5] hover:text-sage transition-colors duration-200">
          我的博客
        </Link>
        <nav className="hidden sm:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`relative px-3 py-2 text-sm font-sans rounded-md transition-colors duration-200 ${
                  active
                    ? "text-ink-primary dark:text-[#e8e0d5] font-semibold"
                    : "text-ink-secondary dark:text-[#b8a898] hover:text-ink-primary dark:hover:text-[#e8e0d5]"
                }`}>
                {item.label}
                {active && <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-sage rounded-full" />}
              </Link>
            );
          })}
          <ThemeToggle />
          <Link href="/setup" title="修改密码"
            className="ml-1 px-2 py-1.5 text-ink-muted hover:text-ink-secondary rounded-md transition-colors duration-200">
            <Settings size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
