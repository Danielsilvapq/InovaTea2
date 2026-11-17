"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/lib/activities";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

interface Props {
  patientId: string;
  activityKey: string;
  title: string;
  emoji: string;
  level: number;
  questions: QuizQuestion[];
  soundOn: boolean;
}

export function QuizGame({ patientId, activityKey, title, emoji, level, questions, soundOn }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ question: string; chosen: string; correct: boolean; timeMs: number }[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const questionStart = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);

  const q = questions[index];
  const correctCount = answers.filter((a) => a.correct).length;

  function choose(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === q.answer;
    play(ok ? "ok" : "try");
    setAnswers((prev) => [
      ...prev,
      { question: q.prompt, chosen: q.options[i].label, correct: ok, timeMs: Date.now() - questionStart.current },
    ]);
  }

  async function finish(completed: boolean, list = answers) {
    const duration = timer.read();
    const correct = list.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId,
      activityKey,
      level,
      correct,
      wrong: list.length - correct,
      total: completed ? questions.length : list.length,
      durationSec: duration,
      completed,
      details: { answers: list },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (index + 1 >= questions.length) {
      finish(true);
      return;
    }
    setIndex(index + 1);
    setChosen(null);
    questionStart.current = Date.now();
  }

  function restart() {
    setIndex(0);
    setChosen(null);
    setAnswers([]);
    setDone(null);
    timer.reset();
    questionStart.current = Date.now();
  }

  if (done) {
    const total = done.completed ? questions.length : answers.length;
    return (
      <ResultScreen
        patientId={patientId}
        result={done.result}
        correct={correctCount}
        total={total}
        durationSec={done.duration}
        completed={done.completed}
        onRestart={restart}
      />
    );
  }

  const answeredCount = answers.length;
  return (
    <ActivityShell
      emoji={emoji}
      title={title}
      level={level}
      step={answeredCount}
      totalSteps={questions.length}
      stepLabel="Pergunta"
      elapsedSec={timer.sec}
      onStop={() => finish(false)}
    >
      <div className="card">
        <div className="visual" aria-hidden>
          {q.visual}
        </div>
        <h2 className="center" style={{ fontSize: "1.5rem" }}>
          {q.prompt}
        </h2>
        <div className="option-grid" style={{ marginTop: 16 }}>
          {q.options.map((o, i) => {
            const cls =
              chosen === null ? "" : i === q.answer ? "correct" : i === chosen ? "chosen-wrong" : "";
            return (
              <button key={i} className={`option ${cls}`} onClick={() => choose(i)} disabled={chosen !== null}>
                <span className="emoji" aria-hidden>
                  {o.emoji}
                </span>
                {o.label}
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <div className="stack" style={{ marginTop: 20 }}>
            <div className={chosen === q.answer ? "ok-box" : "error-box"} role="status">
              <strong>{chosen === q.answer ? "✅ Isso mesmo!" : "💛 Quase! A resposta é: " + q.options[q.answer].label}</strong>
              <div>{q.hint}</div>
            </div>
            <button className="btn btn-lg btn-block" onClick={next} autoFocus>
              {index + 1 >= questions.length ? "Ver resultado" : "Próxima pergunta →"}
            </button>
          </div>
        )}
      </div>
    </ActivityShell>
  );
}
