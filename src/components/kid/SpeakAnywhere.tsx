"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { AacItemLike } from "@/lib/aac";
import { AacBoard } from "./AacBoard";
import { saveSession } from "./useKid";

/**
 * Botão "🗣️ Falar" no topo do modo criança: abre a prancha por cima de
 * qualquer tela (no meio de um jogo, por exemplo) e registra as frases.
 */
export function SpeakAnywhere({ patientId, customItems, recent }: { patientId: string; customItems: AacItemLike[]; recent: string[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Na própria Minha Voz e na conversa com o TeaBot a prancha já está na tela.
  const hidden = /\/(minhavoz|conversa)$/.test(pathname ?? "");
  const phrases = useRef<{ text: string; at: string }[]>([]);
  const openedAt = useRef(Date.now());

  async function close() {
    setOpen(false);
    const list = phrases.current;
    phrases.current = [];
    if (!list.length) return;
    await saveSession({
      patientId, activityKey: "minhavoz", level: 1, correct: list.length, wrong: 0, total: list.length,
      durationSec: Math.round((Date.now() - openedAt.current) / 1000), completed: true, details: { phrases: list, source: "atalho" },
    });
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (hidden && !open) return null;
  return (
    <>
      <button className="btn btn-sage speak-anywhere" onClick={() => { openedAt.current = Date.now(); setOpen(true); }} aria-haspopup="dialog">
        🗣️ Falar
      </button>
      {open && (
        <div className="aac-overlay" role="dialog" aria-modal="true" aria-label="Prancha de comunicação">
          <div className="aac-overlay-inner card">
            <div className="row between">
              <h2 style={{ margin: 0 }}>🗣️ Minha Voz</h2>
              <button className="btn btn-secondary" onClick={close}>✕ Fechar</button>
            </div>
            <AacBoard customItems={customItems} recent={recent} onSay={(text) => phrases.current.push({ text, at: new Date().toISOString() })} />
          </div>
        </div>
      )}
    </>
  );
}
