"use client";

import { useMemo, useState } from "react";
import {
  AAC_CATEGORIES, AAC_STARTERS, AAC_URGENT, cardColor, composeSentence, customToCard,
  type AacCard, type AacItemLike,
} from "@/lib/aac";
import { readVoicePrefs, usePortugueseVoices, useSpeech, writeVoicePrefs, type VoicePrefs } from "./KidSettings";

interface Props {
  onSay: (sentence: string) => void;
  sayLabel?: string;
  customItems?: AacItemLike[];
  recent?: string[];
}

/**
 * Prancha de comunicação alternativa (CAA) completa:
 * barra de urgência, frases rápidas, começos de frase, 13 grupos de figuras
 * com cores por tipo de palavra, figuras personalizadas e frases recentes.
 * O aparelho fala a frase montada com concordância em português.
 */
export function AacBoard({ onSay, sayLabel = "🔊 Falar", customItems = [], recent = [] }: Props) {
  const { speak } = useSpeech();
  const voices = usePortugueseVoices();
  const [parts, setParts] = useState<AacCard[]>([]);
  const custom = useMemo(() => customItems.map(customToCard), [customItems]);
  const categories = useMemo(
    () => (custom.length ? [{ id: "minhas", title: "Minhas", emoji: "⭐", color: "custom" as const, cards: custom }, ...AAC_CATEGORIES] : AAC_CATEGORIES),
    [custom],
  );
  const [tab, setTab] = useState(categories[0].id);
  const [lastSaid, setLastSaid] = useState<string | null>(null);
  const [localRecent, setLocalRecent] = useState<string[]>([]);
  const [showVoice, setShowVoice] = useState(false);
  const [prefs, setPrefs] = useState<VoicePrefs>(() => (typeof window === "undefined" ? { rate: 0.9, voiceURI: "", speakOnTap: true } : readVoicePrefs()));
  const current = categories.find((c) => c.id === tab) ?? categories[0];
  const sentence = composeSentence(parts);
  const recentList = [...new Set([...localRecent, ...recent])].slice(0, 8);

  function updatePrefs(p: Partial<VoicePrefs>) {
    const next = { ...prefs, ...p };
    setPrefs(next);
    writeVoicePrefs(next);
  }
  function sayNow(text: string) {
    speak(text);
    onSay(text);
    setLastSaid(text);
    setLocalRecent((r) => [text, ...r.filter((x) => x !== text)].slice(0, 8));
  }
  function tap(card: AacCard) {
    if (card.kind === "phrase" && parts.length === 0) return sayNow(card.label);
    if (prefs.speakOnTap) speak(card.label);
    setParts((p) => (card.kind === "starter" ? [card, ...p.filter((x) => x.kind !== "starter")] : [...p, card]).slice(0, 8));
  }
  function say() {
    if (!sentence) return;
    sayNow(sentence);
    setParts([]);
  }

  const renderCard = (card: AacCard) => (
    <button key={card.id} className={`aac-card ${cardColor(card)}`} onClick={() => tap(card)}>
      <span className="emoji" aria-hidden>{card.emoji}</span>
      <span>{card.label}</span>
    </button>
  );

  return (
    <div className="stack aac">
      <div className="aac-urgent" role="group" aria-label="Urgente: fala na hora">
        {AAC_URGENT.map((c) => (
          <button key={c.id} className="aac-urgent-btn" onClick={() => sayNow(c.label)}>
            <span aria-hidden>{c.emoji}</span> {c.label.replace(/[.!]$/, "")}
          </button>
        ))}
      </div>

      <div className="aac-strip-row">
        <button className="aac-strip" onClick={() => sentence && speak(sentence)} aria-label={sentence ? `Frase: ${sentence}. Toque para ouvir.` : "Frase vazia"}>
          {parts.length === 0 ? (
            <span className="muted">Toque nas figuras para montar a frase.</span>
          ) : (
            parts.map((p, i) => (
              <span key={i} className={`aac-chip ${cardColor(p)}`}>
                <span aria-hidden>{p.emoji}</span>
                {p.label}
              </span>
            ))
          )}
        </button>
      </div>
      {sentence && <div className="aac-preview" aria-live="polite">🗨️ {sentence}</div>}
      {!sentence && lastSaid && <div className="aac-preview muted" aria-live="polite">🔊 Falei: {lastSaid}</div>}

      <div className="row">
        <button className="btn btn-lg btn-sage" onClick={say} disabled={!sentence}>{sayLabel}</button>
        <button className="btn btn-secondary" onClick={() => setParts((p) => p.slice(0, -1))} disabled={!parts.length}>⌫ Apagar a última</button>
        <button className="btn btn-ghost" onClick={() => setParts([])} disabled={!parts.length}>Limpar</button>
        <button className="btn btn-ghost" onClick={() => setShowVoice((v) => !v)} aria-expanded={showVoice}>⚙️ Voz</button>
      </div>

      {showVoice && (
        <div className="card-soft stack">
          <strong>Voz deste aparelho</strong>
          <div className="row" role="radiogroup" aria-label="Velocidade da voz">
            {[["Devagar", 0.7], ["Normal", 0.9], ["Rápida", 1.15]].map(([l, r]) => (
              <button key={l} role="radio" aria-checked={prefs.rate === r} className={`btn ${prefs.rate === r ? "" : "btn-secondary"}`}
                onClick={() => { updatePrefs({ rate: r as number }); speak("Esta é a minha voz."); }}>
                {l}
              </button>
            ))}
          </div>
          {voices.length > 1 && (
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="aac-voice">Escolher a voz</label>
              <select id="aac-voice" value={prefs.voiceURI} onChange={(e) => { updatePrefs({ voiceURI: e.target.value }); setTimeout(() => speak("Esta é a minha voz."), 50); }}>
                <option value="">Automática</option>
                {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
              </select>
            </div>
          )}
          <label className="check">
            <input type="checkbox" checked={prefs.speakOnTap} onChange={(e) => updatePrefs({ speakOnTap: e.target.checked })} />
            <span>Falar cada figura ao tocar</span>
          </label>
        </div>
      )}

      {recentList.length > 0 && (
        <div className="aac-recent">
          <span className="small muted">🕘 Usadas recentemente:</span>
          {recentList.map((t) => (
            <button key={t} className="btn btn-secondary aac-recent-btn" onClick={() => sayNow(t)}>{t}</button>
          ))}
        </div>
      )}

      <div>
        <div className="small muted" style={{ marginBottom: 6 }}>Comece a frase com:</div>
        <div className="aac-starters">
          {AAC_STARTERS.map(renderCard)}
        </div>
      </div>

      <div className="aac-tabs" role="tablist" aria-label="Grupos de figuras">
        {categories.map((g) => (
          <button key={g.id} role="tab" aria-selected={g.id === tab} className={`aac-tab ${g.id === tab ? "on" : ""}`} onClick={() => setTab(g.id)}>
            <span aria-hidden>{g.emoji}</span> {g.title}
          </button>
        ))}
      </div>
      <div className="aac-grid" role="tabpanel" aria-label={current.title}>
        {current.cards.map(renderCard)}
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Cores: <span className="aac-key aac-people">pessoas</span> <span className="aac-key aac-action">ações</span>{" "}
        <span className="aac-key aac-noun">coisas e lugares</span> <span className="aac-key aac-desc">sentimentos e palavras</span>{" "}
        <span className="aac-key aac-social">frases prontas</span>
      </p>
    </div>
  );
}
