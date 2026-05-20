"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import BlogContent from "@/components/blog/BlogContent";
import Editor from "@/components/ui/Editor";
import PostDetail from "@/components/blog/PostDetail";
import { Plus, Search, ArrowRight } from "lucide-react";

interface Post { slug: string; title: string; content: string; excerpt: string; tags: string[]; created_at: string; }
interface TagStat { name: string; count: number; }

function Skel() { return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-xl bg-page-warm animate-shimmer" /></div>; }

export default function BlogPage() { return <Suspense fallback={<Skel />}><BlogInner /></Suspense>; }

function BlogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ensureAuth } = useAuth();
  const slug = searchParams.get("slug");
  const ftag = searchParams.get("tag") || "";
  const detail = slug !== null;
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<TagStat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const loadAll = useCallback(async () => {
    try { const [p, t] = await Promise.all([api.getPosts(), api.getTags()]); setPosts(p); setTags(t); } catch (e) { console.error(e); }
    setLoaded(true);
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!slug || editing) { setHtml(""); return; }
    const post = posts.find(p => p.slug === slug);
    if (post) { renderMarkdown(post.content).then(setHtml); return; }
    api.getPost(slug).then(p => { if (p) { setPosts(prev => [...prev.filter(x => x.slug !== p.slug), p]); renderMarkdown(p.content).then(setHtml); } }).catch(() => {});
  }, [slug, editing, posts]);

  const handleNew = () => ensureAuth(() => setCreating(true));
  const handleEdit = () => ensureAuth(() => setEditing(true));
  const handleDelete = async (s: string) => { if (!confirm("确定删除？")) return; try { await api.deletePost(s); loadAll(); router.push("/blog"); } catch { alert("删除失败"); } };
  const handleSaved = async (sp?: any) => {
    setEditing(false); setCreating(false);
    if (sp) { setPosts(prev => { const rest = prev.filter(p => p.slug !== sp.slug); return [sp, ...rest]; }); setHtml(await renderMarkdown(sp.content)); }
  };

  const filtered = useMemo(() => {
    let result = ftag ? posts.filter(p => p.tags.includes(ftag)) : posts;
    if (search.trim()) { const q = search.toLowerCase(); result = result.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || (p.excerpt || "").toLowerCase().includes(q)); }
    return result;
  }, [posts, ftag, search]);

  if (creating) return <div className="max-w-3xl mx-auto px-4 py-8"><h1 className="font-sans text-display text-ink-primary mb-8">写新文章</h1><Editor mode="blog" onSaved={handleSaved} onCancel={() => setCreating(false)} /></div>;

  if (editing && slug !== null) {
    const post = posts.find(p => p.slug === slug);
    if (!post) return <Skel />;
    return <div className="max-w-3xl mx-auto px-4 py-8"><h1 className="font-sans text-display text-ink-primary mb-8">编辑：{post.title}</h1><Editor mode="blog" initialTitle={post.title} initialContent={post.content} initialTags={post.tags} slug={post.slug} onSaved={handleSaved} onCancel={() => setEditing(false)} /></div>;
  }

  if (detail) {
    const post = posts.find(p => p.slug === slug);
    if (!post) return <Skel />;
    return <PostDetail post={post} html={html} onEdit={handleEdit} onDelete={handleDelete} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-sans text-display text-ink-primary">博客{ftag ? ` · ${ftag}` : ""}</h1>{ftag && <p className="mt-1 font-sans text-sm text-ink-muted"><Link href="/blog" className="text-sage hover:underline">清除筛选</Link></p>}</div>
        <button onClick={handleNew} className="inline-flex items-center gap-1.5 px-4 py-2 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary transition-colors duration-200"><Plus size={16} />新建</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0">
          <div className="relative mb-6">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文章..." className="w-full pl-9 pr-4 py-2 font-sans text-sm border border-page-sand dark:border-[#2d2922] rounded-lg bg-page-cream dark:bg-[#1a1814] text-ink-primary placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage" />
          </div>
          {tags.length > 0 && <div className="mb-6 flex flex-wrap gap-1.5">{[
            <Link key="all" href="/blog" className={`px-2.5 py-1 font-sans text-xs rounded-full transition-colors ${!ftag ? "bg-sage text-white" : "text-ink-secondary hover:bg-page-warm"}`}>全部</Link>,
            ...tags.map(t => <Link key={t.name} href={`/blog?tag=${encodeURIComponent(t.name)}`} className={`px-2.5 py-1 font-sans text-xs rounded-full transition-colors ${ftag === t.name ? "bg-sage text-white" : "text-ink-secondary hover:bg-page-warm"}`}>{t.name}</Link>)
          ]}</div>}
          {!loaded ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl animate-shimmer" />)}</div>
          : filtered.length === 0 ? <div className="py-20 text-center"><p className="text-ink-muted font-sans text-sm">{search ? "没有找到" : "还没有文章"}</p></div>
          : <div className="space-y-0">{filtered.map((post, i) => {
            const isEmpty = !post.slug;
            const rm = Math.max(1, Math.ceil(post.content.length / 400));
            if (isEmpty) return <div key={post.title} className={`${i !== 0 ? "border-t border-page-sand" : ""} flex items-center gap-3 py-5 -mx-4 px-4`}><time className="font-sans text-xs text-ink-muted w-20">{formatDate(post.created_at.slice(0, 10))}</time><div className="flex-1"><h2 className="font-sans text-base font-semibold text-ink-primary">{post.title}</h2></div><button onClick={async () => { await api.fixSlugs(); loadAll(); }} className="px-3 py-1 font-sans text-xs rounded-md bg-sage text-white hover:opacity-80">修复</button></div>;
            return (
              <div key={post.slug} className={`${i !== 0 ? "border-t border-page-sand dark:border-[#2d2922]" : ""}`}>
                <Link href={`/blog?slug=${post.slug}`} className="block group py-5 hover:bg-page-warm/50 dark:hover:bg-[#221f1a]/50 -mx-4 px-4 rounded-xl transition-all duration-200">
                  <div className="flex gap-4">
                    <div className="hidden sm:block w-1 rounded-full bg-page-sand dark:bg-[#2d2922] group-hover:bg-sage transition-colors duration-300 flex-shrink-0 self-stretch" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-sans text-base font-semibold text-ink-primary group-hover:text-sage transition-colors duration-200">{post.title}</h2>
                        <ArrowRight size={16} className="hidden sm:block flex-shrink-0 mt-0.5 text-ink-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </div>
                      <div className="mt-2 flex items-center gap-3 font-sans text-xs text-ink-muted">
                        <time>{formatDate(post.created_at.slice(0, 10))}</time><span>·</span><span>{rm} 分钟</span>
                        {post.tags.length > 0 && <span>· {post.tags.length} 个标签</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}</div>}
        </div>

        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-20 space-y-5">
            <div className="p-4 rounded-xl bg-page-warm dark:bg-[#221f1a] text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-sage-soft dark:bg-[#1e2a20] flex items-center justify-center text-sage text-xl font-bold font-sans">博</div>
              <h3 className="mt-3 font-sans text-sm font-semibold text-ink-primary">我的博客</h3>
              <p className="mt-1 font-serif text-xs text-ink-muted leading-relaxed">一座数字花园</p>
              <div className="mt-3 flex justify-center gap-3 font-sans text-xs text-ink-muted"><span>{posts.length} 篇文章</span><span>{tags.length} 个标签</span></div>
            </div>
            {tags.length > 0 && <div><h3 className="font-sans text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-3">标签</h3><div className="flex flex-wrap gap-1.5">{tags.map(t => <Link key={t.name} href={`/blog?tag=${encodeURIComponent(t.name)}`} className={`px-2.5 py-1 font-sans text-xs rounded-full transition-colors ${ftag === t.name ? "bg-sage text-white" : "text-ink-secondary hover:bg-page-warm"}`}>{t.name} <span className="text-ink-muted">{t.count}</span></Link>)}</div></div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
