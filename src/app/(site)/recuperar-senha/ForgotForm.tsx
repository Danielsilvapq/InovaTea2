"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export function ForgotForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action}>
      {state?.error && <div className="error-box" role="alert">{state.error}</div>}
      {state?.ok && (
        <div className="ok-box" role="status">
          {state.ok}
          {state.devLink && (
            <div className="small" style={{ marginTop: 8 }}>
              <strong>Ambiente de desenvolvimento:</strong> o e-mail ainda não está configurado, então o link aparece aqui:{" "}
              <a href={state.devLink}>criar nova senha</a>
            </div>
          )}
        </div>
      )}
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={defaultEmail} autoFocus />
      </div>
      <button className="btn btn-lg btn-block" disabled={pending}>{pending ? "Enviando..." : "Enviar link"}</button>
    </form>
  );
}
