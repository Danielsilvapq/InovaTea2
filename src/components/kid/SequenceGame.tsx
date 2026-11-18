"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SEQUENCE_ROUNDS, SEQUENCE_SHAPES } from "@/lib/activities";
import { sequenceConfig } from "@/lib/generators";

const sequenceShapesForLevel = (level: number) => sequenceConfig(level).shapes;
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

function randomSequence(length: number, level: number) {
  const shapes = sequenceShapesForLevel(level);
  return Array.from({ length }, () => shapes[Math.floor(Math.random() * shapes.length)].id);
}
const shapeOf = (id: string) => SEQUENCE_SHAPES.find((s) => s.id === id)!;

interface Props {
  patientId: string;
  level: number;
  length: number;
  soundOn: boolean;
}

/**
 * A sequência é mostrada inteira e parada (sem piscar). Quando a criança
 * diz "Memorizei", as formas são escondidas e ela monta a mesma ordem.
 */
export function SequenceGame({ patientId, level, length, soundOn }: Props) {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  // Sorteio feito só no navegador, para não divergir da renderização do servidor.
  const [rounds, setRounds] = useState<string[][]>([]);
  useEffect(() => {
    setRounds(Array.from({ length: SEQUENCE_ROUNDS }, () => randomSequence(length, level)));
  }, [length, level, seed]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"look" | "build" | "check">("look");
  const [input, setInput] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ question: string; chosen: string; correct: boolean; timeMs: number }[]>([]);
  const [roundStart, setRoundStart] = useState(Date.now());
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);

  const target = rounds[round] ?? [];
  const isCorrect = phase === "check" && input.join() === target.join();

  function tap(id: string) {
    if (phase !== "build" || input.length >= target.length) return;
    const nextInput = [...input, id];
    setInput(nextInput);
    if (nextInput.length === target.length) {
      const ok = nextInput.join() === target.join();
      play(ok ? "ok" : "try");
      setAnswers((a) => [
        ...a,
        {
          question: `Rodada ${round + 1}: ${target.map((t) => shapeOf(t).emoji).join(" ")}`,
          chosen: nextInput.map((t) => shapeOf(t).emoji).join(" "),
          correct: ok,
          timeMs: Date.now() - roundStart,
        },
      ]);
      setPhase("check");
    }
  }

  async function finish(completed: boolean, list = answers) {
    const duration = timer.read();
    const correct = list.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId,
      activityKey: "sequencia",
      level,
      correct,
      wrong: list.length - correct,
      total: completed ? SEQUENCE_ROUNDS : list.length,
      durationSec: duration,
      completed,
      details: { answers: list, length },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function nextRound() {
    if (round + 1 >= SEQUENCE_ROUNDS) {
      finish(true);
      return;
    }
    setRound(round + 1);
    setInput([]);
    setPhase("look");
    setRoundStart(Date.now());
  }

  function restart() {
    setSeed((s) => s + 1);
    setRound(0);
    setInput([]);
    setPhase("look");
    setAnswers([]);
    setDone(null);
    timer.reset();
  }

  if (done) {
    const correct = answers.filter((a) => a.correct).length;
    return (
      <ResultScreen
        patientId={patientId}
        result={done.result}
        correct={correct}
        total={done.completed ? SEQUENCE_ROUNDS : answers.length}
        durationSec={done.duration}
        completed={done.completed}
        onRestart={restart}
      />
    );
  }

  return (
    <ActivityShell
      emoji="🔷"
      title="Siga a Sequência"
      level={level}
      step={answers.length}
      totalSteps={SEQUENCE_ROUNDS}
      stepLabel="Rodada"
      elapsedSec={timer.sec}
      onStop={() => finish(false)}
    >
      <div className="card stack center">
        {phase === "look" && (
          <>
            <h2>Olhe com calma e memorize a ordem:</h2>
            <div className="seq-display">
              {target.map((id, i) => (
                <div key={i} className="seq-slot filled" aria-label={shapeOf(id).label}>
                  {shapeOf(id).emoji}
                </div>
              ))}
            </div>
            <button className="btn btn-lg" onClick={() => setPhase("build")}>
              ✋ Memorizei!
            </button>
          </>
        )}

        {phase !== "look" && (
          <>
            <h2>{phase === "build" ? "Agora monte a mesma ordem:" : isCorrect ? "✅ Muito bem!" : "💛 Quase! Veja a ordem certa:"}</h2>
            <div className="seq-display">
              {target.map((_, i) => (
                <div key={i} className={`seq-slot ${input[i] ? "filled" : ""}`}>
                  {input[i] ? shapeOf(input[i]).emoji : ""}
                </div>
              ))}
            </div>
            {phase === "check" && !isCorrect && (
              <div className="seq-display" aria-label="Ordem certa">
                {target.map((id, i) => (
                  <div key={i} className="seq-slot filled" style={{ borderColor: "var(--ok)" }}>
                    {shapeOf(id).emoji}
                  </div>
                ))}
              </div>
            )}
            {phase === "build" && (
              <>
                <div className="option-grid" style={{ maxWidth: 560, margin: "0 auto", gridTemplateColumns: `repeat(${sequenceShapesForLevel(level).length > 4 ? 3 : 2}, minmax(0, 1fr))` }}>
                  {sequenceShapesForLevel(level).map((s) => (
                    <button key={s.id} className="option" onClick={() => tap(s.id)}>
                      <span className="emoji">{s.emoji}</span>
                      <span className="small">{s.label}</span>
                    </button>
                  ))}
                </div>
                {input.length > 0 && (
                  <button className="btn btn-ghost" onClick={() => setInput(input.slice(0, -1))}>
                    ↩ Desfazer a última
                  </button>
                )}
              </>
            )}
            {phase === "check" && (
              <button className="btn btn-lg" onClick={nextRound} autoFocus>
                {round + 1 >= SEQUENCE_ROUNDS ? "Ver resultado" : "Próxima rodada →"}
              </button>
            )}
          </>
        )}
      </div>
    </ActivityShell>
  );
}
