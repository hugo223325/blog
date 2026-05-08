import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDiaryEntry, getDiaryDates } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import DiaryEntry from "@/components/diary/DiaryEntry";
import Link from "next/link";

export async function generateStaticParams() {
  return getDiaryDates().map((date) => ({ date }));
}

export async function generateMetadata({
  params,
}: {
  params: { date: string };
}): Promise<Metadata> {
  const entry = getDiaryEntry(params.date);
  return {
    title: entry ? `日记 ${entry.date}` : "日记未找到",
  };
}

export default async function DiaryEntryPage({
  params,
}: {
  params: { date: string };
}) {
  const entry = getDiaryEntry(params.date);
  if (!entry) notFound();

  const html = await renderMarkdown(entry.content);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/diary"
        className="inline-flex items-center gap-1 font-sans text-sm text-sage dark:text-[#8ab88e] hover:underline mb-6"
      >
        ← 返回日记列表
      </Link>
      <DiaryEntry entry={entry} html={html} />
    </div>
  );
}
