"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions/auth";

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
}

export function ActionForm({ action, children, submitLabel, pendingLabel, resetOnSuccess, className }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form action={formAction} ref={ref} className={className}>
      {state?.error && <div className="error-box" role="alert">{state.error}</div>}
      {state?.ok && <div className="ok-box" role="status">{state.ok}</div>}
      {children}
      <button className="btn" disabled={pending}>
        {pending ? pendingLabel ?? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
