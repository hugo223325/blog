import { DiaryEntry as DiaryEntryType } from "@/types/diary";
import BlogContent from "@/components/blog/BlogContent";

export default function DiaryEntry({ entry, html }: { entry: DiaryEntryType; html: string }) {
  return (
    <article>
      <header className="mb-6">
        <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">
          {entry.date}
        </h1>
        <div className="mt-3 flex items-center gap-4 font-sans text-sm text-ink-muted dark:text-[#7a7265]">
          {entry.mood && <span>心情：{entry.mood}</span>}
          {entry.tags.length > 0 && <span>标签：{entry.tags.join(", ")}</span>}
        </div>
      </header>
      <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] px-6 py-6">
        <BlogContent html={html} />
      </div>
    </article>
  );
}
