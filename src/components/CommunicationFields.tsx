"use client";

import { useState } from "react";
import {
  COMMUNICATION_OPTIONS, READING_OPTIONS, SUPPORT_OPTIONS, defaultsForSupportLevel,
  type AnswerSupport, type Communication, type Reading,
} from "@/lib/accessibility";

interface Values {
  supportLevel?: string;
  communication: Communication;
  reading: Reading;
  answerSupport: AnswerSupport;
  narration: boolean;
  bigTargets: boolean;
}

function Choice<T extends string>({ name, legend, options, value, onChange }: {
  name: string; legend: string; options: { value: T; label: string; hint: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
      <legend style={{ fontWeight: 700, marginBottom: 6 }}>{legend}</legend>
      <div className="grid grid-3" style={{ gap: 8 }}>
        {options.map((o) => (
          <label key={o.value} className={`card-soft choice ${value === o.value ? "on" : ""}`} style={{ padding: 12, margin: 0 }}>
            <span className="row" style={{ flexWrap: "nowrap", gap: 8 }}>
              <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
              <strong>{o.label}</strong>
            </span>
            <span className="small muted">{o.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Perfil de comunicação e acessibilidade. Com `withSupportLevel`, o nível de
 * suporte do TEA sugere os valores, que o adulto pode ajustar.
 */
export function CommunicationFields({ initial, withSupportLevel = false }: { initial?: Partial<Values>; withSupportLevel?: boolean }) {
  const [v, setV] = useState<Values>({ ...defaultsForSupportLevel(null), ...initial } as Values);
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));

  return (
    <div className="card-soft stack" style={{ marginBottom: 16 }}>
      <div>
        <strong style={{ fontSize: "1.05rem" }}>🗣️ Perfil de comunicação</strong>
        <p className="small muted" style={{ margin: "4px 0 0" }}>
          Adapta o sistema ao jeito de cada criança: narração em voz alta, prancha de figuras, menos opções e botões maiores.
        </p>
      </div>
      {withSupportLevel && (
        <div className="field">
          <label htmlFor="supportLevel">Nível de suporte do TEA (opcional)</label>
          <select id="supportLevel" name="supportLevel" value={v.supportLevel ?? ""}
            onChange={(e) => {
              const lvl = e.target.value;
              setV({ ...v, supportLevel: lvl, ...defaultsForSupportLevel(lvl ? Number(lvl) : null) });
            }}>
            <option value="">Prefiro não informar</option>
            <option value="1">Nível 1 (pouco suporte)</option>
            <option value="2">Nível 2 (suporte substancial)</option>
            <option value="3">Nível 3 (suporte muito substancial)</option>
          </select>
          <span className="hint">Ao escolher o nível, sugerimos as opções abaixo. Você pode mudar qualquer uma.</span>
        </div>
      )}
      <Choice name="communication" legend="Como se comunica" options={COMMUNICATION_OPTIONS} value={v.communication} onChange={(x) => set("communication", x)} />
      <Choice name="reading" legend="Leitura" options={READING_OPTIONS} value={v.reading} onChange={(x) => set("reading", x)} />
      <Choice name="answerSupport" legend="Apoio nas respostas" options={SUPPORT_OPTIONS} value={v.answerSupport} onChange={(x) => set("answerSupport", x)} />
      <label className="check">
        <input type="checkbox" name="narration" checked={v.narration} onChange={(e) => set("narration", e.target.checked)} />
        <span>
          <strong>Narração automática</strong> — ler em voz alta perguntas, opções e instruções
        </span>
      </label>
      <label className="check">
        <input type="checkbox" name="bigTargets" checked={v.bigTargets} onChange={(e) => set("bigTargets", e.target.checked)} />
        <span>
          <strong>Botões grandes e mais tempo</strong> — para dificuldades motoras ou de atenção
        </span>
      </label>
    </div>
  );
}
