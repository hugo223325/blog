"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { renderMarkdown } from "@/lib/markdown";
import BlogCreate from "@/components/blog/BlogCreate";
import BlogDetail from "@/components/blog/BlogDetail";
import BlogEdit from "@/components/blog/BlogEdit";
import BlogList from "@/components/blog/BlogList";

interface Post { slug: string; title: string; content: string; excerpt: string; tags: string[]; created_at: string; }
interface TagStat { name: string; count: number; }

function countTags(ps: Post[]): TagStat[] {
  const m: Record<string, number> = {};
  for (const p of ps) for (const t of p.tags) if (t) m[t] = (m[t] || 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

function Skel() { return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-xl bg-page-warm animate-shimmer" /></div>; }

export default function BlogShell() {
  const sp = useSearchParams();
  const { ensureAuth } = useAuth();
  const slug = sp.get("slug");
  const ftag = sp.get("tag") || "";
  const isNew = sp.get("new") !== null;
  const isEdit = sp.get("edit") !== null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<TagStat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");

  useEffect(() => {
    (async () => {
      try { const [p, t] = await Promise.all([api.getPosts(), api.getTags()]); setPosts(p); setTags(t); } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!slug || isEdit) return;
    const p = posts.find(x => x.slug === slug);
    if (p) { renderMarkdown(p.content).then(setHtml); return; }
    // Post not in local cache — fetch from API with retry for D1 replication delay
    let attempts = 0;
    const tryFetch = () => {
      api.getPost(slug).then(p => {
        if (p) { renderMarkdown(p.content).then(setHtml); return; }
        if (++attempts < 10) setTimeout(tryFetch, 500);
      }).catch(() => {
        if (++attempts < 10) setTimeout(tryFetch, 500);
      });
    };
    tryFetch();
  }, [slug, isEdit, posts]);

  const go = (url: string) => {
    window.location.href = url + (url.includes("?") ? "&" : "?") + "_t=" + Date.now();
  };

  const post = slug ? posts.find(p => p.slug === slug) : undefined;

  // All handlers: ensureAuth → await callback → API → redirect on success
  // Errors propagate to BlogCreate/BlogEdit which show error message

  const handleCreate = (data: any) => {
    ensureAuth(() => {
      api.savePost({
        slug: data.slug, title: data.title, content: data.content,
        excerpt: data.content.slice(0, 100), tags: data.tags || [],
      }).then((res: any) => {
        // Use the EXACT slug returned by the server — never assume client slug matches DB
        const realSlug = res.slug || data.slug;
        go("/blog?slug=" + encodeURIComponent(realSlug));
      }).catch((e: any) => { throw e; });
    });
  };

  const handleUpdate = (data: any) => {
    ensureAuth(() => {
      let s = slug!;
      const doSave = s
        ? api.updatePost(s, { title: data.title, content: data.content, excerpt: data.content.slice(0, 100), tags: data.tags || [] })
        : api.savePost({ slug: (data.title || "untitled").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9一-鿿\-]/g, "").slice(0, 60) + "-" + Date.now().toString(36), title: data.title, content: data.content, excerpt: data.content.slice(0, 100), tags: data.tags || [] });
      doSave.then(() => go("/blog?slug=" + encodeURIComponent(s))).catch((e: any) => { throw e; });
    });
  };

  const handleDelete = () => {
    if (!post || !confirm("确定删除这篇文章？")) return;
    ensureAuth(() => {
      api.deletePost(post.slug).then(() => go("/blog")).catch(() => alert("删除失败"));
    });
  };

  const doRefresh = async () => {
    const fresh = await api.getPosts(); setPosts(fresh); setTags(countTags(fresh));
  };

  if (isNew) return <BlogCreate onSaved={handleCreate} />;
  if (isEdit && post) return <BlogEdit post={post} onSaved={handleUpdate} />;
  if (slug && post) return <BlogDetail post={post} html={html} onDelete={handleDelete} />;
  if (slug) return <Skel />;
  return <BlogList posts={posts} tags={tags} loaded={loaded} ftag={ftag}
    onNew={() => go("/blog?new=1")} onRefresh={doRefresh} />;
}
