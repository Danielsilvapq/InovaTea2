"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { orderRounds, type OrderRound } from "@/lib/generators";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { SpeakButton, useSpeech } from "./KidSettings";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number };

/** Passo a Passo: tocar nos passos de uma tarefa na ordem certa. */
export function OrderGame({ patientId, level, soundOn }: { patientId: string; level: number; soundOn: boolean }) {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  const [rounds, setRounds] = useState<OrderRound[]>([]);
  useEffect(() => setRounds(orderRounds(level)), [level, seed]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const start = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const r = rounds[round];
  const totalRounds = rounds.length || 1;
  const isCorrect = checked && picked.every((v, i) => v === i);
  const { auto } = useSpeech();
  const spoken = r ? `${r.routine.title}. Toque nos passos na ordem em que fazemos: ${r.shuffled.map((i) => r.routine.steps[i].label).join(". ")}.` : "";
  useEffect(() => {
    if (spoken && !done) auto(spoken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spoken, done]);

  function pick(stepIndex: number) {
    if (!r || checked || picked.includes(stepIndex)) return;
    const next = [...picked, stepIndex];
    setPicked(next);
    auto(r.routine.steps[stepIndex].label);
    if (next.length === r.routine.steps.length) {
      const ok = next.every((v, i) => v === i);
      play(ok ? "ok" : "try");
      setChecked(true);
      setAnswers((a) => [
        ...a,
        {
          question: `${r.routine.emoji} ${r.routine.title}`,
          chosen: next.map((i) => r.routine.steps[i].emoji).join(" → "),
          correct: ok,
          timeMs: Date.now() - start.current,
        },
      ]);
    }
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "passos", level, correct, wrong: answers.length - correct,
      total: completed ? totalRounds : answers.length, durationSec: duration, completed, details: { answers },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (round + 1 >= totalRounds) return void finish(true);
    setRound(round + 1);
    setPicked([]);
    setChecked(false);
    start.current = Date.now();
  }

  function restart() {
    setSeed((s) => s + 1);
    setRound(0);
    setPicked([]);
    setChecked(false);
    setAnswers([]);
    setDone(null);
    timer.reset();
  }

  if (done) {
    return (
      <ResultScreen patientId={patientId} result={done.result} correct={answers.filter((a) => a.correct).length}
        total={done.completed ? totalRounds : answers.length} durationSec={done.duration} completed={done.completed} onRestart={restart} />
    );
  }

  return (
    <ActivityShell emoji="🪜" title="Passo a Passo" level={level} step={answers.length} totalSteps={totalRounds}
      stepLabel="Tarefa" elapsedSec={timer.sec} onStop={() => finish(false)}>
      {r && (
        <div className="card stack">
          <div className="prompt-row">
            <h2 className="center" style={{ margin: 0 }}>
              {r.routine.emoji} {r.routine.title}
            </h2>
            <SpeakButton text={spoken} />
          </div>
          <p className="center">
            {checked ? (isCorrect ? "✅ Ordem certa!" : "💛 Quase! Veja a ordem certa abaixo.") : "Toque nos passos na ordem em que fazemos."}
          </p>
          <ol className="order-slots">
            {r.routine.steps.map((_, i) => {
              const s = picked[i] !== undefined ? r.routine.steps[picked[i]] : null;
              const wrong = checked && picked[i] !== i;
              return (
                <li key={i} className={`order-slot ${s ? "filled" : ""} ${checked ? (wrong ? "chosen-wrong" : "correct") : ""}`}>
                  <span className="order-num">{i + 1}</span>
                  {s ? (
                    <span>
                      {s.emoji} {s.label}
                    </span>
                  ) : (
                    <span className="muted">…</span>
                  )}
                </li>
              );
            })}
          </ol>
          {checked && !isCorrect && (
            <div className="ok-box">
              <strong>Ordem certa:</strong>{" "}
              {r.routine.steps.map((s, i) => `${i + 1}. ${s.emoji} ${s.label}`).join("  ·  ")}
            </div>
          )}
          {!checked && (
            <>
              <div className="option-grid">
                {r.shuffled.map((stepIndex) => {
                  const s = r.routine.steps[stepIndex];
                  const used = picked.includes(stepIndex);
                  return (
                    <button key={`${round}-${stepIndex}`} className="option" onClick={() => pick(stepIndex)} disabled={used} style={used ? { opacity: 0.35 } : undefined}>
                      <span className="emoji">{s.emoji}</span>
                      {s.label}
                    </button>
                  );
                })}
              </div>
              {picked.length > 0 && (
                <div className="center">
                  <button className="btn btn-ghost" onClick={() => setPicked(picked.slice(0, -1))}>
                    ↩ Desfazer o último
                  </button>
                </div>
              )}
            </>
          )}
          {checked && (
            <button className="btn btn-lg btn-block" onClick={next} autoFocus>
              {round + 1 >= totalRounds ? "Ver resultado" : "Próxima tarefa →"}
            </button>
          )}
        </div>
      )}
    </ActivityShell>
  );
}
