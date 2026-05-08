"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "./useLocalStorage";
import { TodoData, TodoItem } from "@/types/todo";

const STORAGE_KEY = "blog-todos";
const SEED_URL = "/data/todos.json";

function emptyData(): TodoData {
  return { version: 1, lastModified: new Date().toISOString(), items: [] };
}

export function useTodos() {
  const [data, setData, loaded] = useLocalStorage<TodoData>(
    STORAGE_KEY,
    emptyData()
  );
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (loaded && !seeded && data.items.length === 0) {
      fetch(SEED_URL)
        .then((res) => res.json())
        .then((seed) => {
          if (seed && seed.items && seed.items.length > 0) {
            setData({
              ...seed,
              lastModified: new Date().toISOString(),
            });
          }
        })
        .catch(() => {})
        .finally(() => setSeeded(true));
    }
    if (loaded && data.items.length > 0) {
      setSeeded(true);
    }
  }, [loaded, seeded, data.items.length, setData]);

  const items = data.items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const addTodo = useCallback(
    (text: string, priority: TodoItem["priority"] = "medium", dueDate: string | null = null) => {
      const newItem: TodoItem = {
        id: uuidv4(),
        text,
        done: false,
        priority,
        createdAt: new Date().toISOString(),
        dueDate,
      };
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        items: [newItem, ...prev.items],
      }));
    },
    [setData]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        items: prev.items.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item
        ),
      }));
    },
    [setData]
  );

  const removeTodo = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        items: prev.items.filter((item) => item.id !== id),
      }));
    },
    [setData]
  );

  const updateTodoText = useCallback(
    (id: string, text: string) => {
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        items: prev.items.map((item) =>
          item.id === id ? { ...item, text } : item
        ),
      }));
    },
    [setData]
  );

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.items && Array.isArray(json.items)) {
            setData({ ...json, lastModified: new Date().toISOString() });
          }
        } catch {
          alert("导入失败：文件格式不正确");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setData]);

  return {
    items,
    loaded: seeded,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodoText,
    exportData,
    importData,
  };
}
