"use client";

import { useState } from "react";

export default function DiaryCalendar({
  dates,
  onSelectDate,
}: {
  dates: string[];
  onSelectDate: (date: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (date: string) => {
    setSelected(date);
    onSelectDate(date);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {dates.map((date) => {
        const display = date.replace("/", "-");
        const isSelected = selected === date;
        return (
          <button
            key={date}
            onClick={() => handleSelect(date)}
            className={`px-3 py-1.5 font-sans text-sm rounded-md transition-colors duration-200 ${
              isSelected
                ? "bg-lavender dark:bg-[#c8b5d2] text-white dark:text-[#1a1814]"
                : "bg-page-warm dark:bg-[#221f1a] text-ink-secondary dark:text-[#b8a898] hover:bg-page-sand dark:hover:bg-[#2d2922]"
            }`}
          >
            {display}
          </button>
        );
      })}
      {dates.length === 0 && (
        <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265]">
          这里还没有日记。写下今天的第一笔吧。
        </p>
      )}
    </div>
  );
}
