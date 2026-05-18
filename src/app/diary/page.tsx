"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import BlogContent from "@/components/blog/BlogContent";

interface Entry { date: string; content: string; mood: string; tags: string[]; updated_at: string; }

function Skeleton() {
  return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-lg bg-page-warm animate-pulse" /></div>;
}

export default function DiaryPage() {
  return <Suspense fallback={<Skeleton />}><DiaryInner /></Suspense>;
}

function DiaryInner() {
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");

  const load = useCallback(async () => {
    try { setEntries(await api.getDiaryEntries()); } catch (e) { console.error(e); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedDate) { setHtml(""); return; }
    api.getDiaryEntry(selectedDate).then(e => { if (e) renderMarkdown(e.content).then(setHtml); }).catch(() => {});
  }, [selectedDate]);

  if (selectedDate) {
    const entry = entries.find(e => e.date === selectedDate);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/diary" className="inline-flex items-center gap-1 font-sans text-sm text-sage hover:underline mb-6">← 返回日记列表</Link>
        {entry ? (
          <article>
            <header className="mb-6">
              <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">{entry.date}</h1>
              <div className="mt-3 flex items-center gap-4 font-sans text-sm text-ink-muted">
                {entry.mood && <span>心情：{entry.mood}</span>}
                {entry.tags.length > 0 && <span>标签：{entry.tags.join(", ")}</span>}
              </div>
            </header>
            <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] px-6 py-6">
              {html ? <BlogContent html={html} /> : <div className="h-32 bg-page-warm animate-pulse rounded" />}
            </div>
          </article>
        ) : <div className="h-64 rounded-lg bg-page-warm animate-pulse" />}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-8">日记</h1>
      {!loaded ? (
        <div className="flex flex-wrap gap-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 w-24 rounded-md bg-page-warm animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg bg-lavender-soft px-6 py-12 text-center"><p className="text-ink-muted">还没有日记。</p></div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(e => (
            <Link key={e.date} href={`/diary?date=${e.date}`}
              className="px-4 py-2 font-sans text-sm rounded-md bg-page-warm text-ink-secondary hover:bg-lavender-soft hover:text-lavender transition-colors duration-200">
              {e.date}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
