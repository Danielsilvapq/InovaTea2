"use client";

import { useState } from "react";

interface Point {
  label: string;
  value: number;
}

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

function useTip() {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  return { tip, setTip };
}

/** Gráfico de linha de uma série (ex.: % de acerto por sessão). */
export function LineChart({ data, max = 100, unit = "%", title }: { data: Point[]; max?: number; unit?: string; title: string }) {
  const { tip, setTip } = useTip();
  if (data.length === 0) return <p className="muted small">Ainda não há sessões suficientes para o gráfico.</p>;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;
  const path = data.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * max));

  return (
    <figure className="chart-wrap" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title} onMouseLeave={() => setTip(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-muted)">
              {t}
              {unit}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
        {data.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.value)} r={4.5} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={14}
              fill="transparent"
              onMouseEnter={() => setTip({ x: x(i), y: y(p.value), text: `${p.label}: ${p.value}${unit}` })}
            />
          </g>
        ))}
      </svg>
      {tip && (
        <div className="chart-tip" style={{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100}%` }}>
          {tip.text}
        </div>
      )}
      <figcaption className="sr-only" style={{ position: "absolute", left: -9999 }}>
        {data.map((p) => `${p.label}: ${p.value}${unit}`).join("; ")}
      </figcaption>
    </figure>
  );
}

/** Gráfico de barras de uma série (ex.: minutos por dia). */
export function BarChart({ data, unit = "min", title }: { data: Point[]; unit?: string; title: string }) {
  const { tip, setTip } = useTip();
  const max = Math.max(5, ...data.map((d) => d.value));
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const slot = iw / data.length;
  const bw = Math.min(28, slot - 6);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;
  const ticks = [0, 0.5, 1].map((t) => Math.round(t * max));

  return (
    <figure className="chart-wrap" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title} onMouseLeave={() => setTip(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-muted)">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const h = Math.max(0, PAD.top + ih - y(d.value));
          return (
            <g key={i} onMouseEnter={() => setTip({ x: cx, y: y(d.value), text: `${d.label}: ${d.value} ${unit}` })}>
              <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${cx - bw / 2},${PAD.top + ih} V${y(d.value) + Math.min(4, h)} q0,-4 4,-4 H${cx + bw / 2 - 4} q4,0 4,4 V${PAD.top + ih} Z`}
                  fill="var(--sage)"
                />
              )}
              {(i % 2 === 0 || data.length <= 7) && (
                <text x={cx} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--ink-muted)">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tip && (
        <div className="chart-tip" style={{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100}%` }}>
          {tip.text}
        </div>
      )}
    </figure>
  );
}
