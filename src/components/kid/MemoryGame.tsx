"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MEMORY_SYMBOLS } from "@/lib/activities";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { saveSession, useElapsed, useSoftSound, type SaveResult } from "./useKid";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  patientId: string;
  level: number;
  pairs: number;
  soundOn: boolean;
}

export function MemoryGame({ patientId, level, pairs, soundOn }: Props) {
  const router = useRouter();
  const [seed, setSeed] = useState(0);
  // O baralho é sorteado só no navegador, para não divergir da renderização do servidor.
  const [deck, setDeck] = useState<{ id: number; symbol: string }[]>([]);
  useEffect(() => {
    const symbols = shuffle(MEMORY_SYMBOLS).slice(0, pairs);
    setDeck(shuffle([...symbols, ...symbols]).map((s, i) => ({ id: i, symbol: s })));
  }, [pairs, seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState<{ result: SaveResult | null; completed: boolean; duration: number } | null>(null);
  const timer = useElapsed(!done);
  const play = useSoftSound(soundOn);
  const found = matched.size / 2;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;
    if (deck[a].symbol === deck[b].symbol) {
      play("ok");
      setMatched((m) => new Set([...m, a, b]));
      setOpen([]);
    } else {
      // Tempo generoso para observar as cartas antes de virarem.
      const t = setTimeout(() => setOpen([]), 1400);
      return () => clearTimeout(t);
    }
  }, [open, deck, play]);

  useEffect(() => {
    if (deck.length && found === pairs && !done) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  function flip(i: number) {
    if (open.length === 2 || open.includes(i) || matched.has(i)) return;
    if (open.length === 1) setMoves((m) => m + 1);
    setOpen((o) => [...o, i]);
  }

  async function finish(completed: boolean) {
    const duration = timer.read();
    // Eficiência: jogadas mínimas (= pares) divididas pelas jogadas feitas.
    const efficiency = moves > 0 ? Math.min(1, pairs / moves) : 0;
    const total = pairs;
    const correct = completed ? Math.round(efficiency * pairs) : found;
    const result = await saveSession({
      patientId,
      activityKey: "memoria",
      level,
      correct,
      wrong: Math.max(0, moves - found),
      total,
      durationSec: duration,
      completed,
      details: { moves, pairs, found, efficiency },
    });
    setDone({ result, completed, duration });
    router.refresh();
  }

  function restart() {
    setSeed((s) => s + 1);
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
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
        message={
          done.completed
            ? `Você encontrou todos os ${pairs} pares em ${moves} jogadas!`
            : `Você encontrou ${found} de ${pairs} pares.`
        }
      />
    );
  }

  return (
    <ActivityShell
      emoji="🧩"
      title="Jogo da Memória"
      level={level}
      step={found}
      totalSteps={pairs}
      stepLabel="Par"
      elapsedSec={timer.sec}
      onStop={() => finish(false)}
    >
      <div className="card stack">
        <p className="center" style={{ fontSize: "1.15rem" }}>
          Toque em duas cartas. Se forem iguais, elas ficam abertas. Jogadas: <strong>{moves}</strong>
        </p>
        <div className="mem-grid" style={{ ["--cols" as string]: pairs === 3 ? 3 : 4 }}>
          {deck.map((c, i) => {
            const isOpen = open.includes(i) || matched.has(i);
            return (
              <button
                key={c.id}
                className={`mem-card ${isOpen ? "open" : ""} ${matched.has(i) ? "matched" : ""}`}
                onClick={() => flip(i)}
                aria-label={isOpen ? c.symbol : "Carta virada"}
              >
                {isOpen ? c.symbol : "❔"}
              </button>
            );
          })}
        </div>
      </div>
    </ActivityShell>
  );
}
