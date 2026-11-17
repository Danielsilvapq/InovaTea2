"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNT_ROUNDS } from "@/lib/activities";
import { countRounds, type CountRound } from "@/lib/generators";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number };

/** Figuras em fileiras de 5, para facilitar a contagem. */
function Group({ emoji, n, crossed = 0 }: { emoji: string; n: number; crossed?: number }) {
  return (
    <div className="count-group" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={i >= n - crossed ? "gone" : ""}>{emoji}</span>
      ))}
    </div>
  );
}

/** Vamos Contar: contagem, soma e subtração com apoio visual. */
export function CountGame({ patientId, level, soundOn }: { patientId: string; level: number; soundOn: boolean }) {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  const [rounds, setRounds] = useState<CountRound[]>([]);
  useEffect(() => setRounds(countRounds(level)), [level, seed]);
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const start = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const r = rounds[round];

  function choose(n: number) {
    if (chosen !== null || !r) return;
    setChosen(n);
    const ok = n === r.answer;
    play(ok ? "ok" : "try");
    setAnswers((a) => [...a, { question: r.prompt, chosen: String(n), correct: ok, timeMs: Date.now() - start.current }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "contar", level, correct, wrong: answers.length - correct,
      total: completed ? COUNT_ROUNDS : answers.length, durationSec: duration, completed, details: { answers },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (round + 1 >= COUNT_ROUNDS) return void finish(true);
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
        total={done.completed ? COUNT_ROUNDS : answers.length} durationSec={done.duration} completed={done.completed} onRestart={restart} />
    );
  }

  return (
    <ActivityShell emoji="🔢" title="Vamos Contar" level={level} step={answers.length} totalSteps={COUNT_ROUNDS}
      stepLabel="Conta" elapsedSec={timer.sec} onStop={() => finish(false)}>
      {r && (
        <div className="card stack center">
          <h2 style={{ fontSize: "1.4rem" }}>{r.prompt}</h2>
          {r.kind === "count" && <Group emoji={r.emoji} n={r.a} />}
          {r.kind === "add" && (
            <div className="count-sum">
              <Group emoji={r.emoji} n={r.a} />
              <span className="count-op">+</span>
              <Group emoji={r.emoji} n={r.b} />
            </div>
          )}
          {r.kind === "sub" && (
            <>
              <Group emoji={r.emoji} n={r.a} crossed={r.b} />
              <p className="small muted">As figuras apagadas foram embora.</p>
            </>
          )}
          <div className="option-grid" style={{ maxWidth: 560, width: "100%", margin: "0 auto", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {r.options.map((n) => {
              const cls = chosen === null ? "" : n === r.answer ? "correct" : n === chosen ? "chosen-wrong" : "";
              return (
                <button key={`${round}-${n}`} className={`option ${cls}`} onClick={() => choose(n)} disabled={chosen !== null}>
                  <span className="emoji" style={{ fontWeight: 800 }}>{n}</span>
                </button>
              );
            })}
          </div>
          {chosen !== null && (
            <div className="stack">
              <div className={chosen === r.answer ? "ok-box" : "error-box"} role="status">
                <strong>{chosen === r.answer ? "✅ Isso mesmo!" : `💛 Quase! A resposta é ${r.answer}.`}</strong>
                <div>
                  {r.kind === "count" && `Contando um por um, são ${r.answer}.`}
                  {r.kind === "add" && `${r.a} + ${r.b} = ${r.answer}.`}
                  {r.kind === "sub" && `${r.a} − ${r.b} = ${r.answer}.`}
                </div>
              </div>
              <button className="btn btn-lg btn-block" onClick={next} autoFocus>
                {round + 1 >= COUNT_ROUNDS ? "Ver resultado" : "Próxima conta →"}
              </button>
            </div>
          )}
        </div>
      )}
    </ActivityShell>
  );
}
