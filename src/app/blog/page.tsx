"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import BlogContent from "@/components/blog/BlogContent";
import Editor from "@/components/ui/Editor";
import PasswordGate from "@/components/ui/PasswordGate";
import { Plus, PenLine } from "lucide-react";

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
  const router = useRouter();
  const selectedSlug = searchParams.get("slug");
  const editMode = searchParams.get("edit");
  const createMode = searchParams.get("new") !== null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");
  const [showAuth, setShowAuth] = useState(createMode);

  const loadPosts = useCallback(async () => {
    try { setPosts(await api.getPosts()); } catch (e) { console.error(e); }
    setLoaded(true);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    if (!selectedSlug || editMode) { setHtml(""); return; }
    const post = posts.find((p) => p.slug === selectedSlug);
    if (post) { renderMarkdown(post.content).then(setHtml); }
    else { api.getPost(selectedSlug).then((p) => { if (p) renderMarkdown(p.content).then(setHtml); }).catch(() => {}); }
  }, [selectedSlug, editMode, posts]);

  // Editor mode (create or edit)
  if (createMode) {
    if (showAuth) {
      return <PasswordGate onSuccess={() => setShowAuth(false)} onCancel={() => router.push("/blog")} />;
    }
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-sans text-display text-ink-primary mb-8">写新文章</h1>
        <Editor mode="blog" onSaved={() => { loadPosts(); router.push("/blog"); }} onCancel={() => router.push("/blog")} />
      </div>
    );
  }

  if (editMode && selectedSlug) {
    if (showAuth) {
      return <PasswordGate onSuccess={() => setShowAuth(false)} onCancel={() => router.push(`/blog?slug=${selectedSlug}`)} />;
    }
    const post = posts.find((p) => p.slug === selectedSlug);
    if (!post) return <Skeleton />;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-sans text-display text-ink-primary mb-8">编辑：{post.title}</h1>
        <Editor mode="blog" initialTitle={post.title} initialContent={post.content}
          initialTags={post.tags} slug={post.slug}
          onSaved={() => { loadPosts(); router.push(`/blog?slug=${post.slug}`); }}
          onCancel={() => router.push(`/blog?slug=${post.slug}`)} />
      </div>
    );
  }

  // Detail view
  if (selectedSlug) {
    const post = posts.find((p) => p.slug === selectedSlug);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="inline-flex items-center gap-1 font-sans text-sm text-sage hover:underline mb-6">← 返回博客列表</Link>
        {post && (
          <article>
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">{post.title}</h1>
                <Link href={`/blog?slug=${post.slug}&edit=1`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs rounded-md bg-page-warm text-ink-secondary hover:bg-page-sand transition-colors duration-200">
                  <PenLine size={14} />编辑
                </Link>
              </div>
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

  // List view
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">博客</h1>
        <Link href="/blog?new=1"
          className="inline-flex items-center gap-1 px-4 py-2 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary transition-colors duration-200">
          <Plus size={16} />新建
        </Link>
      </div>
      {!loaded ? (
        <div className="flex flex-col gap-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-lg bg-page-warm animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg bg-page-warm px-6 py-12 text-center"><p className="text-ink-muted">还没有文章。写第一篇文章吧。</p></div>
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
