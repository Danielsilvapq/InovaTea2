"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addAacItem } from "@/app/actions/patients";
import { CUSTOM_TYPES, composeSentence, customToCard } from "@/lib/aac";
import { AAC_STARTERS } from "@/lib/aac";

const EMOJIS = ["⭐", "🐶", "🐱", "🦖", "🚂", "🚗", "🎮", "📺", "🎵", "🍫", "🍕", "🧃", "🏊", "🌳", "🏫", "👵", "👴", "🧒", "👧", "🧸", "⚽", "🎨", "📖", "🛝"];

export function AacItemForm({ patientId }: { patientId: string }) {
  const [state, action, pending] = useActionState(addAacItem, undefined);
  const [f, setF] = useState({ type: "phrase", emoji: "⭐", label: "", article: "" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) setF((x) => ({ ...x, label: "" }));
  }, [state]);
  const card = customToCard({ id: "x", type: f.type, emoji: f.emoji, label: f.label || "…", article: f.article });
  const quero = AAC_STARTERS.find((s) => s.id === "s-quero")!;
  const example = f.type === "phrase" ? card.label : composeSentence([quero, card]);
  const needsArticle = ["thing", "person", "place"].includes(f.type);

  return (
    <form action={action} ref={ref}>
      {state?.error && <div className="error-box" role="alert">{state.error}</div>}
      {state?.ok && <div className="ok-box" role="status">{state.ok}</div>}
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="emoji" value={f.emoji} />
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {CUSTOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="label">{f.type === "phrase" ? "Frase" : "Palavra"}</label>
          <input id="label" name="label" required maxLength={80} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })}
            placeholder={f.type === "phrase" ? "Ex.: Quero ver o Bob Zoom." : f.type === "person" ? "Ex.: Thor (nome do cachorro)" : "Ex.: dinossauro de pelúcia"} />
        </div>
      </div>
      {needsArticle && (
        <div className="field">
          <label htmlFor="article">Como se fala: <span className="hint">(para a frase sair certa, ex.: "a bola", "o Thor")</span></label>
          <select id="article" name="article" value={f.article} onChange={(e) => setF({ ...f, article: e.target.value })}>
            <option value="">Sem artigo</option>
            <option value="o">o (masculino)</option>
            <option value="a">a (feminino)</option>
            <option value="os">os (masculino, plural)</option>
            <option value="as">as (feminino, plural)</option>
          </select>
        </div>
      )}
      <div className="field">
        <label>Figura</label>
        <div className="row" role="radiogroup" aria-label="Figura">
          {EMOJIS.map((e) => (
            <button key={e} type="button" role="radio" aria-checked={f.emoji === e} className="avatar" onClick={() => setF({ ...f, emoji: e })}
              style={{ cursor: "pointer", width: 48, height: 48, fontSize: "1.6rem", border: `3px solid ${f.emoji === e ? "var(--primary)" : "transparent"}` }}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="card-soft" style={{ marginBottom: 16 }}>
        <span className="small muted">Exemplo de como o aparelho vai falar:</span>
        <div><strong>🗨️ {example}</strong></div>
      </div>
      <button className="btn" disabled={pending}>{pending ? "Salvando..." : "Adicionar à prancha"}</button>
    </form>
  );
}
