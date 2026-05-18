"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import BlogContent from "@/components/blog/BlogContent";

interface Post {
  slug: string; title: string; content: string;
  excerpt: string; tags: string[]; created_at: string;
}

function Skeleton() {
  return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-lg bg-page-warm animate-pulse" /></div>;
}

export default function BlogPage() {
  return <Suspense fallback={<Skeleton />}><BlogInner /></Suspense>;
}

function BlogInner() {
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("slug");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");

  const loadPosts = useCallback(async () => {
    try { const data = await api.getPosts(); setPosts(data); } catch (e) { console.error(e); }
    setLoaded(true);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    if (!selectedSlug) { setHtml(""); return; }
    const post = posts.find((p) => p.slug === selectedSlug);
    if (post) { renderMarkdown(post.content).then(setHtml); }
    else { api.getPost(selectedSlug).then((p) => { if (p) renderMarkdown(p.content).then(setHtml); }).catch(() => {}); }
  }, [selectedSlug, posts]);

  if (selectedSlug) {
    const post = posts.find((p) => p.slug === selectedSlug);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="inline-flex items-center gap-1 font-sans text-sm text-sage hover:underline mb-6">← 返回博客列表</Link>
        {post && (
          <article>
            <header className="mb-8">
              <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">{post.title}</h1>
              <div className="mt-4 flex items-center gap-3 font-sans text-sm text-ink-muted">
                <time>{formatDate(post.created_at.slice(0, 10))}</time>
                {post.tags.length > 0 && <span>· {post.tags.join(", ")}</span>}
              </div>
            </header>
            {html ? <BlogContent html={html} /> : <div className="h-48 rounded-lg bg-page-warm animate-pulse" />}
          </article>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-8">博客</h1>
      {!loaded ? (
        <div className="flex flex-col gap-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-lg bg-page-warm animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg bg-page-warm px-6 py-12 text-center"><p className="text-ink-muted">还没有文章。</p></div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog?slug=${post.slug}`}
              className="block rounded-lg bg-page-warm dark:bg-[#221f1a] px-6 py-5 hover:bg-page-sand transition-colors duration-200">
              <h2 className="font-sans text-xl font-semibold text-ink-primary dark:text-[#e8e0d5]">{post.title}</h2>
              <time className="block mt-1 font-sans text-sm text-ink-muted">{formatDate(post.created_at.slice(0, 10))}</time>
              {post.excerpt && <p className="mt-3 font-serif text-ink-secondary line-clamp-2">{post.excerpt}</p>}
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="inline-block px-3 py-0.5 font-sans text-xs rounded-full bg-sage-soft text-sage">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
