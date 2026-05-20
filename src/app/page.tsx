"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, CheckSquare, NotebookPen, TrendingUp } from "lucide-react";

const features = [
  { href: "/blog", label: "博客", desc: "记录思考", icon: BookOpen, color: "text-sage bg-sage-soft dark:bg-[#1e2a20]" },
  { href: "/diary", label: "日记", desc: "每天点滴", icon: NotebookPen, color: "text-lavender bg-lavender-soft dark:bg-[#221e26]" },
  { href: "/todo", label: "待办", desc: "管理任务", icon: CheckSquare, color: "text-terracotta bg-terracotta-soft dark:bg-[#2a1e18]" },
  { href: "/schedule", label: "日程", desc: "规划时间", icon: Calendar, color: "text-sage bg-sage-soft dark:bg-[#1e2a20]" },
  { href: "/weight", label: "体重", desc: "关注健康", icon: TrendingUp, color: "text-lavender bg-lavender-soft dark:bg-[#221e26]" },
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [diaryDates, setDiaryDates] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const d = new Date();
  d.setHours(d.getHours() + 8);
  const today = formatDate(d.toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([
      api.getPosts().then(p => setPosts(p.slice(0, 3))).catch(() => {}),
      api.getDiaryEntries().then(e => setDiaryDates(e.map((d: any) => d.date).slice(0, 5))).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-2">欢迎回来</h1>
      <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265] mb-10">{today}</p>

      {/* Feature cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
        {features.map((f) => (
          <Link key={f.href} href={f.href}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-page-warm dark:bg-[#221f1a] hover:-translate-y-0.5 transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className={`p-2.5 rounded-lg ${f.color}`}>
              <f.icon size={20} />
            </div>
            <span className="font-sans text-sm font-medium text-ink-primary dark:text-[#e8e0d5]">{f.label}</span>
            <span className="font-sans text-xs text-ink-muted -mt-1">{f.desc}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent posts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-base font-semibold text-ink-primary">最近文章</h2>
            <Link href="/blog" className="font-sans text-xs link-underline text-sage pb-0.5">查看全部</Link>
          </div>
          {!loaded ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-lg animate-shimmer" />)}</div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl bg-page-warm px-5 py-8 text-center"><p className="text-sm text-ink-muted">还没有文章</p></div>
          ) : (
            <div className="rounded-xl bg-page-warm dark:bg-[#221f1a] overflow-hidden">
              {posts.map((post, i) => (
                <Link key={post.slug} href={`/blog?slug=${post.slug}`}
                  className={`block px-5 py-4 hover:bg-page-sand dark:hover:bg-[#2d2922] transition-colors duration-200 ${i !== 0 ? "border-t border-page-sand dark:border-[#2d2922]" : ""}`}>
                  <h3 className="font-sans text-sm font-medium text-ink-primary truncate">{post.title}</h3>
                  <time className="text-xs text-ink-muted mt-1 block">{formatDate(post.created_at.slice(0, 10))}</time>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent diary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-base font-semibold text-ink-primary">最近日记</h2>
            <Link href="/diary" className="font-sans text-xs link-underline text-sage pb-0.5">查看全部</Link>
          </div>
          {!loaded ? (
            <div className="flex flex-wrap gap-2">{[1,2,3,4,5].map(i => <div key={i} className="h-9 w-20 rounded-full animate-shimmer" />)}</div>
          ) : diaryDates.length === 0 ? (
            <div className="rounded-xl bg-lavender-soft dark:bg-[#221e26] px-5 py-8 text-center"><p className="text-sm text-ink-muted">还没有日记</p></div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {diaryDates.map((date) => (
                <Link key={date} href={`/diary?date=${date}`}
                  className="px-4 py-2 font-sans text-xs rounded-full bg-lavender-soft dark:bg-[#221e26] text-ink-secondary dark:text-[#b8a898] hover:bg-lavender hover:text-white transition-colors duration-200">
                  {date}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
