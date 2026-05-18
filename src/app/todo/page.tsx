"use client";

import { useRef, useCallback } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useToast } from "@/hooks/useToast";
import { useKeyboard } from "@/hooks/useKeyboard";
import TodoItem from "@/components/todo/TodoItem";
import AddTodoForm from "@/components/todo/AddTodoForm";
import TodoExportImport from "@/components/todo/TodoExportImport";

export default function TodoPage() {
  const {
    items,
    loaded,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodoText,
    exportData,
    importData,
  } = useTodos();

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Track last removed for undo
  const lastRemovedRef = useRef<{ id: string; text: string; priority: string; done: boolean; createdAt: string; dueDate: string | null } | null>(null);

  const handleAdd = useCallback(
    async (text: string, priority: "high" | "medium" | "low", dueDate: string | null) => {
      try {
        await addTodo(text, priority, dueDate);
        toast("已添加");
      } catch {
        toast("添加失败，检查网络");
      }
    },
    [addTodo, toast]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      // Store for undo
      lastRemovedRef.current = {
        id: item.id,
        text: item.text,
        priority: item.priority,
        done: item.done,
        createdAt: item.createdAt,
        dueDate: item.dueDate,
      };
      removeTodo(id);
      toast("已删除", {
        label: "撤销",
        onClick: () => {
          if (lastRemovedRef.current) {
            const r = lastRemovedRef.current;
            addTodo(r.text, r.priority as "high" | "medium" | "low", r.dueDate);
            lastRemovedRef.current = null;
          }
        },
      });
    },
    [items, removeTodo, toast, addTodo]
  );

  // Keyboard shortcuts
  useKeyboard([
    { key: "n", handler: () => inputRef.current?.focus() },
    { key: "N", handler: () => inputRef.current?.focus() },
  ]);

  const pending = items.filter((i) => !i.done);
  const completed = items.filter((i) => i.done);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-2">
        待办事项
      </h1>
      <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265] mb-6">
        数据存储在浏览器本地。按 <kbd className="px-1 py-0.5 text-xs rounded bg-page-warm dark:bg-[#221f1a] border border-page-sand dark:border-[#2d2922]">N</kbd> 快速输入。
      </p>

      <div className="mb-6">
        <AddTodoForm onAdd={handleAdd} inputRef={inputRef} />
      </div>

      {!loaded ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-md bg-page-warm dark:bg-[#221f1a] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-lg font-semibold text-ink-primary dark:text-[#e8e0d5]">
              进行中 ({pending.length})
            </h2>
            <TodoExportImport onExport={exportData} onImport={importData} />
          </div>
          <div className="flex flex-col gap-2 mb-8">
            {pending.length === 0 && (
              <div className="rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-10 text-center">
                <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="12" stroke="#9b9284" strokeWidth="1.5" opacity="0.5" />
                  <path d="M20 14v6M17 17h6" stroke="#9b9284" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                  <line x1="8" y1="34" x2="15" y2="30" stroke="#9b9284" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  <line x1="32" y1="34" x2="25" y2="30" stroke="#9b9284" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                </svg>
                <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265]">
                  暂无待办任务。享受此刻的宁静。
                </p>
              </div>
            )}
            {pending.map((item) => (
              <TodoItem
                key={item.id}
                item={item}
                onToggle={toggleTodo}
                onRemove={handleRemove}
                onUpdateText={updateTodoText}
              />
            ))}
          </div>

          {completed.length > 0 && (
            <>
              <h2 className="font-sans text-lg font-semibold text-ink-primary dark:text-[#e8e0d5] mb-4">
                已完成 ({completed.length})
              </h2>
              <div className="flex flex-col gap-2">
                {completed.map((item) => (
                  <TodoItem
                    key={item.id}
                    item={item}
                    onToggle={toggleTodo}
                    onRemove={handleRemove}
                    onUpdateText={updateTodoText}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
