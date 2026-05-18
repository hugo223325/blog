"use client";

import { WeightEntry } from "@/types/weight";

interface Props {
  entries: WeightEntry[];
  goalWeight?: number;
  days: number; // 0 = all
}

const PAD_LEFT = 40;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 30;

export default function WeightChart({ entries, goalWeight, days }: Props) {
  // Filter by time range
  const cutoff = days > 0
    ? new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    : "0000-01-01";
  const filtered = entries
    .filter((e) => e.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-page-warm dark:bg-[#221f1a] rounded-lg">
        <span className="font-sans text-sm text-ink-muted dark:text-[#7a7265]">
          暂无数据
        </span>
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const weights = filtered.map((e) => e.weight);
  const minW = Math.min(...weights, goalWeight ?? Infinity);
  const maxW = Math.max(...weights, goalWeight ?? -Infinity);
  const pad = Math.max((maxW - minW) * 0.3, 1);
  const yMin = minW - pad;
  const yMax = maxW + pad;

  const xScale = (i: number) =>
    filtered.length === 1
      ? PAD_LEFT + innerW / 2
      : PAD_LEFT + (i / (filtered.length - 1)) * innerW;

  const yScale = (w: number) =>
    PAD_TOP + innerH - ((w - yMin) / (yMax - yMin)) * innerH;

  // Build polyline points
  const points = filtered
    .map((e, i) => `${xScale(i)},${yScale(e.weight)}`)
    .join(" ");

  // Y-axis labels (3 ticks)
  const yTicks = [yMin, (yMin + yMax) / 2, yMax].map((v) =>
    Math.round(v * 10) / 10
  );

  // X-axis labels (max 6)
  const xTickInterval = Math.max(1, Math.ceil(filtered.length / 6));
  const xTicks = filtered.filter((_, i) => i % xTickInterval === 0);

  // Area fill path
  const firstX = xScale(0);
  const lastX = xScale(filtered.length - 1);
  const bottomY = PAD_TOP + innerH;
  const areaPath = `M ${firstX},${bottomY} L ${points.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, "$1,$2 L ")} ${lastX},${bottomY} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto bg-page-warm dark:bg-[#221f1a] rounded-lg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD_LEFT}
            y1={yScale(tick)}
            x2={W - PAD_RIGHT}
            y2={yScale(tick)}
            stroke="#ede4d9"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={PAD_LEFT - 6}
            y={yScale(tick) + 4}
            textAnchor="end"
            className="text-[10px] fill-ink-muted dark:fill-[#7a7265]"
            fontFamily="system-ui"
          >
            {tick}kg
          </text>
        </g>
      ))}

      {/* Goal line */}
      {goalWeight !== undefined && (
        <>
          <line
            x1={PAD_LEFT}
            y1={yScale(goalWeight)}
            x2={W - PAD_RIGHT}
            y2={yScale(goalWeight)}
            stroke="#c17d5e"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text
            x={W - PAD_RIGHT}
            y={yScale(goalWeight) - 4}
            textAnchor="end"
            className="text-[10px] fill-terracotta dark:fill-[#d49578]"
            fontFamily="system-ui"
          >
            目标 {goalWeight}kg
          </text>
        </>
      )}

      {/* Area fill */}
      <defs>
        <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a9a7e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7a9a7e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#weightFill)" />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#7a9a7e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {filtered.map((e, i) => (
        <g key={e.id}>
          <title>
            {e.date}: {e.weight}kg{e.note ? ` (${e.note})` : ""}
          </title>
          <circle
            cx={xScale(i)}
            cy={yScale(e.weight)}
            r="3"
            fill="#faf7f2"
            stroke="#7a9a7e"
            strokeWidth="2"
          />
        </g>
      ))}

      {/* X-axis labels */}
      {xTicks.map((e) => (
        <text
          key={e.id}
          x={xScale(filtered.indexOf(e))}
          y={H - 6}
          textAnchor="middle"
          className="text-[10px] fill-ink-muted dark:fill-[#7a7265]"
          fontFamily="system-ui"
        >
          {e.date.slice(5)}
        </text>
      ))}
    </svg>
  );
}
