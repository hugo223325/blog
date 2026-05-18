"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  created_at: string;
}

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getSchedule()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const addEvent = useCallback(
    async (title: string, date: string, time: string, duration: number, notes: string) => {
      await api.createSchedule({ title, date, time, duration, notes });
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          title,
          date,
          time,
          duration,
          notes,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  const removeEvent = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await api.deleteSchedule(id).catch(() => {});
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify({ events }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

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
          const entries = json.events || json.items || [];
          for (const entry of entries) {
            await api.createSchedule({
              title: entry.title,
              date: entry.date,
              time: entry.time || "09:00",
              duration: entry.duration || 60,
              notes: entry.notes || "",
            }).catch(() => {});
          }
          const fresh = await api.getSchedule();
          setEvents(fresh);
        } catch {
          alert("导入失败：文件格式不正确");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return { events, loaded, addEvent, removeEvent, exportData, importData };
}
