"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";

interface TodoItem {
  id: string;
  text: string;
  done: number;
  priority: string;
  created_at: string;
  due_date: string | null;
}

export function useTodos() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getTodos()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const addTodo = useCallback(
    async (text: string, priority: string = "medium", dueDate: string | null = null) => {
      await api.createTodo({ text, priority, dueDate: dueDate || undefined });
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          text,
          done: 0,
          priority,
          created_at: new Date().toISOString(),
          due_date: dueDate,
        },
        ...prev,
      ]);
    },
    []
  );

  const toggleTodo = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newDone = item.done ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: newDone } : i))
    );
    await api.updateTodo(id, { done: !!newDone }).catch(() => {});
  }, [items]);

  const removeTodo = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await api.deleteTodo(id).catch(() => {});
  }, []);

  const updateTodoText = useCallback(async (id: string, text: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, text } : i))
    );
    await api.updateTodo(id, { text }).catch(() => {});
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify({ items }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const importData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.items && Array.isArray(json.items)) {
            for (const item of json.items) {
              await api.createTodo({
                text: item.text,
                priority: item.priority || "medium",
                dueDate: item.due_date || item.dueDate,
              }).catch(() => {});
            }
            const fresh = await api.getTodos();
            setItems(fresh);
          }
        } catch {
          alert("导入失败：文件格式不正确");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return {
    items: items.map((i) => ({
      ...i,
      done: !!i.done,
      createdAt: i.created_at,
      dueDate: i.due_date,
      priority: i.priority as "high" | "medium" | "low",
    })),
    loaded,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodoText,
    exportData,
    importData,
  };
}
