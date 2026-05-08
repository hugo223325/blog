"use client";

import { ScheduleEvent } from "@/types/schedule";
import { Clock, Trash2 } from "lucide-react";

interface Props {
  event: ScheduleEvent;
  onRemove: (id: string) => void;
}

export default function ScheduleItem({ event, onRemove }: Props) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-md bg-page-warm dark:bg-[#221f1a] transition-colors duration-200">
      <div className="flex-1 min-w-0">
        <h3 className="font-sans text-sm font-medium text-ink-primary dark:text-[#e8e0d5] truncate">
          {event.title}
        </h3>
        <div className="flex items-center gap-3 mt-1 font-sans text-xs text-ink-muted dark:text-[#7a7265]">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {event.time}
          </span>
          <span>{event.duration}分钟</span>
        </div>
        {event.notes && (
          <p className="mt-1 font-sans text-xs text-ink-muted dark:text-[#7a7265] truncate">
            {event.notes}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(event.id)}
        className="p-1 text-ink-muted dark:text-[#7a7265] hover:text-terracotta dark:hover:text-[#d49578] transition-colors duration-200 flex-shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
