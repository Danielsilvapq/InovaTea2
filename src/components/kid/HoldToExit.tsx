"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Sair do modo criança exige segurar o botão por 2 segundos (trava para adultos). */
export function HoldToExit({ href }: { href: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function startHold() {
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 2000);
      setProgress(p);
      if (p >= 1) {
        stopHold();
        router.push(href);
      }
    }, 50);
  }
  function stopHold() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setProgress(0);
  }

  return (
    <button
      className="btn btn-ghost small"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onKeyDown={(e) => e.key === "Enter" && !timer.current && startHold()}
      onKeyUp={stopHold}
      style={{
        background: `linear-gradient(90deg, var(--primary-soft) ${progress * 100}%, transparent ${progress * 100}%)`,
        border: "1px solid var(--line)",
      }}
      aria-label="Área dos adultos: segure por 2 segundos"
    >
      🔒 Adultos (segure)
    </button>
  );
}
