"use client";

import { useMemo, useCallback } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import ScheduleItem from "@/components/schedule/ScheduleItem";
import AddScheduleForm from "@/components/schedule/AddScheduleForm";
import TodoExportImport from "@/components/todo/TodoExportImport";

export default function SchedulePage() {
  const {
    events,
    loaded,
    addEvent,
    removeEvent,
    exportData,
    importData,
  } = useSchedule();

  const { toast } = useToast();
  const { ensureAuth } = useAuth();

  const handleAdd = useCallback(
    (title: string, date: string, time: string, duration: number, notes: string) => {
      ensureAuth(async () => {
        try {
          await addEvent(title, date, time, duration, notes);
          toast("已添加日程");
        } catch {
          toast("添加失败");
        }
      });
    },
    [addEvent, toast, ensureAuth]
  );

  const handleRemove = useCallback(
    (id: string) => {
      ensureAuth(() => {
        const event = events.find((e) => e.id === id);
        removeEvent(id);
        if (event) toast("已删除日程");
      });
    },
    [events, removeEvent, toast, ensureAuth]
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const event of events) {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const today = (() => { const d = new Date(); d.setHours(d.getHours() + 8); return d.toISOString().slice(0, 10); })();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-2">
        日程
      </h1>
      <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265] mb-6">
        数据存储在浏览器本地。使用导出/导入功能备份或跨设备同步。
      </p>

      <div className="mb-8">
        <AddScheduleForm onAdd={handleAdd} />
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
              日程列表
            </h2>
            <TodoExportImport onExport={exportData} onImport={importData} />
          </div>

          {grouped.length === 0 && (
            <div className="rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-10 text-center">
              <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="10" y="8" width="20" height="24" rx="3" stroke="#9b9284" strokeWidth="1.5" opacity="0.5" />
                <line x1="10" y1="16" x2="30" y2="16" stroke="#9b9284" strokeWidth="1.5" opacity="0.3" />
                <line x1="14" y1="12" x2="14" y2="20" stroke="#9b9284" strokeWidth="1.5" opacity="0.3" />
                <line x1="26" y1="12" x2="26" y2="20" stroke="#9b9284" strokeWidth="1.5" opacity="0.3" />
                <circle cx="16" cy="22" r="2" stroke="#9b9284" strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="22" x2="28" y2="22" stroke="#9b9284" strokeWidth="1.5" opacity="0.4" />
                <circle cx="16" cy="28" r="2" stroke="#9b9284" strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="28" x2="28" y2="28" stroke="#9b9284" strokeWidth="1.5" opacity="0.4" />
              </svg>
              <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265]">
                暂无日程。安排你的下一个计划吧。
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {grouped.map(([date, dayEvents]) => (
              <div key={date}>
                <h3
                  className={`font-sans text-sm font-medium mb-2 ${
                    date === today
                      ? "text-sage dark:text-[#8ab88e]"
                      : "text-ink-secondary dark:text-[#b8a898]"
                  }`}
                >
                  {date}
                  {date === today && " · 今天"}
                </h3>
                <div className="flex flex-col gap-2">
                  {dayEvents.map((event) => (
                    <ScheduleItem
                      key={event.id}
                      event={event}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
