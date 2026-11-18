"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/lib/activities";
import { reduceOptions } from "@/lib/accessibility";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { SpeakButton, useAttempt, useKidSettings, useSpeech } from "./KidSettings";
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
type Answer = { question: string; chosen: string; correct: boolean; timeMs: number; attempts: number };

export function QuizGame({ patientId, activityKey, title, emoji, level, questions: original, soundOn }: Props) {
  const router = useRouter();
  const { answerSupport } = useKidSettings();
  // Com apoio, cada pergunta mostra só 2 opções.
  const questions = useMemo(() => original.map((q) => ({ ...q, ...reduceOptions(q.options, q.answer, answerSupport) })), [original, answerSupport]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const questionStart = useRef(Date.now());
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const { speak, auto } = useSpeech();
  const att = useAttempt(index);
  const q = questions[index];
  const spoken = `${q.prompt} ${q.options.map((o) => o.label).join(". ")}.`;

  useEffect(() => {
    if (!done) auto(spoken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done]);

  function choose(i: number) {
    const r = att.attempt(i, q.answer);
    if (!r) return;
    play(i === q.answer ? "ok" : "try");
    if (!r.done) {
      speak("Quase! Tente de novo.");
      return;
    }
    auto(i === q.answer ? `Isso mesmo! ${q.hint}` : `A resposta é ${q.options[q.answer].label}. ${q.hint}`);
    setAnswers((prev) => [...prev, { question: q.prompt, chosen: q.options[i].label, correct: r.firstTry, timeMs: Date.now() - questionStart.current, attempts: r.attempts }]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    const correct = answers.filter((a) => a.correct).length;
    const result = await saveSession({
      patientId, activityKey, level, correct, wrong: answers.length - correct,
      total: completed ? questions.length : answers.length, durationSec: duration, completed,
      details: { answers, answerSupport },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function next() {
    if (index + 1 >= questions.length) return void finish(true);
    setIndex(index + 1);
    questionStart.current = Date.now();
  }

  function restart() {
    setIndex(0);
    setAnswers([]);
    setDone(null);
    timer.reset();
    questionStart.current = Date.now();
  }

  if (done) {
    return (
      <ResultScreen patientId={patientId} result={done.result} correct={answers.filter((a) => a.correct).length}
        total={done.completed ? questions.length : answers.length} durationSec={done.duration} completed={done.completed} onRestart={restart} />
    );
  }

  const solved = att.solved !== null;
  const right = att.solved === q.answer;
  return (
    <ActivityShell emoji={emoji} title={title} level={level} step={answers.length} totalSteps={questions.length}
      stepLabel="Pergunta" elapsedSec={timer.sec} onStop={() => finish(false)}>
      <div className="card">
        <div className="visual" aria-hidden>{q.visual}</div>
        <div className="prompt-row">
          <h2 className="center" style={{ fontSize: "1.5rem", margin: 0 }}>{q.prompt}</h2>
          <SpeakButton text={spoken} />
        </div>
        <div className="option-grid" style={{ marginTop: 16 }}>
          {q.options.map((o, i) => (
            <button key={`${index}-${i}`} className={`option ${att.cls(i, q.answer)}`} onClick={() => choose(i)} disabled={att.disabled(i)}>
              <span className="emoji" aria-hidden>{o.emoji}</span>
              {o.label}
            </button>
          ))}
        </div>
        {!solved && att.tried.length > 0 && (
          <div className="error-box" role="status" style={{ marginTop: 16 }}>
            <strong>💛 Quase! Tente de novo.</strong>
          </div>
        )}
        {solved && (
          <div className="stack" style={{ marginTop: 20 }}>
            <div className={right ? "ok-box" : "error-box"} role="status">
              <strong>
                {right ? (att.firstTry ? "✅ Isso mesmo!" : "✅ Agora sim! Você encontrou.") : "💛 Quase! A resposta é: " + q.options[q.answer].label}
              </strong>
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
