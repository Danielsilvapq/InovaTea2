"use client";

import { useState } from "react";
import { AAC_BOARDS, AAC_STARTERS, aacSentence, type AacCard } from "@/lib/accessibility";
import { useSpeech } from "./KidSettings";

/**
 * Prancha de comunicação alternativa (CAA): a criança toca nas figuras,
 * monta a frase e o aparelho fala por ela. Cada figura é falada ao tocar.
 */
export function AacBoard({ onSay, sayLabel = "🔊 Falar" }: { onSay: (sentence: string) => void; sayLabel?: string }) {
  const { speak } = useSpeech();
  const [parts, setParts] = useState<AacCard[]>([]);
  const [board, setBoard] = useState(AAC_BOARDS[0].id);
  const current = AAC_BOARDS.find((b) => b.id === board) ?? AAC_BOARDS[0];
  const sentence = aacSentence(parts);

  function add(card: AacCard) {
    speak(card.label);
    setParts((p) => [...p, card].slice(-6));
  }
  function say() {
    if (!sentence) return;
    speak(sentence);
    onSay(sentence);
    setParts([]);
  }

  return (
    <div className="stack">
      <div className="aac-strip" aria-live="polite" aria-label="Frase montada">
        {parts.length === 0 ? (
          <span className="muted">Toque nas figuras para montar a frase.</span>
        ) : (
          parts.map((p, i) => (
            <span key={i} className="aac-chip">
              <span aria-hidden>{p.emoji}</span>
              {p.label}
            </span>
          ))
        )}
      </div>
      <div className="row">
        <button className="btn btn-lg btn-sage" onClick={say} disabled={!sentence}>{sayLabel}</button>
        <button className="btn btn-secondary" onClick={() => setParts((p) => p.slice(0, -1))} disabled={!parts.length}>⌫ Apagar a última</button>
        <button className="btn btn-ghost" onClick={() => setParts([])} disabled={!parts.length}>Limpar</button>
      </div>
      <div className="aac-grid">
        {AAC_STARTERS.map((c) => (
          <button key={c.label} className="aac-card starter" onClick={() => add(c)}>
            <span className="emoji" aria-hidden>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
      <div className="aac-tabs" role="tablist" aria-label="Grupos de figuras">
        {AAC_BOARDS.map((b) => (
          <button key={b.id} role="tab" aria-selected={b.id === board} className={`btn ${b.id === board ? "" : "btn-secondary"}`} onClick={() => setBoard(b.id)}>
            {b.emoji} {b.title}
          </button>
        ))}
      </div>
      <div className="aac-grid" role="tabpanel">
        {current.cards.map((c) => (
          <button key={c.label} className="aac-card" onClick={() => add(c)}>
            <span className="emoji" aria-hidden>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
