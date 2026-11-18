"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { login } from "@/app/actions/auth";
import { PasswordInput } from "@/components/PasswordInput";

const EMAIL_KEY = "inovatea-ultimo-email";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [remembered, setRemembered] = useState(false);

  // Lembra o último e-mail usado neste aparelho.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRemembered(true);
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (remembered) document.getElementById("password")?.focus();
    else document.getElementById("email")?.focus();
  }, [remembered]);

  return (
    <form
      action={action}
      onSubmit={() => {
        try {
          localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
        } catch {}
      }}
    >
      {state?.error && <div className="error-box" role="alert">{state.error}</div>}
      <input type="hidden" name="next" value={next} />
      {remembered ? (
        <div className="login-known">
          <input type="hidden" name="email" value={email} />
          <span>
            Entrando como <strong>{email}</strong>
          </span>
          <button
            type="button"
            className="linkbtn"
            onClick={() => {
              setRemembered(false);
              setEmail("");
              try {
                localStorage.removeItem(EMAIL_KEY);
              } catch {}
            }}
          >
            Não é você?
          </button>
        </div>
      ) : (
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
        </div>
      )}
      <PasswordInput id="password" name="password" label="Senha" autoComplete="current-password" />
      <div className="row between" style={{ margin: "-4px 0 16px" }}>
        <label className="check">
          <input type="checkbox" name="remember" defaultChecked />
          <span>Manter conectado neste aparelho</span>
        </label>
        <Link href={`/recuperar-senha${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="small">
          Esqueci minha senha
        </Link>
      </div>
      <button className="btn btn-lg btn-block" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
