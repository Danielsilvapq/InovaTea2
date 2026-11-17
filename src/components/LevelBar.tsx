import { levelInfo } from "@/lib/gamification";
import { ProgressBar } from "./ProgressBar";

export function LevelBar({ points, compact = false }: { points: number; compact?: boolean }) {
  const info = levelInfo(points);
  return (
    <div className="stack" style={{ minWidth: 0 }}>
      <div className="row between" style={{ gap: 8 }}>
        <strong>
          {info.emoji} Nível {info.level} · {info.title}
        </strong>
        {!compact && <span className="badge badge-primary">⭐ {points} pontos</span>}
      </div>
      <ProgressBar
        value={info.progress}
        tone="primary"
        label="Até o próximo nível"
        rightLabel={`${info.current} / ${info.needed}`}
      />
    </div>
  );
}
