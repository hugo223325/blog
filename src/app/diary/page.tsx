"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { renderMarkdown } from "@/lib/markdown";
import BlogContent from "@/components/blog/BlogContent";
import Editor from "@/components/ui/Editor";
import { Plus, PenLine } from "lucide-react";

interface Entry { date: string; content: string; mood: string; tags: string[]; }

function Skeleton() { return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-lg bg-page-warm animate-pulse" /></div>; }

export default function DiaryPage() { return <Suspense fallback={<Skeleton />}><DiaryInner /></Suspense>; }

function DiaryInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ensureAuth } = useAuth();
  const selectedDate = searchParams.get("date");

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try { setEntries(await api.getDiaryEntries()); } catch (e) { console.error(e); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedDate || editing) { setHtml(""); return; }
    api.getDiaryEntry(selectedDate).then(e => { if (e) renderMarkdown(e.content).then(setHtml); }).catch(() => {});
  }, [selectedDate, editing]);

  const bjDate = (() => { const d = new Date(); d.setHours(d.getHours() + 8); return d.toISOString().slice(0, 10); })();

  // ── Create ──
  if (creating) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-sans text-display text-ink-primary mb-8">写日记</h1>
        <Editor mode="diary" initialDate={bjDate}
          onSaved={() => { load(); setCreating(false); router.push("/diary"); }}
          onCancel={() => setCreating(false)} />
      </div>
    );
  }

  // ── Edit ──
  if (editing && selectedDate) {
    const entry = entries.find(e => e.date === selectedDate);
    if (!entry) return <Skeleton />;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-sans text-display text-ink-primary mb-8">编辑日记：{entry.date}</h1>
        <Editor mode="diary" initialContent={entry.content} initialTags={entry.tags} initialDate={entry.date}
          onSaved={() => { load(); setEditing(false); router.push(`/diary?date=${entry.date}`); }}
          onCancel={() => setEditing(false)} />
      </div>
    );
  }

  // ── Detail ──
  if (selectedDate) {
    const entry = entries.find(e => e.date === selectedDate);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/diary" className="inline-flex items-center gap-1 font-sans text-sm text-sage hover:underline mb-6">← 返回日记列表</Link>
        {entry ? (
          <article>
            <header className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">{entry.date}</h1>
                <button onClick={() => ensureAuth(() => setEditing(true))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs rounded-md bg-page-warm text-ink-secondary hover:bg-page-sand transition-colors duration-200">
                  <PenLine size={14} />编辑
                </button>
              </div>
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">日记</h1>
        <button onClick={() => ensureAuth(() => setCreating(true))}
          className="inline-flex items-center gap-1 px-4 py-2 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary transition-colors duration-200">
          <Plus size={16} />新建
        </button>
      </div>
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
