"use client";
import { useState } from "react";
import Editor from "@/components/ui/Editor";

interface Post { slug: string; title: string; content: string; tags: string[]; }

export default function BlogEdit({ post, onSaved }: { post: Post; onSaved: (d: any) => void }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const save = async (d: any) => {
    setSaving(true); setErr("");
    try { await onSaved(d); } catch (e: any) { setErr(e.message || "失败"); } finally { setSaving(false); }
  };
  const el = <div className="max-w-3xl mx-auto px-4 py-8">
    <h1 className="font-sans text-display text-ink-primary mb-4">编辑：{post.title}</h1>
    {err && <div className="mb-4 p-3 rounded-md bg-terracotta-soft text-sm text-terracotta font-sans">{err}</div>}
    {saving && <div className="fixed inset-0 z-50 flex items-center justify-center bg-page-cream/70 backdrop-blur-sm"><div className="px-6 py-4 rounded-lg bg-ink-primary text-page-cream font-sans text-sm">保存中…</div></div>}
    <Editor mode="blog" initialTitle={post.title} initialContent={post.content}
      initialTags={post.tags} slug={post.slug}
      onSaved={save} onCancel={() => { window.location.href = "/blog?slug=" + encodeURIComponent(post.slug) + "&_t=" + Date.now(); }} />
  </div>;
  return el;
}
