"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { oddRounds, type OddRound } from "@/lib/generators";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { SpeakButton, useAttempt, useKidSettings, useSpeech } from "./KidSettings";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number; attempts: number };
const PROMPT = "Toque na figura que é diferente das outras.";

/** Encontre o Diferente: uma figura na grade não é igual às outras. */
export function OddGame({ patientId, level, soundOn }: { patientId: string; level: number; soundOn: boolean }) {
  const router = useRouter();
  const { answerSupport } = useKidSettings();
  const [seed, setSeed] = useState(0);
  const [rounds, setRounds] = useState<OddRound[]>([]);
  useEffect(() => setRounds(oddRounds(level)), [level, seed]);
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const start = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const { speak, auto } = useSpeech();
  const att = useAttempt(`${seed}-${round}`);
  const r = rounds[round];
  const TOTAL = rounds.length || 5;

  useEffect(() => {
    if (r && !done && round === 0) auto(PROMPT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, done]);

  function choose(i: number) {
    if (!r) return;
    const res = att.attempt(i, r.oddIndex);
    if (!res) return;
    play(i === r.oddIndex ? "ok" : "try");
    if (!res.done) return void speak("Essa é igual às outras. Tente de novo.");
    auto(i === r.oddIndex ? "Achou!" : "A diferente está marcada em verde.");
    setAnswers((a) => [...a, { question: `Rodada ${round + 1}: ${r.same} × ${r.odd}`, chosen: r.cells[i], correct: res.firstTry, timeMs: Date.now() - start.current, attempts: res.attempts }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "diferente", level, correct, wrong: answers.length - correct,
      total: completed ? TOTAL : answers.length, durationSec: duration, completed, details: { answers, answerSupport },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (round + 1 >= TOTAL) return void finish(true);
    setRound(round + 1);
    start.current = Date.now();
  }

  function restart() {
    setSeed((s) => s + 1);
    setRound(0);
    setAnswers([]);
    setDone(null);
    timer.reset();
  }

  if (done) {
    return (
      <ResultScreen patientId={patientId} result={done.result} correct={answers.filter((a) => a.correct).length}
        total={done.completed ? TOTAL : answers.length} durationSec={done.duration} completed={done.completed} onRestart={restart} />
    );
  }

  const solved = att.solved !== null;
  const right = r && att.solved === r.oddIndex;
  return (
    <ActivityShell emoji="🔍" title="Encontre o Diferente" level={level} step={answers.length} totalSteps={TOTAL}
      stepLabel="Rodada" elapsedSec={timer.sec} onStop={() => finish(false)}>
      <div className="card stack center">
        <div className="prompt-row">
          <h2 style={{ margin: 0 }}>{PROMPT}</h2>
          <SpeakButton text={PROMPT} />
        </div>
        {r && (
          <div className="odd-grid" style={{ ["--cols" as string]: r.cols }}>
            {r.cells.map((c, i) => (
              <button key={`${round}-${i}`} className={`odd-cell ${att.cls(i, r.oddIndex)}`} onClick={() => choose(i)} disabled={att.disabled(i)} aria-label={`Figura ${i + 1}: ${c}`}>
                {c}
              </button>
            ))}
          </div>
        )}
        {!solved && att.tried.length > 0 && <div className="error-box" role="status"><strong>💛 Essa é igual às outras. Tente de novo.</strong></div>}
        {solved && r && (
          <div className="stack">
            <div className={right ? "ok-box" : "error-box"} role="status">
              <strong>{right ? (att.firstTry ? "✅ Achou!" : "✅ Agora sim! Você achou.") : "💛 Quase! A diferente está marcada em verde."}</strong>
              <div>As outras são {r.same}. A diferente é {r.odd}.</div>
            </div>
            <button className="btn btn-lg btn-block" onClick={next} autoFocus>
              {round + 1 >= TOTAL ? "Ver resultado" : "Próxima rodada →"}
            </button>
          </div>
        )}
      </div>
    </ActivityShell>
  );
}
