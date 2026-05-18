"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  note: string;
  created_at: string;
}

export function useWeight() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [height, setH] = useState<number | undefined>();
  const [goalWeight, setGW] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getWeight().then(setEntries).catch(() => {}),
      api.getSettings().then((s) => {
        if (s.height) setH(Number(s.height));
        if (s.goalWeight) setGW(Number(s.goalWeight));
      }).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }, []);

  const addEntry = useCallback(
    async (date: string, weight: number, note?: string) => {
      await api.createWeight({ date, weight, note });
      setEntries((prev) => [
        {
          id: crypto.randomUUID(),
          date,
          weight,
          note: note || "",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  const removeEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await api.deleteWeight(id).catch(() => {});
  }, []);

  const updateEntry = useCallback(async (id: string, updates: any) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    // Weight API only has POST/DELETE; skip update for now
  }, []);

  const setHeight = useCallback(async (h: number | undefined) => {
    setH(h);
    if (h !== undefined) {
      await api.updateSettings({ height: String(h) }).catch(() => {});
    }
  }, []);

  const setGoalWeight = useCallback(async (gw: number | undefined) => {
    setGW(gw);
    if (gw !== undefined) {
      await api.updateSettings({ goalWeight: String(gw) }).catch(() => {});
    }
  }, []);

  const reloadSeed = useCallback(async () => {
    const data = await api.getWeight();
    setEntries(data);
    return data.length;
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ entries, height, goalWeight }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weight-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries, height, goalWeight]);

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
          const list = json.entries || [];
          for (const entry of list) {
            await api.createWeight({
              date: entry.date,
              weight: entry.weight,
              note: entry.note || "",
            }).catch(() => {});
          }
          if (json.height) {
            await api.updateSettings({ height: String(json.height) });
            setH(json.height);
          }
          if (json.goalWeight) {
            await api.updateSettings({ goalWeight: String(json.goalWeight) });
            setGW(json.goalWeight);
          }
          const fresh = await api.getWeight();
          setEntries(fresh);
        } catch {
          alert("导入失败");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return {
    entries,
    height,
    goalWeight,
    loaded,
    addEntry,
    removeEntry,
    updateEntry,
    setHeight,
    setGoalWeight,
    reloadSeed,
    exportData,
    importData,
  };
}
