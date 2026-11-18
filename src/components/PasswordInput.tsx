"use client";

import { useState } from "react";

/** Campo de senha com "Mostrar senha" e aviso de Caps Lock ligado. */
export function PasswordInput({ id, name, label, autoComplete, minLength, hint }: {
  id: string; name: string; label: string; autoComplete: string; minLength?: number; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const check = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.("CapsLock") ?? false);
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {hint && <span className="hint">{hint}</span>}
      </label>
      <div className="password-wrap">
        <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} required
          onKeyUp={check} onKeyDown={check} onBlur={() => setCaps(false)} />
        <button type="button" className="password-toggle" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-controls={id}>
          {show ? "🙈 Esconder" : "👁️ Mostrar"}
        </button>
      </div>
      {caps && <div className="caps-warning" role="status">⚠️ O Caps Lock está ligado.</div>}
    </div>
  );
}
