"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ODD_ROUNDS } from "@/lib/activities";
import { oddRounds, type OddRound } from "@/lib/generators";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number };

/** Encontre o Diferente: uma figura na grade não é igual às outras. */
export function OddGame({ patientId, level, soundOn }: { patientId: string; level: number; soundOn: boolean }) {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  const [rounds, setRounds] = useState<OddRound[]>([]);
  useEffect(() => setRounds(oddRounds(level)), [level, seed]);
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const start = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const r = rounds[round];

  function choose(i: number) {
    if (chosen !== null || !r) return;
    setChosen(i);
    const ok = i === r.oddIndex;
    play(ok ? "ok" : "try");
    setAnswers((a) => [...a, { question: `Rodada ${round + 1}: ${r.same} × ${r.odd}`, chosen: r.cells[i], correct: ok, timeMs: Date.now() - start.current }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "diferente", level, correct, wrong: answers.length - correct,
      total: completed ? ODD_ROUNDS : answers.length, durationSec: duration, completed, details: { answers },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (round + 1 >= ODD_ROUNDS) return void finish(true);
    setRound(round + 1);
    setChosen(null);
    start.current = Date.now();
  }

  function restart() {
    setSeed((s) => s + 1);
    setRound(0);
    setChosen(null);
    setAnswers([]);
    setDone(null);
    timer.reset();
  }

  if (done) {
    return (
      <ResultScreen patientId={patientId} result={done.result} correct={answers.filter((a) => a.correct).length}
        total={done.completed ? ODD_ROUNDS : answers.length} durationSec={done.duration} completed={done.completed} onRestart={restart} />
    );
  }

  return (
    <ActivityShell emoji="🔍" title="Encontre o Diferente" level={level} step={answers.length} totalSteps={ODD_ROUNDS}
      stepLabel="Rodada" elapsedSec={timer.sec} onStop={() => finish(false)}>
      <div className="card stack center">
        <h2>Toque na figura que é diferente das outras.</h2>
        {r && (
          <div className="odd-grid" style={{ ["--cols" as string]: r.cols }}>
            {r.cells.map((c, i) => {
              const cls = chosen === null ? "" : i === r.oddIndex ? "correct" : i === chosen ? "chosen-wrong" : "";
              return (
                <button key={`${round}-${i}`} className={`odd-cell ${cls}`} onClick={() => choose(i)} disabled={chosen !== null} aria-label={`Figura ${i + 1}: ${c}`}>
                  {c}
                </button>
              );
            })}
          </div>
        )}
        {chosen !== null && r && (
          <div className="stack">
            <div className={chosen === r.oddIndex ? "ok-box" : "error-box"} role="status">
              <strong>{chosen === r.oddIndex ? "✅ Achou!" : "💛 Quase! A diferente está marcada em verde."}</strong>
              <div>As outras são {r.same}. A diferente é {r.odd}.</div>
            </div>
            <button className="btn btn-lg btn-block" onClick={next} autoFocus>
              {round + 1 >= ODD_ROUNDS ? "Ver resultado" : "Próxima rodada →"}
            </button>
          </div>
        )}
      </div>
    </ActivityShell>
  );
}
