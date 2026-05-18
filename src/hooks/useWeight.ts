"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "./useLocalStorage";
import { WeightData, WeightEntry } from "@/types/weight";

const STORAGE_KEY = "blog-weight";
const SEED_URL = "/data/weight.json";

function emptyData(): WeightData {
  return { version: 1, lastModified: new Date().toISOString(), entries: [] };
}

export function useWeight() {
  const [data, setData, loaded] = useLocalStorage<WeightData>(
    STORAGE_KEY,
    emptyData()
  );
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (loaded && !seeded && data.entries.length === 0) {
      fetch(SEED_URL)
        .then((res) => res.json())
        .then((seed) => {
          if (seed && seed.entries && seed.entries.length > 0) {
            setData({
              ...seed,
              lastModified: new Date().toISOString(),
            });
          }
        })
        .catch(() => {})
        .finally(() => setSeeded(true));
    }
    if (loaded && data.entries.length > 0) {
      setSeeded(true);
    }
  }, [loaded, seeded, data.entries.length, setData]);

  const entries = [...data.entries].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const addEntry = useCallback(
    (date: string, weight: number, note?: string) => {
      const newEntry: WeightEntry = {
        id: uuidv4(),
        date,
        weight,
        note: note?.trim() || undefined,
      };
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        entries: [newEntry, ...prev.entries],
      }));
    },
    [setData]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        entries: prev.entries.filter((e) => e.id !== id),
      }));
    },
    [setData]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Pick<WeightEntry, "weight" | "date" | "note">>) => {
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        entries: prev.entries.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    },
    [setData]
  );

  const setHeight = useCallback(
    (height: number | undefined) => {
      setData((prev) => ({ ...prev, height }));
    },
    [setData]
  );

  const setGoalWeight = useCallback(
    (goalWeight: number | undefined) => {
      setData((prev) => ({ ...prev, goalWeight }));
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
    a.download = `weight-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
          if (json.entries && Array.isArray(json.entries)) {
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
    entries,
    height: data.height,
    goalWeight: data.goalWeight,
    loaded: seeded,
    addEntry,
    removeEntry,
    updateEntry,
    setHeight,
    setGoalWeight,
    exportData,
    importData,
  };
}
