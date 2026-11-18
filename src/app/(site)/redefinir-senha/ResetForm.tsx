"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { PasswordInput } from "@/components/PasswordInput";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action}>
      {state?.error && <div className="error-box" role="alert">{state.error}</div>}
      <input type="hidden" name="token" value={token} />
      <PasswordInput id="password" name="password" label="Nova senha" hint="(mínimo de 8 caracteres)" autoComplete="new-password" minLength={8} />
      <PasswordInput id="confirm" name="confirm" label="Repita a nova senha" autoComplete="new-password" minLength={8} />
      <button className="btn btn-lg btn-block" disabled={pending}>{pending ? "Salvando..." : "Salvar e entrar"}</button>
    </form>
  );
}
