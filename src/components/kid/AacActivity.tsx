"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { AacBoard } from "./AacBoard";
import { saveSession, useElapsed, type SaveResult } from "./useKid";

const GOAL = 5;

/** Minha Voz: uso livre da prancha. As frases ficam registradas para os adultos. */
export function AacActivity({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [phrases, setPhrases] = useState<{ text: string; at: string }[]>([]);
  const [done, setDone] = useState<{ result: SaveResult | null; duration: number } | null>(null);
  const timer = useElapsed(!done);

  async function finish() {
    const duration = timer.read();
    const result = await saveSession({
      patientId, activityKey: "minhavoz", level: 1, correct: phrases.length, wrong: 0, total: phrases.length,
      durationSec: duration, completed: phrases.length > 0, details: { phrases },
    });
    setDone({ result, duration });
    router.refresh();
  }

  if (done) {
    return (
      <ResultScreen patientId={patientId} result={done.result} durationSec={done.duration} completed={phrases.length > 0}
        onRestart={() => { setPhrases([]); setDone(null); timer.reset(); }}
        message={phrases.length ? `Você falou ${phrases.length} frase(s). Muito bem!` : "Tudo bem. Volte quando quiser falar."} />
    );
  }

  return (
    <ActivityShell emoji="🗣️" title="Minha Voz" step={Math.min(phrases.length, GOAL)} totalSteps={GOAL} stepLabel="Frase"
      elapsedSec={timer.sec} onStop={finish}>
      <div className="card stack">
        <AacBoard onSay={(text) => setPhrases((p) => [...p, { text, at: new Date().toISOString() }])} />
        {phrases.length > 0 && (
          <div className="card-soft">
            <strong>Frases faladas agora:</strong>
            <ul style={{ margin: "6px 0 0" }}>
              {phrases.slice(-5).map((p, i) => <li key={i}>{p.text}</li>)}
            </ul>
          </div>
        )}
        <button className="btn btn-sage" onClick={finish}>✅ Terminar</button>
      </div>
    </ActivityShell>
  );
}
