"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sortRound } from "@/lib/generators";
import type { SortSet } from "@/lib/activities";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number };

/**
 * Separar e Organizar: uma figura por vez, grande, e a criança toca no grupo
 * certo. Sem arrastar, para ser fácil no celular e para quem tem pouca
 * coordenação motora fina.
 */
export function SortGame({ patientId, level, soundOn }: { patientId: string; level: number; soundOn: boolean }) {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  const [set, setSet] = useState<SortSet | null>(null);
  useEffect(() => setSet(sortRound(level)), [level, seed]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [placed, setPlaced] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const start = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const total = set?.items.length ?? 0;
  const item = set?.items[index];

  useEffect(() => {
    if (set) setPlaced(set.categories.map(() => []));
  }, [set]);

  function choose(cat: number) {
    if (chosen !== null || !item || !set) return;
    setChosen(cat);
    const ok = cat === item.category;
    play(ok ? "ok" : "try");
    setPlaced((p) => p.map((list, i) => (i === item.category ? [...list, item.emoji] : list)));
    setAnswers((a) => [...a, { question: `${item.emoji} ${item.label}`, chosen: set.categories[cat].label, correct: ok, timeMs: Date.now() - start.current }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "classificar", level, correct, wrong: answers.length - correct,
      total: completed ? total : answers.length, durationSec: duration, completed, details: { answers },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (index + 1 >= total) return void finish(true);
    setIndex(index + 1);
    setChosen(null);
    start.current = Date.now();
  }

  function restart() {
    setSeed((s) => s + 1);
    setIndex(0);
    setChosen(null);
    setAnswers([]);
    setDone(null);
    timer.reset();
  }

  if (done) {
    return (
      <ResultScreen patientId={patientId} result={done.result} correct={answers.filter((a) => a.correct).length}
        total={done.completed ? total : answers.length} durationSec={done.duration} completed={done.completed} onRestart={restart} />
    );
  }

  return (
    <ActivityShell emoji="🧺" title="Separar e Organizar" level={level} step={answers.length} totalSteps={total}
      stepLabel="Figura" elapsedSec={timer.sec} onStop={() => finish(false)}>
      {set && item && (
        <div className="card stack center">
          <h2>{set.title}</h2>
          <div className="visual" aria-hidden>{item.emoji}</div>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>{item.label}</p>
          <div className="sort-bins" style={{ ["--cols" as string]: set.categories.length }}>
            {set.categories.map((c, i) => {
              const cls = chosen === null ? "" : i === item.category ? "correct" : i === chosen ? "chosen-wrong" : "";
              return (
                <button key={i} className={`option sort-bin ${cls}`} onClick={() => choose(i)} disabled={chosen !== null}>
                  <span className="emoji">{c.emoji}</span>
                  {c.label}
                  <span className="sort-placed" aria-label={`${placed[i]?.length ?? 0} figuras neste grupo`}>
                    {placed[i]?.join(" ")}
                  </span>
                </button>
              );
            })}
          </div>
          {chosen !== null && (
            <div className="stack">
              <div className={chosen === item.category ? "ok-box" : "error-box"} role="status">
                <strong>
                  {chosen === item.category ? "✅ Isso mesmo!" : `💛 Quase! ${item.label} fica em ${set.categories[item.category].label}.`}
                </strong>
              </div>
              <button className="btn btn-lg btn-block" onClick={next} autoFocus>
                {index + 1 >= total ? "Ver resultado" : "Próxima figura →"}
              </button>
            </div>
          )}
        </div>
      )}
    </ActivityShell>
  );
}
