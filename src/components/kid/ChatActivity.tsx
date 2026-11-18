"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityShell } from "./ActivityShell";
import { ResultScreen } from "./ResultScreen";
import { useElapsed, type SaveResult } from "./useKid";

const GOAL = 8; // meta de mensagens da criança por conversa
const QUICK = ["Estou feliz 😄", "Estou cansado 🥱", "Quero falar do meu dia", "Me conta uma curiosidade", "Tchau 👋"];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function ChatActivity({ patientId, childName }: { patientId: string; childName: string }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ result: SaveResult | null; duration: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useElapsed(!done && !!sessionId);
  const listRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  async function start() {
    setError(null);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", patientId }),
    });
    if (!res.ok) {
      setError("Não consegui ligar o TeaBot agora.");
      return;
    }
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages([{ role: "assistant", content: data.reply }]);
    timer.reset();
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending]);

  async function send(content: string) {
    const clean = content.trim();
    if (!clean || !sessionId || sending) return;
    setText("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: clean }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message", sessionId, text: clean }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Desculpe, não entendi. Pode repetir?" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Desculpe, tive um probleminha. Pode repetir?" }]);
    } finally {
      setSending(false);
    }
  }

  async function finish() {
    if (!sessionId) return;
    const duration = timer.read();
    let result: SaveResult | null = null;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", sessionId, durationSec: duration }),
      });
      if (res.ok) result = await res.json();
    } catch {}
    setDone({ result, duration });
    router.refresh();
  }

  function restart() {
    setDone(null);
    setMessages([]);
    setSessionId(null);
    start();
  }

  const sent = messages.filter((m) => m.role === "user").length;

  if (done) {
    return (
      <ResultScreen
        patientId={patientId}
        result={done.result}
        durationSec={done.duration}
        completed={sent > 0}
        onRestart={restart}
        message={`Você mandou ${sent} mensagem(ns) para o TeaBot. Ele adorou conversar com você, ${childName}!`}
      />
    );
  }

  return (
    <ActivityShell
      emoji="🤖"
      title="Conversar com o TeaBot"
      step={Math.min(sent, GOAL)}
      totalSteps={GOAL}
      stepLabel="Mensagem"
      elapsedSec={timer.sec}
      onStop={finish}
    >
      <div className="card stack">
        {error && (
          <div className="error-box">
            {error}{" "}
            <button className="btn btn-secondary" onClick={start}>
              Tentar de novo
            </button>
          </div>
        )}
        <div className="chat" ref={listRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === "assistant" ? "bot" : "me"}`}>
              {m.role === "assistant" && <strong>🤖 TeaBot: </strong>}
              {m.content}
            </div>
          ))}
          {sending && <div className="bubble bot muted">🤖 TeaBot está pensando...</div>}
        </div>
        <div className="row">
          {QUICK.map((q) => (
            <button key={q} className="btn btn-secondary" onClick={() => send(q)} disabled={sending || !sessionId}>
              {q}
            </button>
          ))}
        </div>
        <form
          className="row"
          style={{ flexWrap: "nowrap" }}
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          <label htmlFor="msg" style={{ position: "absolute", left: -9999 }}>
            Sua mensagem
          </label>
          <input
            id="msg"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva aqui..."
            maxLength={500}
            autoComplete="off"
            style={{ fontSize: "1.1rem" }}
          />
          <button className="btn btn-lg" disabled={sending || !text.trim() || !sessionId}>
            Enviar
          </button>
        </form>
        {sent >= GOAL && <div className="ok-box">🎯 Você alcançou a meta de conversa! Pode continuar ou terminar.</div>}
        <button className="btn btn-sage" onClick={finish} disabled={!sessionId}>
          ✅ Terminar conversa
        </button>
      </div>
    </ActivityShell>
  );
}
