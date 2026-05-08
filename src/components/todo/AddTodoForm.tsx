"use client";

import { useRef, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { TodoItem } from "@/types/todo";

interface Props {
  onAdd: (text: string, priority: TodoItem["priority"], dueDate: string | null) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function AddTodoForm({ onAdd, inputRef }: Props) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<TodoItem["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const internalRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority, dueDate || null);
    setText("");
    setDueDate("");
    const el = inputRef?.current || internalRef.current;
    el?.focus();
  };

  // Sync internal ref to external ref
  const setRefs = useCallback(
    (el: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (inputRef) {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    },
    [inputRef]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          ref={setRefs}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="添加新任务..."
          className="flex-1 px-3 py-2 font-sans text-sm border border-page-sand dark:border-[#2d2922] rounded-md bg-page-cream dark:bg-[#1a1814] text-ink-primary dark:text-[#e8e0d5] placeholder:text-ink-muted dark:placeholder:text-[#7a7265] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage dark:focus-visible:outline-[#8ab88e]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex items-center gap-1 px-4 py-2 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary dark:hover:bg-[#b8a898] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Plus size={16} />
          添加
        </button>
      </div>
      <div className="flex gap-3 text-sm">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoItem["priority"])}
          className="px-2 py-1 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
        >
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-2 py-1 font-sans text-xs border border-page-sand dark:border-[#2d2922] rounded bg-page-cream dark:bg-[#1a1814] text-ink-secondary dark:text-[#b8a898] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sage"
        />
      </div>
    </form>
  );
}
