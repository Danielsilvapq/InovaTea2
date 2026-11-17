"use client";

import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";

const SPECIALTIES = [
  "Psicologia",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Neuropediatria",
  "Psiquiatria",
  "Psicopedagogia",
  "Fisioterapia",
  "Análise do Comportamento (ABA)",
  "Outra",
];

export function SignupForm({ initialRole }: { initialRole: "GUARDIAN" | "PROFESSIONAL" }) {
  const [role, setRole] = useState(initialRole);
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action}>
      {state?.error && <div className="error-box">{state.error}</div>}
      <fieldset className="field" style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
        <legend style={{ fontWeight: 700, marginBottom: 8 }}>Tipo de conta</legend>
        <div className="grid grid-2">
          {(
            [
              ["GUARDIAN", "👨‍👩‍👧 Responsável", "Pais, mães, familiares ou tutores"],
              ["PROFESSIONAL", "🩺 Profissional de saúde", "Médicos, terapeutas e psicólogos"],
            ] as const
          ).map(([value, title, desc]) => (
            <label
              key={value}
              className="card-soft"
              style={{
                cursor: "pointer",
                border: `2px solid ${role === value ? "var(--primary)" : "transparent"}`,
                fontWeight: 400,
              }}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                style={{ width: "auto", minHeight: 0, marginRight: 8 }}
              />
              <strong>{title}</strong>
              <div className="small muted">{desc}</div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="name">Nome completo</label>
        <input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefone (opcional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>

      {role === "GUARDIAN" ? (
        <div className="field">
          <label htmlFor="relationship">Parentesco</label>
          <select id="relationship" name="relationship" defaultValue="">
            <option value="">Selecione</option>
            {["Mãe", "Pai", "Avó", "Avô", "Tio(a)", "Irmão(ã)", "Tutor(a) legal", "Outro"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="specialty">Especialidade</label>
              <select id="specialty" name="specialty" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="registryNumber">
                Registro profissional <span className="hint">(CRP, CRM, CRFa, CREFITO...)</span>
              </label>
              <input id="registryNumber" name="registryNumber" required placeholder="Ex.: CRP 06/123456" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="institution">Clínica ou instituição (opcional)</label>
            <input id="institution" name="institution" />
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="password">
          Senha <span className="hint">(mínimo de 8 caracteres)</span>
        </label>
        <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
      </div>

      <label className="row" style={{ fontWeight: 400, alignItems: "flex-start", flexWrap: "nowrap" }}>
        <input type="checkbox" name="consent" required style={{ width: 24, minHeight: 24, marginTop: 2 }} />
        <span className="small">
          Concordo com o tratamento dos dados pessoais e de saúde conforme a LGPD, exclusivamente
          para fins de acompanhamento terapêutico.
        </span>
      </label>

      <button className="btn btn-block btn-lg" disabled={pending} style={{ marginTop: 16 }}>
        {pending ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
