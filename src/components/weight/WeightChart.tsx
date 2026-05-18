"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WeightEntry } from "@/types/weight";

interface Props {
  entries: WeightEntry[];
  goalWeight?: number;
  height?: number;
  days: number;
}

const W = 600;
const H = 240;
const PAD = { top: 24, right: 24, bottom: 36, left: 42 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

/* ── Catmull-Rom → cubic bezier ── */
function catmullRomToBezier(points: [number, number][], tension = 0.3): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x},${y}`;
  }
  if (points.length === 2) {
    const [x1, y1] = points[0];
    const [x2, y2] = points[1];
    const cx = (x1 + x2) / 2;
    return `M ${x1},${y1} Q ${cx},${(y1 + y2) / 2} ${x2},${y2}`;
  }

  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1[0] + ((p2[0] - p0[0]) * tension) / 6;
    const cp1y = p1[1] + ((p2[1] - p0[1]) * tension) / 6;
    const cp2x = p2[0] - ((p3[0] - p1[0]) * tension) / 6;
    const cp2y = p2[1] - ((p3[1] - p1[1]) * tension) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/* ── Nice round ticks ── */
function niceTicks(min: number, max: number, count: number): number[] {
  const range = max - min || 1;
  const rough = range / (count - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / magnitude;
  let tick: number;
  if (residual <= 1.5) tick = 1;
  else if (residual <= 3) tick = 2;
  else if (residual <= 7) tick = 5;
  else tick = 10;
  const step = tick * magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.1; v += step) {
    ticks.push(Math.round(v * 10) / 10);
  }
  return ticks.slice(0, 4);
}

export default function WeightChart({ entries, goalWeight, height, days }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  // Trigger re-animation when days change
  useEffect(() => {
    const id = setTimeout(() => setAnimKey((k) => k + 1), 50);
    return () => clearTimeout(id);
  }, [days]);

  // Filter & sort
  const cutoff =
    days > 0
      ? new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
      : "0000-01-01";
  const filtered = useMemo(
    () =>
      entries
        .filter((e) => e.date >= cutoff)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, cutoff]
  );

  if (filtered.length === 0) {
    return (
      <div className="w-full h-56 flex items-center justify-center bg-page-warm dark:bg-[#221f1a] rounded-lg">
        <span className="font-sans text-sm text-ink-muted dark:text-[#7a7265]">
          暂无数据
        </span>
      </div>
    );
  }

  // Scales
  const weights = filtered.map((e) => e.weight);
  const wMin = Math.min(...weights, goalWeight ?? Infinity);
  const wMax = Math.max(...weights, goalWeight ?? -Infinity);
  const pad = Math.max((wMax - wMin) * 0.25, 0.5);
  const yMin = wMin - pad;
  const yMax = wMax + pad;

  const xScale = (i: number) =>
    filtered.length === 1
      ? PAD.left + INNER_W / 2
      : PAD.left + (i / (filtered.length - 1)) * INNER_W;

  const yScale = (w: number) =>
    PAD.top + INNER_H - ((w - yMin) / (yMax - yMin)) * INNER_H;

  // Data points array
  const pts: [number, number][] = filtered.map((e, i) => [
    xScale(i),
    yScale(e.weight),
  ]);

  // Paths
  const linePath = catmullRomToBezier(pts, 0.35);
  const areaPath =
    pts.length < 2
      ? ""
      : `${linePath} L ${pts[pts.length - 1][0]},${PAD.top + INNER_H} L ${pts[0][0]},${PAD.top + INNER_H} Z`;

  // Tick labels
  const yTicks = niceTicks(yMin, yMax, 3);
  const xTickInterval = Math.max(1, Math.ceil(filtered.length / 6));
  const xTicks = filtered.filter((_, i) => i % xTickInterval === 0);

  // Estimate line length for animation
  const lineLen = useMemo(() => {
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0];
      const dy = pts[i][1] - pts[i - 1][1];
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(total * 1.15, 100); // 15% fudge for curves
  }, [pts]);

  // Tooltip data
  const hoverEntry = hoverIndex !== null ? filtered[hoverIndex] : null;
  const hoverBmi =
    hoverEntry && height
      ? (hoverEntry.weight / ((height / 100) * (height / 100))).toFixed(1)
      : null;

  // Mouse/touch → nearest point
  const findNearest = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (clientX - rect.left) * scaleX;
      const my = (clientY - rect.top) * scaleY;

      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const dx = pts[i][0] - mx;
        const dy = pts[i][1] - my;
        const dist = dx * dx + dy * dy;
        // Favor horizontal proximity
        const hDist = Math.abs(pts[i][0] - mx);
        if (hDist < 40 && dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      setHoverIndex(best >= 0 ? best : null);
    },
    [pts]
  );

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const evt = "touches" in e ? e.touches[0] : e;
    findNearest(evt.clientX, evt.clientY);
  };

  const handleLeave = () => setHoverIndex(null);

  // Latest entry for pulse
  const isLatest = (i: number) => i === filtered.length - 1;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto bg-page-warm dark:bg-[#221f1a] rounded-lg select-none touch-none cursor-crosshair"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchMove={handleMove}
        onTouchEnd={handleLeave}
      >
        <defs>
          <linearGradient id={`wGrad-${animKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a9a7e" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#7a9a7e" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#7a9a7e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              y1={yScale(tick)}
              x2={W - PAD.right}
              y2={yScale(tick)}
              stroke="#ede4d9"
              strokeWidth="0.8"
              strokeDasharray="6 4"
            />
            <text
              x={PAD.left - 8}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="text-[11px] fill-ink-muted dark:fill-[#7a7265]"
              fontFamily="system-ui"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Goal line */}
        {goalWeight !== undefined && yScale(goalWeight) > PAD.top && yScale(goalWeight) < PAD.top + INNER_H && (
          <>
            <line
              x1={PAD.left}
              y1={yScale(goalWeight)}
              x2={W - PAD.right}
              y2={yScale(goalWeight)}
              stroke="#c17d5e"
              strokeWidth="1.2"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <text
              x={PAD.left + 6}
              y={yScale(goalWeight) - 5}
              className="text-[10px] fill-terracotta dark:fill-[#d49578]"
              fontFamily="system-ui"
            >
              目标 {goalWeight}
            </text>
          </>
        )}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill={`url(#wGrad-${animKey})`} />}

        {/* Line — animated drawing */}
        <path
          key={`line-${animKey}`}
          d={linePath}
          fill="none"
          stroke="#7a9a7e"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={lineLen}
          strokeDashoffset={lineLen}
          style={{ animation: `drawLine 1.2s ease forwards` }}
        />

        {/* Data points */}
        {filtered.map((e, i) => (
          <g key={e.id}>
            {/* Pulse ring on latest */}
            {isLatest(i) && (
              <circle
                cx={pts[i][0]}
                cy={pts[i][1]}
                r="5"
                fill="none"
                stroke="#7a9a7e"
                strokeWidth="1.5"
                opacity="0.4"
                style={{ animation: "pulse 2s ease infinite", transformOrigin: `${pts[i][0]}px ${pts[i][1]}px` }}
              />
            )}
            {/* Hover highlight */}
            {hoverIndex === i && (
              <circle
                cx={pts[i][0]}
                cy={pts[i][1]}
                r="12"
                fill="#7a9a7e"
                opacity="0.12"
              />
            )}
            {/* Dot */}
            <circle
              cx={pts[i][0]}
              cy={pts[i][1]}
              r={hoverIndex === i ? 5.5 : isLatest(i) ? 4.5 : 3}
              fill={hoverIndex === i ? "#7a9a7e" : "#faf7f2"}
              stroke={hoverIndex === i ? "#faf7f2" : "#7a9a7e"}
              strokeWidth={isLatest(i) && hoverIndex !== i ? 2.5 : 2}
              style={{ transition: "r 0.2s ease, fill 0.2s ease, stroke 0.2s ease" }}
            />
          </g>
        ))}

        {/* X-axis labels */}
        {xTicks.map((e) => (
          <text
            key={e.id}
            x={xScale(filtered.indexOf(e))}
            y={H - 8}
            textAnchor="middle"
            className="text-[10px] fill-ink-muted dark:fill-[#7a7265]"
            fontFamily="system-ui"
          >
            {e.date.slice(5)}
          </text>
        ))}

        {/* Hover vertical line */}
        {hoverEntry && hoverIndex !== null && (
          <line
            x1={pts[hoverIndex][0]}
            y1={PAD.top}
            x2={pts[hoverIndex][0]}
            y2={PAD.top + INNER_H}
            stroke="#7a9a7e"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Tooltip card */}
      {hoverEntry && hoverIndex !== null && (
        <div
          className="absolute z-10 px-3 py-2 rounded-md bg-page-cream dark:bg-[#1a1814] border border-page-sand dark:border-[#2d2922] pointer-events-none shadow-sm"
          style={{
            left: `${((pts[hoverIndex][0] / W) * 100).toFixed(1)}%`,
            top: 0,
            transform: "translate(-50%, -110%)",
            animation: "tooltipIn 0.15s ease",
          }}
        >
          <p className="font-sans text-xs font-semibold text-ink-primary dark:text-[#e8e0d5] whitespace-nowrap">
            {hoverEntry.weight} kg
          </p>
          <p className="font-sans text-[10px] text-ink-muted dark:text-[#7a7265] whitespace-nowrap">
            {hoverEntry.date}
            {hoverBmi ? ` · BMI ${hoverBmi}` : ""}
          </p>
          {hoverEntry.note && (
            <p className="font-sans text-[10px] text-ink-secondary dark:text-[#b8a898] whitespace-nowrap mt-0.5 max-w-[160px] truncate">
              {hoverEntry.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
