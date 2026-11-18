"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { KidSettings } from "@/lib/accessibility";
import { speechText } from "@/lib/accessibility";

const defaults: KidSettings = {
  communication: "VERBAL", reading: "INDEPENDENT", answerSupport: "INDEPENDENT",
  narration: false, bigTargets: false, soundOn: false, reduceMotion: true,
};
const Ctx = createContext<KidSettings>(defaults);

export function KidSettingsProvider({ value, children }: { value: KidSettings; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useKidSettings = () => useContext(Ctx);

/** Preferências de voz deste aparelho (velocidade, voz escolhida, falar ao tocar). */
export interface VoicePrefs {
  rate: number;
  voiceURI: string;
  speakOnTap: boolean;
}
const VOICE_KEY = "inovatea-voz";
export function readVoicePrefs(): VoicePrefs {
  try {
    const raw = localStorage.getItem(VOICE_KEY);
    if (raw) return { rate: 0.9, voiceURI: "", speakOnTap: true, ...JSON.parse(raw) };
  } catch {}
  return { rate: 0.9, voiceURI: "", speakOnTap: true };
}
export function writeVoicePrefs(p: VoicePrefs) {
  try {
    localStorage.setItem(VOICE_KEY, JSON.stringify(p));
  } catch {}
}
/** Vozes em português disponíveis neste aparelho. */
export function usePortugueseVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => {
      try {
        setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("pt")));
      } catch {}
    };
    load();
    try {
      window.speechSynthesis.addEventListener("voiceschanged", load);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    } catch {}
  }, []);
  return voices;
}

/** Voz em português (Web Speech API). Funciona offline na maioria dos aparelhos. */
export function useSpeech() {
  const { narration } = useKidSettings();
  const speak = useCallback((text: string) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const prefs = readVoicePrefs();
      const u = new SpeechSynthesisUtterance(speechText(text));
      u.lang = "pt-BR";
      u.rate = prefs.rate;
      const all = synth.getVoices();
      const voice = all.find((v) => v.voiceURI === prefs.voiceURI) ?? all.find((v) => v.lang?.toLowerCase().startsWith("pt-br")) ?? all.find((v) => v.lang?.toLowerCase().startsWith("pt"));
      if (voice) u.voice = voice;
      synth.speak(u);
    } catch {}
  }, []);
  /** Fala só quando a narração automática está ligada no perfil. */
  const auto = useCallback((text: string) => narration && speak(text), [narration, speak]);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch {} }, []);
  return { speak, auto, narration };
}

export function SpeakButton({ text, label = "Ouvir" }: { text: string; label?: string }) {
  const { speak } = useSpeech();
  return (
    <button type="button" className="speak-btn" onClick={() => speak(text)} aria-label={`${label}: ${speechText(text)}`} title={label}>
      🔊
    </button>
  );
}

/**
 * Tentativas numa pergunta, conforme o apoio do perfil:
 * - Independente: uma tentativa.
 * - Com apoio: pode tentar de novo até acertar.
 * - Apoio total: tenta de novo e, após 6 s, a resposta certa ganha um destaque suave.
 * Para a evolução, conta como acerto só o que foi certo na primeira tentativa.
 */
export function useAttempt(resetKey: unknown) {
  const { answerSupport, bigTargets } = useKidSettings();
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState<number | null>(null);
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    setTried([]);
    setSolved(null);
    setGlow(false);
    if (answerSupport !== "FULL") return;
    const t = setTimeout(() => setGlow(true), bigTargets ? 8000 : 6000);
    return () => clearTimeout(t);
  }, [resetKey, answerSupport, bigTargets]);
  const retry = answerSupport !== "INDEPENDENT";

  function attempt(i: number, correct: number): { done: boolean; firstTry: boolean; attempts: number } | null {
    if (solved !== null || tried.includes(i)) return null;
    if (i === correct || !retry) {
      setSolved(i);
      return { done: true, firstTry: i === correct && tried.length === 0, attempts: tried.length + 1 };
    }
    setTried((t) => [...t, i]);
    return { done: false, firstTry: false, attempts: tried.length + 1 };
  }
  const cls = (i: number, correct: number) =>
    solved === null
      ? tried.includes(i) ? "chosen-wrong" : glow && i === correct ? "hint-glow" : ""
      : i === correct ? "correct" : i === solved ? "chosen-wrong" : "";
  const disabled = (i: number) => solved !== null || tried.includes(i);
  return { tried, solved, attempt, cls, disabled, retry, firstTry: tried.length === 0 };
}
