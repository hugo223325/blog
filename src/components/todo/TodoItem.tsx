"use client";

import { useRef, useState } from "react";
import { TodoItem as TodoItemType } from "@/types/todo";
import { Check, Trash2 } from "lucide-react";

interface Props {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

const priorityStyles = {
  high: "bg-terracotta-soft dark:bg-[#2a1e18]",
  medium: "bg-page-warm dark:bg-[#221f1a]",
  low: "bg-sage-soft dark:bg-[#1e2a20]",
};

const priorityDots = {
  high: "bg-terracotta",
  medium: "bg-ink-muted dark:bg-[#7a7265]",
  low: "bg-sage",
};

export default function TodoItem({ item, onToggle, onRemove, onUpdateText }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setEditText(item.text);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      onUpdateText(item.id, trimmed);
    }
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-md ${priorityStyles[item.priority]} ${item.done ? "opacity-50" : ""} transition-all duration-200`}
      onDoubleClick={() => !item.done && startEdit()}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!item.done) startEdit();
      }}
    >
      {/* Priority dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDots[item.priority]}`} />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
          item.done
            ? "bg-sage border-sage dark:bg-[#8ab88e] dark:border-[#8ab88e]"
            : "border-page-sand dark:border-[#2d2922] hover:border-sage dark:hover:border-[#8ab88e]"
        }`}
        aria-label={item.done ? "标记未完成" : "标记完成"}
      >
        {item.done && <Check size={12} className="text-white dark:text-[#1a1814]" />}
      </button>

      {/* Text / Edit field */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKey}
            className="w-full px-1.5 py-0.5 font-sans text-sm rounded border border-sage dark:border-[#8ab88e] bg-page-cream dark:bg-[#1a1814] text-ink-primary dark:text-[#e8e0d5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
            autoFocus
          />
        ) : (
          <span
            className={`block text-sm truncate font-sans ${
              item.done
                ? "line-through text-ink-muted dark:text-[#7a7265]"
                : "text-ink-primary dark:text-[#e8e0d5] cursor-default"
            }`}
            title={item.done ? undefined : "双击或长按编辑"}
          >
            {item.text}
          </span>
        )}
        {item.dueDate && (
          <span className="text-xs text-ink-muted dark:text-[#7a7265]">
            截止：{item.dueDate}
          </span>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="p-1 text-ink-muted dark:text-[#7a7265] hover:text-terracotta dark:hover:text-[#d49578] transition-colors duration-200 flex-shrink-0"
        aria-label="删除待办"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
