"use client";

import { ProgressBar } from "@/components/ProgressBar";
import { formatClock } from "./useKid";

interface Props {
  emoji: string;
  title: string;
  level?: number;
  step: number;
  totalSteps: number;
  stepLabel?: string;
  elapsedSec: number;
  onStop: () => void;
  children: React.ReactNode;
}

/** Moldura comum de toda atividade: título, barra de progresso e tempo sempre visíveis. */
export function ActivityShell({ emoji, title, level, step, totalSteps, stepLabel = "Etapa", elapsedSec, onStop, children }: Props) {
  return (
    <div className="stack">
      <div className="card stack">
        <div className="row between">
          <h1 style={{ margin: 0 }}>
            {emoji} {title}
          </h1>
          <div className="row">
            {level && <span className="badge badge-primary">Nível {level}</span>}
            <span className="badge" aria-label="Tempo da sessão">⏱ {formatClock(elapsedSec)}</span>
            <button className="btn btn-secondary" onClick={onStop}>
              ⏸ Parar
            </button>
          </div>
        </div>
        <ProgressBar
          value={totalSteps ? step / totalSteps : 0}
          label={`${stepLabel} ${Math.min(step + 1, totalSteps)} de ${totalSteps}`}
          rightLabel={`${step} de ${totalSteps} feitas`}
        />
      </div>
      {children}
    </div>
  );
}
