"use client";

import Link from "next/link";
import { PenLine, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import BlogContent from "@/components/blog/BlogContent";

interface Post { slug: string; title: string; content: string; tags: string[]; created_at: string; }

export default function PostDetail({ post, html, onEdit, onDelete }: {
  post: Post; html: string; onEdit: () => void; onDelete: (slug: string) => void;
}) {
  const rm = Math.max(1, Math.ceil(post.content.length / 400));
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 font-sans text-sm text-sage hover:underline mb-8">
        ← 返回博客列表
      </Link>
      <article>
        <header className="mb-10">
          <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] leading-tight">
            {post.title}
          </h1>
          <p className="mt-2 font-sans text-xs text-ink-muted">
            约 {post.content.length} 字 · 阅读 {rm} 分钟
          </p>
          <div className="mt-4 flex items-center gap-3 font-sans text-sm">
            <time className="text-ink-muted">{formatDate(post.created_at.slice(0, 10))}</time>
            {post.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                {post.tags.map((tag: string) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="text-sage hover:underline">
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="flex items-center gap-3 mb-10">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-4 py-2 font-sans text-xs rounded-md border border-page-sand text-ink-secondary hover:bg-page-warm transition-colors duration-200">
            <PenLine size={14} />编辑
          </button>
          <button onClick={() => onDelete(post.slug)} className="inline-flex items-center gap-1.5 px-4 py-2 font-sans text-xs rounded-md border border-page-sand text-terracotta hover:bg-terracotta-soft transition-colors duration-200">
            <Trash2 size={14} />删除
          </button>
        </div>
        {html ? (
          <BlogContent html={html} />
        ) : (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 rounded animate-shimmer" />)}
          </div>
        )}
      </article>
      <div className="mt-12 pt-8 border-t border-page-sand">
        <Link href="/blog" className="font-sans text-sm text-sage hover:underline">
          ← 返回博客列表
        </Link>
      </div>
    </div>
  );
}
