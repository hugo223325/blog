"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, CheckSquare, NotebookPen, TrendingUp } from "lucide-react";

const features = [
  { href: "/blog", label: "博客", desc: "文章", icon: BookOpen, accent: "hover:text-sage" },
  { href: "/diary", label: "日记", desc: "记录", icon: NotebookPen, accent: "hover:text-lavender" },
  { href: "/todo", label: "待办", desc: "任务", icon: CheckSquare, accent: "hover:text-terracotta" },
  { href: "/schedule", label: "日程", desc: "时间", icon: Calendar, accent: "hover:text-sage" },
  { href: "/weight", label: "体重", desc: "健康", icon: TrendingUp, accent: "hover:text-sage" },
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [diaryDates, setDiaryDates] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const today = formatDate(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([
      api.getPosts().then(p => setPosts(p.slice(0, 3))).catch(() => {}),
      api.getDiaryEntries().then(e => setDiaryDates(e.map((d: any) => d.date).slice(0, 5))).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-2">欢迎回来</h1>
      <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265] mb-10">{today}</p>

      <div className="flex flex-wrap gap-1 mb-10">
        {features.map((f) => (
          <Link key={f.href} href={f.href}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans text-ink-secondary bg-page-warm rounded-full hover:bg-page-sand transition-colors duration-200 ${f.accent}`}>
            <f.icon size={16} />
            <span className="font-medium text-ink-primary">{f.label}</span>
            <span className="text-ink-muted">· {f.desc}</span>
          </Link>
        ))}
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-lg font-semibold text-ink-primary">最近文章</h2>
          <Link href="/blog" className="font-sans text-sm text-sage hover:underline">查看全部</Link>
        </div>
        {!loaded ? (
          <div className="rounded-lg bg-page-warm px-6 py-8"><div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-page-sand rounded animate-pulse" />)}</div></div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg bg-page-warm px-6 py-8 text-center"><p className="text-sm text-ink-muted">还没有文章。</p></div>
        ) : (
          <div className="rounded-lg bg-page-warm divide-y divide-page-sand">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog?slug=${post.slug}`}
                className="block px-5 py-3.5 hover:bg-page-sand transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg">
                <h3 className="font-sans text-sm font-medium text-ink-primary">{post.title}</h3>
                <time className="text-xs text-ink-muted mt-0.5 block">{formatDate(post.created_at.slice(0, 10))}</time>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-lg font-semibold text-ink-primary">最近日记</h2>
          <Link href="/diary" className="font-sans text-sm text-sage hover:underline">查看全部</Link>
        </div>
        {!loaded ? (
          <div className="rounded-lg bg-lavender-soft px-6 py-8"><div className="flex gap-2">{[1,2,3,4,5].map(i => <div key={i} className="h-8 w-20 bg-lavender rounded animate-pulse" />)}</div></div>
        ) : diaryDates.length === 0 ? (
          <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] px-6 py-8 text-center"><p className="text-sm text-ink-muted">还没有日记。</p></div>
        ) : (
          <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] divide-y divide-[#e6dcee] dark:divide-[#2d2533]">
            {diaryDates.map((date) => (
              <Link key={date} href={`/diary?date=${date}`}
                className="block px-5 py-3.5 hover:bg-[#ede4f0] dark:hover:bg-[#332838] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg">
                <span className="font-sans text-sm font-medium text-ink-primary dark:text-[#e8e0d5]">日记 {date}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
