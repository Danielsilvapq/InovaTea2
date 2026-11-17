"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SaveResult {
  sessionId: string;
  points: number;
  totalPoints: number;
  levelUp: boolean;
  newLevel: number;
  unlockedActivityLevel?: number | null;
  accuracy?: number;
}

export interface SavePayload {
  patientId: string;
  activityKey: string;
  level: number;
  correct: number;
  wrong: number;
  total: number;
  durationSec: number;
  completed: boolean;
  details?: Record<string, unknown>;
}

export async function saveSession(payload: SavePayload): Promise<SaveResult | null> {
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function saveMood(sessionId: string, mood: string) {
  await fetch(`/api/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood }),
  }).catch(() => {});
}

/** Cronômetro da sessão em segundos. */
export function useElapsed(running: boolean) {
  const start = useRef(Date.now());
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSec(Math.round((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [running]);
  const read = useCallback(() => Math.round((Date.now() - start.current) / 1000), []);
  const reset = useCallback(() => {
    start.current = Date.now();
    setSec(0);
  }, []);
  return { sec, read, reset };
}

/** Som curto e suave (só quando o responsável liga o som). */
export function useSoftSound(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  return useCallback(
    (kind: "ok" | "try") => {
      if (!enabled || typeof window === "undefined") return;
      try {
        ctx.current ??= new AudioContext();
        const ac = ctx.current;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.value = kind === "ok" ? 660 : 392;
        gain.gain.setValueAtTime(0.0001, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ac.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.45);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.5);
      } catch {}
    },
    [enabled],
  );
}

export function formatClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
