"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onAdd: (date: string, weight: number, note?: string) => void;
}

export default function AddWeightForm({ onAdd }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!date || isNaN(w) || w <= 0) return;
    onAdd(date, w, note.trim() || undefined);
    setWeight("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="体重 (kg)"
          inputMode="decimal"
          step="0.1"
          min="30"
          max="200"
          className="w-36 px-3 py-2 font-sans text-sm border border-page-sand dark:border-[#2d2922] rounded-md bg-page-cream dark:bg-[#1a1814] text-ink-primary dark:text-[#e8e0d5] placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-3 py-2 font-sans text-sm border border-page-sand dark:border-[#2d2922] rounded-md bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
        />
        <button
          type="submit"
          disabled={!weight.trim() || !date}
          className="inline-flex items-center gap-1 px-4 py-2 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary dark:hover:bg-[#b8a898] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Plus size={16} />
          添加
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="备注（可选）"
        className="px-3 py-1.5 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded-md bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
      />
    </form>
  );
}
