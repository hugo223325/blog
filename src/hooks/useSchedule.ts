"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "./useLocalStorage";
import { ScheduleData, ScheduleEvent } from "@/types/schedule";

const STORAGE_KEY = "blog-schedule";
const SEED_URL = "/data/schedule.json";

function emptyData(): ScheduleData {
  return { version: 1, lastModified: new Date().toISOString(), events: [] };
}

export function useSchedule() {
  const [data, setData, loaded] = useLocalStorage<ScheduleData>(
    STORAGE_KEY,
    emptyData()
  );
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (loaded && !seeded && data.events.length === 0) {
      fetch(SEED_URL)
        .then((res) => res.json())
        .then((seed) => {
          if (seed && seed.events && seed.events.length > 0) {
            setData({ ...seed, lastModified: new Date().toISOString() });
          }
        })
        .catch(() => {})
        .finally(() => setSeeded(true));
    }
    if (loaded && data.events.length > 0) {
      setSeeded(true);
    }
  }, [loaded, seeded, data.events.length, setData]);

  const events = data.events.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const addEvent = useCallback(
    (title: string, date: string, time: string, duration: number, notes: string) => {
      const newEvent: ScheduleEvent = {
        id: uuidv4(),
        title,
        date,
        time,
        duration,
        notes,
      };
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        events: [...prev.events, newEvent],
      }));
    },
    [setData]
  );

  const removeEvent = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        lastModified: new Date().toISOString(),
        events: prev.events.filter((e) => e.id !== id),
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
    a.download = `schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
          if (json.events && Array.isArray(json.events)) {
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

  const getEventsByDate = useCallback(
    (date: string) => events.filter((e) => e.date === date),
    [events]
  );

  return {
    events,
    loaded: seeded,
    addEvent,
    removeEvent,
    exportData,
    importData,
    getEventsByDate,
  };
}
