"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sortRound } from "@/lib/generators";
import type { SortSet } from "@/lib/activities";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { SpeakButton, useAttempt, useKidSettings, useSpeech } from "./KidSettings";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

type Answer = { question: string; chosen: string; correct: boolean; timeMs: number; attempts: number };

/**
 * Separar e Organizar: uma figura por vez, grande, e a criança toca no grupo
 * certo. Sem arrastar, para ser fácil no celular e para quem tem pouca
 * coordenação motora fina.
 */
export function SortGame({ patientId, level, soundOn }: { patientId: string; level: number; soundOn: boolean }) {
  const router = useRouter();
  const { answerSupport } = useKidSettings();
  const [seed, setSeed] = useState(0);
  const [set, setSet] = useState<SortSet | null>(null);
  useEffect(() => setSet(sortRound(level)), [level, seed]);
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<string[][]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const start = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const { speak, auto } = useSpeech();
  const att = useAttempt(`${seed}-${index}`);
  const total = set?.items.length ?? 0;
  const item = set?.items[index];
  const spoken = set && item ? `${item.label}. Onde fica? ${set.categories.map((c) => c.label).join(" ou ")}?` : "";

  useEffect(() => {
    if (set) setPlaced(set.categories.map(() => []));
  }, [set]);
  useEffect(() => {
    if (spoken && !done) auto(spoken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spoken, done]);

  function choose(cat: number) {
    if (!item || !set) return;
    const res = att.attempt(cat, item.category);
    if (!res) return;
    play(cat === item.category ? "ok" : "try");
    if (!res.done) return void speak("Quase! Tente outro grupo.");
    auto(cat === item.category ? "Isso mesmo!" : `${item.label} fica em ${set.categories[item.category].label}.`);
    setPlaced((p) => p.map((list, i) => (i === item.category ? [...list, item.emoji] : list)));
    setAnswers((a) => [...a, { question: `${item.emoji} ${item.label}`, chosen: set.categories[cat].label, correct: res.firstTry, timeMs: Date.now() - start.current, attempts: res.attempts }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey: "classificar", level, correct, wrong: answers.length - correct,
      total: completed ? total : answers.length, durationSec: duration, completed, details: { answers, answerSupport },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (index + 1 >= total) return void finish(true);
    setIndex(index + 1);
    start.current = Date.now();
  }

  function restart() {
    setSeed((s) => s + 1);
    setIndex(0);
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

  const solved = att.solved !== null;
  const right = item && att.solved === item.category;
  return (
    <ActivityShell emoji="🧺" title="Separar e Organizar" level={level} step={answers.length} totalSteps={total}
      stepLabel="Figura" elapsedSec={timer.sec} onStop={() => finish(false)}>
      {set && item && (
        <div className="card stack center">
          <h2>{set.title}</h2>
          <div className="visual" aria-hidden>{item.emoji}</div>
          <div className="prompt-row">
            <p style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>{item.label}</p>
            <SpeakButton text={spoken} />
          </div>
          <div className="sort-bins" style={{ ["--cols" as string]: set.categories.length }}>
            {set.categories.map((c, i) => (
              <button key={i} className={`option sort-bin ${att.cls(i, item.category)}`} onClick={() => choose(i)} disabled={att.disabled(i)}>
                <span className="emoji">{c.emoji}</span>
                {c.label}
                <span className="sort-placed" aria-label={`${placed[i]?.length ?? 0} figuras neste grupo`}>{placed[i]?.join(" ")}</span>
              </button>
            ))}
          </div>
          {!solved && att.tried.length > 0 && <div className="error-box" role="status"><strong>💛 Quase! Tente outro grupo.</strong></div>}
          {solved && (
            <div className="stack">
              <div className={right ? "ok-box" : "error-box"} role="status">
                <strong>
                  {right ? (att.firstTry ? "✅ Isso mesmo!" : "✅ Agora sim!") : `💛 Quase! ${item.label} fica em ${set.categories[item.category].label}.`}
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
