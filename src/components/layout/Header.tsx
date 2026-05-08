import Link from "next/link";
import { BookOpen, Calendar, CheckSquare, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/blog", label: "博客", icon: BookOpen },
  { href: "/diary", label: "日记", icon: BookOpen },
  { href: "/todo", label: "待办", icon: CheckSquare },
  { href: "/schedule", label: "日程", icon: Calendar },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-page-sand dark:border-[#2d2922] bg-page-cream/80 dark:bg-[#1a1814]/80 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold font-sans text-ink-primary dark:text-[#e8e0d5] hover:text-sage dark:hover:text-[#8ab88e] transition-colors duration-200"
        >
          我的博客
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm font-sans text-ink-secondary dark:text-[#b8a898] hover:text-ink-primary dark:hover:text-[#e8e0d5] hover:bg-page-sand dark:hover:bg-[#2d2922] rounded-md transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
