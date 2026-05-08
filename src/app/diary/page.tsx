import { Metadata } from "next";
import { getDiaryDates } from "@/lib/content";
import Link from "next/link";

export const metadata: Metadata = {
  title: "日记",
  description: "我的日记",
};

export default function DiaryPage() {
  const dates = getDiaryDates();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-8">
        日记
      </h1>
      {dates.length === 0 ? (
        <div className="rounded-lg bg-lavender-soft dark:bg-[#221e26] px-6 py-12 text-center">
          <p className="text-ink-muted dark:text-[#7a7265]">
            这里还没有日记。写下今天的第一笔吧。
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {dates.map((date) => {
            const display = date.replace("/", "-");
            return (
              <Link
                key={date}
                href={`/diary/${date}`}
                className="px-4 py-2 font-sans text-sm rounded-md bg-page-warm dark:bg-[#221f1a] text-ink-secondary dark:text-[#b8a898] hover:bg-lavender-soft dark:hover:bg-[#221e26] hover:text-lavender dark:hover:text-[#c8b5d2] transition-colors duration-200"
              >
                {display}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
