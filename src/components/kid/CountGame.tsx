"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { countRounds, type CountRound } from "@/lib/generators";
import { reduceOptions } from "@/lib/accessibility";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { SpeakButton, useAttempt, useKidSettings, useSpeech } from "./KidSettings";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number; attempts: number };

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
  const { answerSupport } = useKidSettings();
  const [seed, setSeed] = useState(0);
  const [rounds, setRounds] = useState<CountRound[]>([]);
  useEffect(() => {
    setRounds(countRounds(level).map((r) => {
      const red = reduceOptions(r.options, r.options.indexOf(r.answer), answerSupport);
      return { ...r, options: red.options };
    }));
  }, [level, seed, answerSupport]);
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
  const correctIdx = r ? r.options.indexOf(r.answer) : -1;

  useEffect(() => {
    if (r && !done) auto(`${r.spoken} ${r.options.join(", ")}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, done]);

  function choose(i: number) {
    if (!r) return;
    const res = att.attempt(i, correctIdx);
    if (!res) return;
    play(i === correctIdx ? "ok" : "try");
    if (!res.done) return void speak("Quase! Conte de novo com calma.");
    auto(i === correctIdx ? `Isso mesmo! ${r.answer}.` : `A resposta é ${r.answer}.`);
    setAnswers((a) => [...a, { question: r.prompt, chosen: String(r.options[i]), correct: res.firstTry, timeMs: Date.now() - start.current, attempts: res.attempts }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "contar", level, correct, wrong: answers.length - correct,
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
  const right = att.solved === correctIdx;
  return (
    <ActivityShell emoji="🔢" title="Vamos Contar" level={level} step={answers.length} totalSteps={TOTAL}
      stepLabel="Conta" elapsedSec={timer.sec} onStop={() => finish(false)}>
      {r && (
        <div className="card stack center">
          <div className="prompt-row">
            <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{r.prompt}</h2>
            <SpeakButton text={`${r.spoken} ${r.options.join(", ")}.`} />
          </div>
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
          <div className="option-grid" style={{ maxWidth: 560, width: "100%", margin: "0 auto", gridTemplateColumns: `repeat(${r.options.length}, minmax(0, 1fr))` }}>
            {r.options.map((n, i) => (
              <button key={`${round}-${n}`} className={`option ${att.cls(i, correctIdx)}`} onClick={() => choose(i)} disabled={att.disabled(i)}>
                <span className="emoji" style={{ fontWeight: 800 }}>{n}</span>
              </button>
            ))}
          </div>
          {!solved && att.tried.length > 0 && <div className="error-box" role="status"><strong>💛 Quase! Conte de novo com calma.</strong></div>}
          {solved && (
            <div className="stack">
              <div className={right ? "ok-box" : "error-box"} role="status">
                <strong>{right ? (att.firstTry ? "✅ Isso mesmo!" : "✅ Agora sim!") : `💛 Quase! A resposta é ${r.answer}.`}</strong>
                <div>
                  {r.kind === "count" && `Contando um por um, são ${r.answer}.`}
                  {r.kind === "add" && `${r.a} + ${r.b} = ${r.answer}.`}
                  {r.kind === "sub" && `${r.a} − ${r.b} = ${r.answer}.`}
                </div>
              </div>
              <button className="btn btn-lg btn-block" onClick={next} autoFocus>
                {round + 1 >= TOTAL ? "Ver resultado" : "Próxima conta →"}
              </button>
            </div>
          )}
        </div>
      )}
    </ActivityShell>
  );
}
