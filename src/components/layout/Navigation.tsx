"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, CheckSquare, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/blog", label: "博客", icon: BookOpen },
  { href: "/todo", label: "待办", icon: CheckSquare },
  { href: "/schedule", label: "日程", icon: Calendar },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-page-sand dark:border-[#2d2922] bg-page-cream dark:bg-[#1a1814] sm:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-sans transition-colors duration-200 ${
                isActive
                  ? "text-sage dark:text-[#8ab88e]"
                  : "text-ink-muted dark:text-[#7a7265]"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
