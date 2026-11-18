"use client";

import { useEffect, useState } from "react";
import { breathingConfig } from "@/lib/generators";
import { useRouter } from "next/navigation";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { useSpeech } from "./KidSettings";
import { saveSession, useElapsed, type SaveResult } from "./useKid";

export function BreathingActivity({ patientId, reduceMotion, level }: { patientId: string; reduceMotion: boolean; level: number }) {
  const router = useRouter();
  const cfg = breathingConfig(level);
  const CYCLES = cfg.cycles;
  const PHASES = [
    { key: "in", label: "Puxe o ar pelo nariz", seconds: cfg.inhale, scale: 1.35 },
    { key: "hold", label: "Segure um pouquinho", seconds: cfg.hold, scale: 1.35 },
    { key: "out", label: "Solte o ar pela boca", seconds: cfg.exhale, scale: 1 },
  ] as const;
  const [started, setStarted] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState<number>(PHASES[0].seconds);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const timer = useElapsed(!done);
  const { auto } = useSpeech();
  const phase = PHASES[phaseIdx];

  useEffect(() => {
    if (!started || done) return;
    const t = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
        return;
      }
      const nextPhase = (phaseIdx + 1) % PHASES.length;
      if (nextPhase === 0) {
        const nextCycle = cycle + 1;
        setCycle(nextCycle);
        if (nextCycle >= CYCLES) {
          finish(true, nextCycle);
          return;
        }
      }
      setPhaseIdx(nextPhase);
      setCount(PHASES[nextPhase].seconds);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, count, phaseIdx, cycle, done]);

  useEffect(() => {
    if (started && !done) auto(PHASES[phaseIdx].label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, phaseIdx, cycle]);

  async function finish(completed: boolean, cycles = cycle) {
    const duration = timer.read();
    const result = await saveSession({
      patientId,
      activityKey: "respiracao",
      level,
      correct: 0,
      wrong: 0,
      total: 0,
      durationSec: duration,
      completed,
      details: { cycles, target: CYCLES },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function restart() {
    setStarted(false);
    setCycle(0);
    setPhaseIdx(0);
    setCount(PHASES[0].seconds);
    setDone(null);
    timer.reset();
  }

  if (done) {
    return (
      <ResultScreen
        patientId={patientId}
        result={done.result}
        durationSec={done.duration}
        completed={done.completed}
        onRestart={restart}
        message={done.completed ? `Você respirou com calma ${CYCLES} vezes. Seu corpo agradece!` : "Tudo bem parar. Respirar um pouco já ajuda."}
      />
    );
  }

  const scale = started ? phase.scale : 1;
  return (
    <ActivityShell
      emoji="🎈"
      title="Respirar com o Balão"
      level={level}
      step={cycle}
      totalSteps={CYCLES}
      stepLabel="Respiração"
      elapsedSec={timer.sec}
      onStop={() => finish(false)}
    >
      <div className="card center stack">
        <div
          className="balloon"
          style={{
            transform: reduceMotion ? undefined : `scale(${scale})`,
            transitionDuration: `${phase.seconds}s`,
            background: started && phase.key !== "out" ? "var(--lavender-soft)" : "var(--sky-soft)",
          }}
          aria-hidden
        >
          🎈
        </div>
        {started ? (
          <>
            <h2 style={{ fontSize: "1.6rem" }} aria-live="polite">
              {phase.label}
            </h2>
            <div style={{ fontSize: "3rem", fontWeight: 800 }}>{count}</div>
          </>
        ) : (
          <>
            <h2>Vamos respirar devagar juntos.</h2>
            <p>Vamos fazer {CYCLES} respirações. Você pode parar quando quiser.</p>
            <button className="btn btn-lg btn-sage" onClick={() => setStarted(true)}>
              Começar
            </button>
          </>
        )}
      </div>
    </ActivityShell>
  );
}
