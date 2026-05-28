"use client";
import Editor from "@/components/ui/Editor";

interface Post { slug: string; title: string; content: string; tags: string[]; }

export default function BlogEditor({ mode, post, onSaved, onCancel }: {
  mode: "create" | "edit"; post?: Post; onSaved: (sp: any) => void; onCancel: () => void;
}) {
  const title = mode === "create" ? "写新文章" : `编辑：${post?.title || ""}`;
  const el = <div className="max-w-3xl mx-auto px-4 py-8">
    <h1 className="font-sans text-display text-ink-primary mb-8">{title}</h1>
    <Editor mode="blog" initialTitle={post?.title} initialContent={post?.content || ""} initialTags={post?.tags || []} slug={post?.slug} onSaved={onSaved} onCancel={onCancel} />
  </div>;
  return el;
}
