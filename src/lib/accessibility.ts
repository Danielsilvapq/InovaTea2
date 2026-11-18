// Perfil de comunicação e apoio: o mesmo sistema precisa atender crianças
// não verbais com nível de suporte 3 e adolescentes verbais com nível 1.

export type Communication = "VERBAL" | "LIMITED" | "NONVERBAL";
export type Reading = "INDEPENDENT" | "SUPPORTED" | "NONE";
export type AnswerSupport = "INDEPENDENT" | "SUPPORTED" | "FULL";

export const COMMUNICATION_OPTIONS: { value: Communication; label: string; hint: string }[] = [
  { value: "VERBAL", label: "Verbal", hint: "Fala e conversa por frases" },
  { value: "LIMITED", label: "Pouca fala", hint: "Usa palavras soltas ou frases curtas" },
  { value: "NONVERBAL", label: "Não verbal", hint: "Comunica-se por gestos, figuras ou dispositivo" },
];
export const READING_OPTIONS: { value: Reading; label: string; hint: string }[] = [
  { value: "INDEPENDENT", label: "Lê sozinho", hint: "Lê as perguntas com autonomia" },
  { value: "SUPPORTED", label: "Lê com apoio", hint: "Reconhece algumas palavras" },
  { value: "NONE", label: "Ainda não lê", hint: "Precisa ouvir e ver figuras" },
];
export const SUPPORT_OPTIONS: { value: AnswerSupport; label: string; hint: string }[] = [
  { value: "INDEPENDENT", label: "Independente", hint: "3 opções, uma tentativa" },
  { value: "SUPPORTED", label: "Com apoio", hint: "2 opções e pode tentar de novo" },
  { value: "FULL", label: "Apoio total", hint: "2 opções, tentar de novo e a resposta certa é destacada após alguns segundos" },
];

export interface KidSettings {
  communication: Communication;
  reading: Reading;
  answerSupport: AnswerSupport;
  narration: boolean;
  bigTargets: boolean;
  soundOn: boolean;
  reduceMotion: boolean;
}

/** Sugestão inicial a partir do nível de suporte informado no cadastro. */
export function defaultsForSupportLevel(level: number | null): Omit<KidSettings, "soundOn" | "reduceMotion"> {
  if (level === 3) return { communication: "NONVERBAL", reading: "NONE", answerSupport: "FULL", narration: true, bigTargets: true };
  if (level === 2) return { communication: "LIMITED", reading: "SUPPORTED", answerSupport: "SUPPORTED", narration: true, bigTargets: false };
  return { communication: "VERBAL", reading: "INDEPENDENT", answerSupport: "INDEPENDENT", narration: false, bigTargets: false };
}

export const communicationLabel = (v: string) => COMMUNICATION_OPTIONS.find((o) => o.value === v)?.label ?? v;
export const readingLabel = (v: string) => READING_OPTIONS.find((o) => o.value === v)?.label ?? v;
export const supportLabel = (v: string) => SUPPORT_OPTIONS.find((o) => o.value === v)?.label ?? v;

/** Com apoio, mostra só a resposta certa e uma opção errada. */
export function reduceOptions<T>(options: T[], answer: number, support: AnswerSupport): { options: T[]; answer: number } {
  if (support === "INDEPENDENT" || options.length <= 2) return { options, answer };
  // Determinístico (as opções já chegam embaralhadas): fica a certa e a primeira errada.
  const wrong = options.findIndex((_, i) => i !== answer);
  const keep = [answer, wrong].sort((a, b) => a - b);
  return { options: keep.map((i) => options[i]), answer: keep.indexOf(answer) };
}

/** Texto para a voz: tira emojis e símbolos que o leitor pronunciaria de forma estranha. */
export function speechText(text: string) {
  return text
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
    .replace(/[→·•]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

// A prancha Minha Voz (CAA) fica em ./aac.ts.
