"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onAdd: (title: string, date: string, time: string, duration: number, notes: string) => void;
}

export default function AddScheduleForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onAdd(title.trim(), date, time, duration, notes.trim());
    setTitle("");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加日程..."
          className="flex-1 px-3 py-2 font-sans text-sm border border-page-sand dark:border-[#2d2922] rounded-md bg-page-cream dark:bg-[#1a1814] text-ink-primary dark:text-[#e8e0d5] placeholder:text-ink-muted dark:placeholder:text-[#7a7265] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage dark:focus-visible:outline-[#8ab88e]"
        />
        <button
          type="submit"
          disabled={!title.trim() || !date}
          className="inline-flex items-center gap-1 px-4 py-2 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary dark:hover:bg-[#b8a898] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Plus size={16} />
          添加
        </button>
      </div>
      <div className="flex gap-3 text-sm">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-2 py-1 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
          required
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-2 py-1 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
        />
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="px-2 py-1 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
        >
          <option value={30}>30分钟</option>
          <option value={60}>1小时</option>
          <option value={90}>1.5小时</option>
          <option value={120}>2小时</option>
          <option value={180}>3小时</option>
        </select>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="备注（可选）"
        className="px-2 py-1 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
      />
    </form>
  );
}
