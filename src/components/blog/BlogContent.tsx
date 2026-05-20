"use client";

import { useMemo } from "react";

export default function BlogContent({ html }: { html: string }) {
  const toc = useMemo(() => {
    const headings: { id: string; text: string; level: number }[] = [];
    const regex = /<h([2-3])\b[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      headings.push({ level: parseInt(match[1]), id: match[2], text: match[3].replace(/<[^>]*>/g, "") });
    }
    return headings;
  }, [html]);

  const stats = useMemo(() => {
    const text = html.replace(/<[^>]*>/g, "");
    const mins = Math.max(1, Math.ceil(text.length / 400));
    return { chars: text.length, mins };
  }, [html]);

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-xs text-ink-muted mb-6">约 {stats.chars} 字 · 阅读 {stats.mins} 分钟</p>
        <div className="prose max-w-[68ch] font-serif text-[1.1rem] leading-[1.85] dark:text-[#e8e0d5] prose-a:text-sage prose-headings:font-sans prose-headings:font-semibold"
          dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {toc.length > 1 && (
        <nav className="hidden xl:block w-44 flex-shrink-0">
          <div className="sticky top-20">
            <h4 className="font-sans text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-3">目录</h4>
            <ul className="space-y-1">
              {toc.map((h) => (
                <li key={h.id} style={{ paddingLeft: (h.level - 2) * 12 }}>
                  <a href={`#${h.id}`} className="block font-sans text-xs text-ink-secondary hover:text-sage transition-colors duration-200 leading-relaxed">{h.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}
