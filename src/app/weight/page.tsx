"use client";

import { useMemo, useState, useCallback } from "react";
import { useWeight } from "@/hooks/useWeight";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import WeightChart from "@/components/weight/WeightChart";
import AddWeightForm from "@/components/weight/AddWeightForm";
import TodoExportImport from "@/components/todo/TodoExportImport";
import { RefreshCw, Trash2 } from "lucide-react";

const TIME_RANGES = [
  { label: "7天", days: 7 },
  { label: "30天", days: 30 },
  { label: "90天", days: 90 },
  { label: "全部", days: 0 },
];

export default function WeightPage() {
  const {
    entries,
    height,
    goalWeight,
    loaded,
    addEntry,
    removeEntry,
    reloadSeed,
    exportData,
    importData,
    setHeight,
    setGoalWeight,
  } = useWeight();

  const { toast } = useToast();
  const { ensureAuth } = useAuth();
  const [days, setDays] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  const [heightInput, setHeightInput] = useState(String(height || ""));
  const [goalInput, setGoalInput] = useState(String(goalWeight || ""));

  const handleAdd = useCallback(
    (date: string, weight: number, note?: string) => {
      ensureAuth(async () => {
        try {
          await addEntry(date, weight, note);
          toast("已添加记录");
        } catch {
          toast("添加失败");
        }
      });
    },
    [addEntry, toast, ensureAuth]
  );

  const handleReloadSeed = useCallback(() => {
    reloadSeed().then((count) => {
      if (count > 0) toast(`已从种子数据加载 ${count} 条记录`);
      else toast("种子数据为空");
    }).catch(() => toast("加载失败"));
  }, [reloadSeed, toast]);

  const handleRemove = useCallback(
    (id: string) => {
      ensureAuth(() => {
        removeEntry(id);
        toast("已删除", { label: "撤销", onClick: () => {} });
      });
    },
    [removeEntry, toast, ensureAuth]
  );

  // Stats
  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const weekAgo = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .slice(0, 10);
    const weekEntries = sorted.filter((e) => e.date >= weekAgo);
    const oldest = weekEntries[0];
    const trend =
      weekEntries.length >= 2 && oldest
        ? latest.weight - oldest.weight
        : null;

    const bmi = height
      ? (latest.weight / ((height / 100) * (height / 100))).toFixed(1)
      : null;

    const toGoal = goalWeight ? latest.weight - goalWeight : null;

    return { latest, trend, bmi, toGoal };
  }, [entries, height, goalWeight]);

  // Save settings
  const saveSettings = () => {
    const h = parseFloat(heightInput);
    const g = parseFloat(goalInput);
    setHeight(h > 0 ? h : undefined);
    setGoalWeight(g > 0 ? g : undefined);
    setShowSettings(false);
    toast("已保存设置");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-2">
        体重管理
      </h1>
      <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265] mb-6">
        数据存储在浏览器本地。
      </p>

      {/* Stats summary */}
      {stats && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[80px] rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-3 text-center">
            <div className="font-sans text-2xl font-semibold text-ink-primary dark:text-[#e8e0d5]">
              {stats.latest.weight}
              <span className="text-sm font-normal text-ink-muted ml-0.5">kg</span>
            </div>
            <div className="text-xs text-ink-muted dark:text-[#7a7265] mt-0.5">
              {stats.latest.date}
            </div>
          </div>

          {stats.trend !== null && (
            <div className="flex-1 min-w-[80px] rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-3 text-center">
              <div
                className={`font-sans text-2xl font-semibold ${
                  stats.trend > 0
                    ? "text-terracotta dark:text-[#d49578]"
                    : stats.trend < 0
                    ? "text-sage dark:text-[#8ab88e]"
                    : "text-ink-muted dark:text-[#7a7265]"
                }`}
              >
                {stats.trend > 0 ? "↑" : stats.trend < 0 ? "↓" : "→"}{" "}
                {Math.abs(stats.trend).toFixed(1)}
              </div>
              <div className="text-xs text-ink-muted dark:text-[#7a7265] mt-0.5">
                7天变化
              </div>
            </div>
          )}

          {stats.bmi && (
            <div className="flex-1 min-w-[80px] rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-3 text-center">
              <div className="font-sans text-2xl font-semibold text-ink-primary dark:text-[#e8e0d5]">
                {stats.bmi}
              </div>
              <div className="text-xs text-ink-muted dark:text-[#7a7265] mt-0.5">
                BMI
              </div>
            </div>
          )}

          {stats.toGoal !== null && (
            <div className="flex-1 min-w-[80px] rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-3 text-center">
              <div
                className={`font-sans text-2xl font-semibold ${
                  stats.toGoal <= 0
                    ? "text-sage dark:text-[#8ab88e]"
                    : "text-terracotta dark:text-[#d49578]"
                }`}
              >
                {stats.toGoal > 0 ? "+" : ""}
                {stats.toGoal.toFixed(1)}
              </div>
              <div className="text-xs text-ink-muted dark:text-[#7a7265] mt-0.5">
                距目标
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="mb-6">
        {/* Time range pills */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {TIME_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1 font-sans text-xs rounded-full transition-colors duration-200 ${
                  days === r.days
                    ? "bg-sage dark:bg-[#8ab88e] text-white dark:text-[#1a1814]"
                    : "bg-page-warm dark:bg-[#221f1a] text-ink-secondary dark:text-[#b8a898] hover:bg-page-sand dark:hover:bg-[#2d2922]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setHeightInput(String(height || ""));
              setGoalInput(String(goalWeight || ""));
              setShowSettings(!showSettings);
            }}
            className="font-sans text-xs text-sage dark:text-[#8ab88e] hover:underline"
          >
            设置
          </button>
        </div>

        <WeightChart entries={entries} goalWeight={goalWeight} height={height} days={days} />
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-6 p-4 rounded-md bg-page-warm dark:bg-[#221f1a] flex items-end gap-3">
          <div className="flex-1">
            <label className="block font-sans text-xs text-ink-muted dark:text-[#7a7265] mb-1">
              身高 (cm)
            </label>
            <input
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              placeholder="175"
              className="w-full px-2 py-1.5 font-sans text-sm border border-page-sand rounded bg-page-cream text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
            />
          </div>
          <div className="flex-1">
            <label className="block font-sans text-xs text-ink-muted dark:text-[#7a7265] mb-1">
              目标体重 (kg)
            </label>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="68"
              className="w-full px-2 py-1.5 font-sans text-sm border border-page-sand rounded bg-page-cream text-ink-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
            />
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-1.5 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary transition-colors duration-200"
          >
            保存
          </button>
        </div>
      )}

      {/* Add form */}
      <div className="mb-6">
        <AddWeightForm onAdd={handleAdd} />
      </div>

      {/* Records list */}
      {!loaded ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 rounded-md bg-page-warm dark:bg-[#221f1a] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans text-sm font-semibold text-ink-primary dark:text-[#e8e0d5]">
              记录 ({entries.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReloadSeed}
                className="inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs text-ink-secondary dark:text-[#b8a898] border border-page-sand dark:border-[#2d2922] rounded-md hover:bg-page-warm dark:hover:bg-[#221f1a] transition-colors duration-200"
                title="从线上种子数据重新加载"
              >
                <RefreshCw size={14} />
                重置
              </button>
              <TodoExportImport onExport={exportData} onImport={importData} />
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-md bg-page-warm dark:bg-[#221f1a] px-4 py-10 text-center">
              <svg
                className="mx-auto mb-3"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
              >
                <rect
                  x="12"
                  y="10"
                  width="16"
                  height="18"
                  rx="4"
                  stroke="#9b9284"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
                <line
                  x1="15"
                  y1="20"
                  x2="25"
                  y2="20"
                  stroke="#9b9284"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <line
                  x1="20"
                  y1="15"
                  x2="20"
                  y2="25"
                  stroke="#9b9284"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <path
                  d="M28 28c-1 3-3 5-8 5s-7-2-8-5"
                  stroke="#7a9a7e"
                  strokeWidth="1.2"
                  opacity="0.6"
                />
              </svg>
              <p className="font-sans text-sm text-ink-muted dark:text-[#7a7265]">
                还没有体重记录。开始记录你的身体刻度吧。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-md bg-page-warm dark:bg-[#221f1a]"
                >
                  <span className="font-sans text-xs text-ink-muted dark:text-[#7a7265] w-[72px] flex-shrink-0">
                    {entry.date.slice(5)}
                  </span>
                  <span className="font-sans text-sm font-semibold text-ink-primary dark:text-[#e8e0d5] flex-shrink-0">
                    {entry.weight} kg
                  </span>
                  {entry.note && (
                    <span className="font-sans text-xs text-ink-muted dark:text-[#7a7265] truncate flex-1 min-w-0">
                      {entry.note}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="p-1 text-ink-muted hover:text-terracotta transition-colors duration-200 flex-shrink-0 ml-auto"
                    aria-label="删除记录"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
