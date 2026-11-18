"use client";

import { useActionState, useState } from "react";
import { addGoal } from "@/app/actions/patients";
import { ACTIVITIES } from "@/lib/activities";
import { GOAL_KINDS, describeGoal, type GoalKind } from "@/lib/achievements";

const EMOJIS = ["🎯", "🌟", "🏅", "🎈", "🌈", "🚀", "🦕", "🐢", "💪", "🧩"];

export function GoalForm({ patientId }: { patientId: string }) {
  const [state, action, pending] = useActionState(addGoal, undefined);
  const [f, setF] = useState({ title: "", emoji: "🎯", kind: "DAYS" as GoalKind, activityKey: "respiracao", target: 5, minAccuracy: 70, level: 10, note: "", dueDate: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  const activity = ACTIVITIES.find((a) => a.key === f.activityKey);
  const preview = describeGoal({
    id: "x", title: f.title, emoji: f.emoji, kind: f.kind, activityKey: f.activityKey || null, target: f.target,
    minAccuracy: f.minAccuracy / 100, level: f.level, createdAt: new Date(), active: true,
  });

  return (
    <form action={action}>
      {state?.error && <div className="error-box" role="alert">{state.error}</div>}
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="emoji" value={f.emoji} />
      <div className="field">
        <label htmlFor="title">Nome da meta <span className="hint">(curto, a criança vai ler)</span></label>
        <input id="title" name="title" value={f.title} onChange={set("title")} required placeholder="Ex.: Respirar antes da escola" maxLength={60} />
      </div>
      <div className="field">
        <label>Figura da meta</label>
        <div className="row" role="radiogroup" aria-label="Figura da meta">
          {EMOJIS.map((e) => (
            <button key={e} type="button" role="radio" aria-checked={f.emoji === e} className="avatar" onClick={() => setF({ ...f, emoji: e })}
              style={{ cursor: "pointer", border: `3px solid ${f.emoji === e ? "var(--primary)" : "transparent"}` }}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="kind">Tipo de meta</label>
          <select id="kind" name="kind" value={f.kind} onChange={set("kind")}>
            {GOAL_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="activityKey">Atividade</label>
          <select id="activityKey" name="activityKey" value={f.activityKey} onChange={set("activityKey")}>
            {f.kind !== "LEVEL" && <option value="">Qualquer atividade</option>}
            {ACTIVITIES.filter((a) => f.kind !== "LEVEL" || a.levels > 1).filter((a) => f.kind !== "ACCURACY" || !["CHAT", "BREATHING"].includes(a.type)).map((a) => (
              <option key={a.key} value={a.key}>{a.emoji} {a.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-2">
        {f.kind !== "LEVEL" && (
          <div className="field">
            <label htmlFor="target">{f.kind === "DAYS" ? "Quantos dias diferentes" : "Quantas vezes"}</label>
            <input id="target" name="target" type="number" min={1} max={60} value={f.target} onChange={set("target")} />
          </div>
        )}
        {f.kind === "ACCURACY" && (
          <div className="field">
            <label htmlFor="minAccuracy">Acerto mínimo (%)</label>
            <input id="minAccuracy" name="minAccuracy" type="number" min={10} max={100} step={5} value={f.minAccuracy} onChange={set("minAccuracy")} />
          </div>
        )}
        {f.kind === "LEVEL" && (
          <div className="field">
            <label htmlFor="level">Fase a alcançar</label>
            <select id="level" name="level" value={f.level} onChange={set("level")}>
              {Array.from({ length: activity?.levels ?? 5 }, (_, i) => i + 1).map((l) => <option key={l} value={l}>Fase {l}</option>)}
            </select>
            <input type="hidden" name="target" value={1} />
          </div>
        )}
        <div className="field">
          <label htmlFor="dueDate">Prazo (opcional)</label>
          <input id="dueDate" name="dueDate" type="date" value={f.dueDate} onChange={set("dueDate")} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="note">Recado para a criança (opcional)</label>
        <textarea id="note" name="note" value={f.note} onChange={set("note")} maxLength={200} placeholder="Ex.: Respirar devagar ajuda você a começar o dia mais calmo." />
      </div>
      <div className="card-soft" style={{ marginBottom: 16 }}>
        <div className="small muted">Como a criança vai ver:</div>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span style={{ fontSize: "2rem" }}>{f.emoji}</span>
          <div>
            <strong>{f.title || "Nome da meta"}</strong>
            <div className="small">{preview}</div>
          </div>
        </div>
      </div>
      <button className="btn" disabled={pending}>{pending ? "Salvando..." : "Criar meta"}</button>
    </form>
  );
}
