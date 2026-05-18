"use client";

import { useState, useCallback } from "react";
import { Eye, Save, X } from "lucide-react";
import * as api from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialDate?: string;       // for diary
  mode: "blog" | "diary";
  slug?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function Editor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  initialDate = "",
  mode,
  slug,
  onSaved,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState(false);
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const togglePreview = useCallback(async () => {
    if (!preview && content) {
      setHtml(await renderMarkdown(content));
    }
    setPreview(!preview);
  }, [preview, content]);

  const handleSave = async () => {
    if (mode === "blog" && !title.trim()) return;
    if (mode === "diary" && !date) return;

    setSaving(true);
    setMsg("");

    try {
      const tagList = tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);

      if (mode === "blog") {
        const postSlug = slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        if (slug) {
          await api.updatePost(postSlug, { title, content, excerpt: content.slice(0, 100), tags: tagList });
        } else {
          await api.savePost({ slug: postSlug, title, content, excerpt: content.slice(0, 100), tags: tagList });
        }
        setMsg("文章已保存");
      } else {
        await api.saveDiary({ date, content, mood: "", tags: tagList });
        setMsg("日记已保存");
      }
      onSaved?.();
    } catch (e: any) {
      setMsg(e.message || "保存失败");
    }
    setSaving(false);
  };

  // Keyboard: Ctrl+S to save
  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKey}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePreview}
            className={`inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs rounded-md transition-colors duration-200 ${
              preview
                ? "bg-sage text-white"
                : "bg-page-warm text-ink-secondary hover:bg-page-sand"
            }`}
          >
            <Eye size={14} />
            {preview ? "编辑" : "预览"}
          </button>
          {msg && (
            <span className={`font-sans text-xs ${msg.includes("失败") ? "text-terracotta" : "text-sage"}`}>
              {msg}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button onClick={onCancel}
              className="inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs rounded-md bg-page-warm text-ink-secondary hover:bg-page-sand transition-colors duration-200">
              <X size={14} />取消
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1 px-4 py-1.5 font-sans text-xs rounded-md bg-ink-primary text-page-cream hover:bg-ink-secondary transition-colors duration-200 disabled:opacity-50">
            <Save size={14} />{saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>

      {/* Blog fields */}
      {mode === "blog" && (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="w-full px-4 py-2.5 font-sans text-lg font-semibold border border-page-sand rounded-md bg-page-cream text-ink-primary placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签（逗号分隔）"
            className="w-full px-3 py-1.5 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-secondary placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
          />
        </>
      )}

      {/* Diary fields */}
      {mode === "diary" && (
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签"
            className="flex-1 px-3 py-1.5 font-sans text-sm border border-page-sand rounded-md bg-page-cream text-ink-secondary placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
          />
        </div>
      )}

      {/* Content / Preview */}
      {preview ? (
        <div
          className="min-h-[300px] p-6 border border-page-sand rounded-lg bg-page-cream prose max-w-prose font-serif"
          dangerouslySetInnerHTML={{ __html: html || "<p class='text-ink-muted'>暂无内容</p>" }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="开始写 Markdown…"
          className="w-full min-h-[300px] p-4 font-serif text-base leading-relaxed border border-page-sand rounded-md bg-page-cream text-ink-primary placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage resize-y"
        />
      )}

      <p className="font-sans text-xs text-ink-muted">
        <kbd className="px-1 py-0.5 text-[10px] rounded bg-page-warm border border-page-sand">Ctrl+S</kbd> 保存
      </p>
    </div>
  );
}
