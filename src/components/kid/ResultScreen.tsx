"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ProgressBar";
import { MOODS_LIST } from "./moods";
import { saveMood, type SaveResult, formatClock } from "./useKid";
import { feedbackMessage } from "@/lib/gamification";

interface Props {
  patientId: string;
  result: SaveResult | null;
  correct?: number;
  total?: number;
  durationSec: number;
  completed: boolean;
  onRestart: () => void;
  message?: string;
}

export function ResultScreen({ patientId, result, correct, total, durationSec, completed, onRestart, message }: Props) {
  const router = useRouter();
  const [mood, setMood] = useState<string | null>(null);
  const accuracy = total ? (correct ?? 0) / total : null;

  async function pickMood(m: string) {
    setMood(m);
    if (result) await saveMood(result.sessionId, m);
    router.refresh();
  }

  return (
    <div className="card stack center" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ fontSize: "4rem" }}>{completed ? "🎉" : "👍"}</div>
      <h1>{completed ? "Você terminou!" : "Pausa feita."}</h1>
      <p style={{ fontSize: "1.15rem" }}>
        {message ?? (accuracy !== null ? feedbackMessage(accuracy) : "Obrigado por participar!")}
      </p>

      {accuracy !== null && (
        <ProgressBar value={accuracy} label="Acertos" rightLabel={`${correct} de ${total}`} />
      )}

      <div className="row" style={{ justifyContent: "center" }}>
        <span className="badge badge-primary" style={{ fontSize: "1.1rem" }}>
          ⭐ +{result?.points ?? 0} pontos
        </span>
        <span className="badge" style={{ fontSize: "1.1rem" }}>⏱ {formatClock(durationSec)}</span>
      </div>

      {result?.levelUp && (
        <div className="ok-box">
          🌟 Você subiu para o <strong>nível {result.newLevel}</strong>!
        </div>
      )}
      {result?.unlockedActivityLevel && (
        <div className="ok-box">
          🔓 Novo desafio liberado: <strong>nível {result.unlockedActivityLevel}</strong> desta atividade.
        </div>
      )}
      {!result && <div className="error-box">Não conseguimos salvar agora. Tudo bem, vamos tentar na próxima.</div>}

      <div>
        <h2>Como você está se sentindo agora?</h2>
        <div className="row" style={{ justifyContent: "center" }}>
          {MOODS_LIST.map((m) => (
            <button
              key={m.key}
              className="option"
              style={{ minHeight: 0, padding: 12, borderColor: mood === m.key ? "var(--primary)" : undefined }}
              onClick={() => pickMood(m.key)}
              aria-pressed={mood === m.key}
            >
              <span className="emoji">{m.emoji}</span>
              <span className="small">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && <p className="muted">Obrigado por me contar!</p>}
      </div>

      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn btn-lg btn-sage" onClick={onRestart}>
          🔁 Fazer de novo
        </button>
        <Link href={`/crianca/${patientId}`} className="btn btn-lg btn-secondary">
          🏠 Voltar ao início
        </Link>
      </div>
    </div>
  );
}
