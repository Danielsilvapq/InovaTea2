// Geradores das rodadas dos jogos. Funções puras, sem dependências,
// usadas no navegador para sortear cada partida.
import {
  COUNT_BY_LEVEL,
  COUNT_EMOJIS,
  COUNT_ROUNDS,
  ODD_BY_LEVEL,
  ODD_ROUNDS,
  ORDER_BY_LEVEL,
  ROUTINES_BY_SIZE,
  SORT_BY_LEVEL,
  type Routine,
} from "./activities";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/** Três opções de resposta perto do valor certo, sem repetir e sem negativos. */
function numberOptions(answer: number) {
  const set = new Set([answer]);
  const deltas = shuffle([-2, -1, 1, 2, 3]);
  for (const d of deltas) {
    if (set.size === 3) break;
    if (answer + d >= 0) set.add(answer + d);
  }
  return [...set].sort((a, b) => a - b);
}

export interface OddRound {
  cells: string[];
  oddIndex: number;
  cols: number;
  same: string;
  odd: string;
}
export function oddRounds(level: number): OddRound[] {
  const cfg = ODD_BY_LEVEL[level];
  return shuffle(cfg.pairs)
    .slice(0, ODD_ROUNDS)
    .map(([same, odd]) => {
      // Sorteia qual das duas figuras é a "diferente", para variar.
      const [a, b] = Math.random() < 0.5 ? [same, odd] : [odd, same];
      const oddIndex = randInt(0, cfg.cells - 1);
      const cells = Array.from({ length: cfg.cells }, (_, i) => (i === oddIndex ? b : a));
      return { cells, oddIndex, cols: cfg.cols, same: a, odd: b };
    });
}

export interface CountRound {
  kind: "count" | "add" | "sub";
  emoji: string;
  a: number;
  b: number;
  answer: number;
  options: number[];
  prompt: string;
}
export function countRounds(level: number): CountRound[] {
  const cfg = COUNT_BY_LEVEL[level];
  const emojis = shuffle(COUNT_EMOJIS);
  return Array.from({ length: COUNT_ROUNDS }, (_, i) => {
    const emoji = emojis[i % emojis.length];
    if (cfg.kind === "count") {
      const a = randInt(cfg.min, cfg.max);
      return { kind: "count", emoji, a, b: 0, answer: a, options: numberOptions(a), prompt: `Quantos ${emoji} você vê?` };
    }
    if (cfg.kind === "add") {
      const total = randInt(Math.max(cfg.min, 2), cfg.max);
      const a = randInt(1, total - 1);
      const b = total - a;
      return { kind: "add", emoji, a, b, answer: total, options: numberOptions(total), prompt: `${a} mais ${b}. Quantos ${emoji} ao todo?` };
    }
    const a = randInt(cfg.min, cfg.max);
    const b = randInt(1, Math.min(5, a - 1));
    return { kind: "sub", emoji, a, b, answer: a - b, options: numberOptions(a - b), prompt: `Tinha ${a} ${emoji}. ${b} foram embora. Quantos ficaram?` };
  });
}

export function sortRound(level: number) {
  const set = SORT_BY_LEVEL[level];
  return { ...set, items: shuffle(set.items) };
}

export interface OrderRound {
  routine: Routine;
  shuffled: number[]; // índices dos passos na ordem mostrada
}
export function orderRounds(level: number): OrderRound[] {
  const cfg = ORDER_BY_LEVEL[level];
  return shuffle(ROUTINES_BY_SIZE[cfg.size])
    .slice(0, cfg.rounds)
    .map((routine) => {
      const idx = routine.steps.map((_, i) => i);
      let shuffled = shuffle(idx);
      // Nunca mostrar os passos já na ordem certa.
      while (shuffled.every((v, i) => v === i)) shuffled = shuffle(idx);
      return { routine, shuffled };
    });
}
