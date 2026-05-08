import Link from "next/link";
import { getAllBlogPosts, getDiaryDates } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, CheckSquare, NotebookPen } from "lucide-react";

const features = [
  { href: "/blog", label: "博客", desc: "文章", icon: BookOpen, accent: "hover:text-sage" },
  { href: "/diary", label: "日记", desc: "记录", icon: NotebookPen, accent: "hover:text-lavender" },
  { href: "/todo", label: "待办", desc: "任务", icon: CheckSquare, accent: "hover:text-terracotta" },
  { href: "/schedule", label: "日程", desc: "时间", icon: Calendar, accent: "hover:text-sage" },
];

export default function Home() {
  const recentPosts = getAllBlogPosts().slice(0, 3);
  const recentDiaryDates = getDiaryDates().slice(0, 5);
  const today = formatDate(new Date().toISOString().slice(0, 10));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Greeting */}
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-2">
        欢迎回来
      </h1>
      <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265] mb-10">
        {today}
      </p>

      {/* Feature navigation — organic bookmark tabs */}
      <div className="flex flex-wrap gap-1 mb-10">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans text-ink-secondary dark:text-[#b8a898] bg-page-warm dark:bg-[#221f1a] rounded-full hover:bg-page-sand dark:hover:bg-[#2d2922] transition-colors duration-200 ${f.accent}`}
          >
            <f.icon size={16} />
            <span className="font-medium text-ink-primary dark:text-[#e8e0d5]">{f.label}</span>
            <span className="text-ink-muted dark:text-[#7a7265]">· {f.desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent posts — page-warm tonal card */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-lg font-semibold text-ink-primary dark:text-[#e8e0d5]">
            最近文章
          </h2>
          <Link
            href="/blog"
            className="font-sans text-sm text-sage dark:text-[#8ab88e] hover:underline"
          >
            查看全部
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="rounded-lg bg-page-warm dark:bg-[#221f1a] px-6 py-8 text-center">
            <p className="text-sm text-ink-muted dark:text-[#7a7265]">
              这里还没有文章。种下第一颗种子吧。
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-page-warm dark:bg-[#221f1a] divide-y divide-page-sand dark:divide-[#2d2922]">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block px-5 py-3.5 hover:bg-page-sand dark:hover:bg-[#2d2922] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
              >
                <h3 className="font-sans text-sm font-medium text-ink-primary dark:text-[#e8e0d5]">
                  {post.title}
                </h3>
                <time className="text-xs text-ink-muted dark:text-[#7a7265] mt-0.5 block">
                  {formatDate(post.date)}
                </time>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent diary — lavender-soft tonal card */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-lg font-semibold text-ink-primary dark:text-[#e8e0d5]">
            最近日记
          </h2>
          <Link
            href="/diary"
            className="font-sans text-sm text-sage dark:text-[#8ab88e] hover:underline"
          >
            查看全部
          </Link>
        </div>
        {recentDiaryDates.length === 0 ? (
          <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] px-6 py-8 text-center">
            <p className="text-sm text-ink-muted dark:text-[#7a7265]">
              这里还没有日记。写下今天的第一笔吧。
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] divide-y divide-[#e6dcee] dark:divide-[#2d2533]">
            {recentDiaryDates.map((date) => (
              <Link
                key={date}
                href={`/diary/${date}`}
                className="block px-5 py-3.5 hover:bg-[#ede4f0] dark:hover:bg-[#332838] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="font-sans text-sm font-medium text-ink-primary dark:text-[#e8e0d5]">
                  日记 {date.replace("/", "-")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
