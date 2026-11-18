// Fases dos jogos: 50 por jogo, em 5 mundos de 10 fases.
// Cada mundo usa um conteúdo base (os 5 níveis originais) e, dentro do mundo,
// a dificuldade sobe aos poucos: mais rodadas, grades maiores, números maiores.
// Funções puras, sem dependências, usadas no servidor e no navegador.
import {
  COUNT_EMOJIS,
  MEMORY_SYMBOLS,
  ODD_BY_LEVEL,
  QUIZZES,
  ROUTINES_BY_SIZE,
  SEQUENCE_SHAPES,
  SORT_BY_LEVEL,
  SORT_EXTRA_BY_TIER,
  type QuizQuestion,
  type Routine,
  type SortSet,
} from "./activities";

export const PHASES = 50;
export const PHASES_PER_WORLD = 10;
export const WORLDS = [
  { n: 1, title: "Mundo Semente", emoji: "🌱" },
  { n: 2, title: "Floresta", emoji: "🌿" },
  { n: 3, title: "Montanha", emoji: "⛰️" },
  { n: 4, title: "Céu", emoji: "⭐" },
  { n: 5, title: "Espaço", emoji: "🚀" },
];
/** Mundo (1 a 5) da fase. */
export const worldOf = (phase: number) => Math.min(WORLDS.length, Math.max(1, Math.ceil(phase / PHASES_PER_WORLD)));
/** Posição da fase dentro do mundo (1 a 10). */
export const stepInWorld = (phase: number) => ((Math.max(1, phase) - 1) % PHASES_PER_WORLD) + 1;

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
  for (const d of shuffle([-2, -1, 1, 2, 3])) {
    if (set.size === 3) break;
    if (answer + d >= 0) set.add(answer + d);
  }
  return [...set].sort((a, b) => a - b);
}

// ----- Quizzes --------------------------------------------------------------

/**
 * Perguntas da fase: as do mundo atual primeiro e, conforme a fase avança,
 * revisão de mundos anteriores. De 4 a 7 perguntas, com as opções embaralhadas.
 */
export function quizRound(key: string, phase: number): QuizQuestion[] {
  const world = worldOf(phase);
  const step = stepInWorld(phase);
  const bank = QUIZZES[key];
  if (!bank) return [];
  const current = shuffle(bank[world] ?? []);
  const review = shuffle(Array.from({ length: world - 1 }, (_, i) => bank[i + 1] ?? []).flat());
  const size = 4 + Math.floor((step - 1) / 3); // 4, 4, 4, 5, 5, 5, 6, 6, 6, 7
  const picked = [...current.slice(0, size), ...review].slice(0, Math.max(4, Math.min(size, current.length + review.length)));
  return shuffle(picked).map((q) => {
    const order = shuffle(q.options.map((_, i) => i));
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
  });
}

// ----- Memória e sequência -------------------------------------------------

/** De 3 pares (fase 1) a 12 pares (fase 46+). */
export const memoryPairs = (phase: number) => Math.min(12, 3 + Math.floor((phase - 1) / 5));
export const memoryCols = (pairs: number) => (pairs <= 3 ? 3 : pairs <= 8 ? 4 : pairs <= 10 ? 5 : 6);
export const memorySymbols = (pairs: number) => shuffle(MEMORY_SYMBOLS).slice(0, pairs);

/** Sequência: de 3 a 9 formas; 4 formas diferentes até a fase 15, 5 até a 30, depois 6. */
export function sequenceConfig(phase: number) {
  const length = Math.min(9, 3 + Math.floor((phase - 1) / 7));
  const shapes = SEQUENCE_SHAPES.slice(0, phase <= 15 ? 4 : phase <= 30 ? 5 : 6);
  return { length, shapes, rounds: 4 };
}

// ----- Encontre o Diferente -------------------------------------------------

export interface OddRound {
  cells: string[];
  oddIndex: number;
  cols: number;
  same: string;
  odd: string;
}
const ODD_GRIDS: [number, number][] = [[4, 2], [6, 3], [9, 3], [12, 4], [16, 4], [20, 5]];
export function oddRounds(phase: number): OddRound[] {
  const world = worldOf(phase);
  const step = stepInWorld(phase);
  // A grade cresce no meio do mundo: o mundo 1 vai de 4 para 6 figuras, etc.
  const [cells, cols] = ODD_GRIDS[Math.min(ODD_GRIDS.length - 1, world - 1 + (step > 5 ? 1 : 0))];
  const rounds = 5 + Math.floor((step - 1) / 5); // 5 ou 6
  const pairs = ODD_BY_LEVEL[world].pairs;
  return Array.from({ length: rounds }, (_, i) => pairs[i % pairs.length])
    .sort(() => Math.random() - 0.5)
    .map(([same, odd]) => {
      const [a, b] = Math.random() < 0.5 ? [same, odd] : [odd, same];
      const oddIndex = randInt(0, cells - 1);
      return { cells: Array.from({ length: cells }, (_, k) => (k === oddIndex ? b : a)), oddIndex, cols, same: a, odd: b };
    });
}

// ----- Vamos Contar ----------------------------------------------------------

export interface CountRound {
  kind: "count" | "add" | "sub";
  emoji: string;
  a: number;
  b: number;
  answer: number;
  options: number[];
  prompt: string;
}
/** Mundo 1: contar até 5–10. Mundo 2: contar até 11–20. Mundo 3: somas. Mundo 4: subtrações. Mundo 5: misturado até 20. */
export function countRounds(phase: number): CountRound[] {
  const world = worldOf(phase);
  const step = stepInWorld(phase);
  const rounds = 5 + Math.floor((step - 1) / 4); // 5, 6 ou 7
  const emojis = shuffle(COUNT_EMOJIS);
  return Array.from({ length: rounds }, (_, i) => {
    const emoji = emojis[i % emojis.length];
    const kind = world <= 2 ? "count" : world === 3 ? "add" : world === 4 ? "sub" : Math.random() < 0.5 ? "add" : "sub";
    if (kind === "count") {
      const max = world === 1 ? 4 + Math.ceil(step / 2) : 10 + step;
      const a = randInt(world === 1 ? 1 : 6, max);
      return { kind, emoji, a, b: 0, answer: a, options: numberOptions(a), prompt: `Quantos ${emoji} você vê?` };
    }
    if (kind === "add") {
      const maxTotal = world === 3 ? 5 + step : 20;
      const total = randInt(3, maxTotal);
      const a = randInt(1, total - 1);
      const b = total - a;
      return { kind, emoji, a, b, answer: total, options: numberOptions(total), prompt: `${a} mais ${b}. Quantos ${emoji} ao todo?` };
    }
    const maxStart = world === 4 ? 6 + step : 20;
    const a = randInt(4, maxStart);
    const b = randInt(1, Math.min(world === 4 ? 3 + Math.floor(step / 3) : 9, a - 1));
    return { kind, emoji, a, b, answer: a - b, options: numberOptions(a - b), prompt: `Tinha ${a} ${emoji}. ${b} foram embora. Quantos ficaram?` };
  });
}

// ----- Separar e Organizar ---------------------------------------------------

/** Cada mundo alterna entre dois conjuntos; nas fases finais do mundo, todas as figuras aparecem. */
export function sortRound(phase: number): SortSet {
  const world = worldOf(phase);
  const step = stepInWorld(phase);
  const set = step % 2 === 1 ? SORT_BY_LEVEL[world] : SORT_EXTRA_BY_TIER[world];
  const perCategory = Math.ceil(set.items.length / set.categories.length);
  const take = step <= 4 ? Math.max(2, perCategory - 1) : perCategory;
  const chosen = set.categories.flatMap((_, c) => shuffle(set.items.filter((it) => it.category === c)).slice(0, take));
  return { ...set, items: shuffle(chosen) };
}

// ----- Passo a Passo ----------------------------------------------------------

export interface OrderRound {
  routine: Routine;
  shuffled: number[];
}
const ORDER_SIZE_BY_WORLD = [3, 3, 4, 4, 5];
export function orderRounds(phase: number): OrderRound[] {
  const world = worldOf(phase);
  const step = stepInWorld(phase);
  const size = ORDER_SIZE_BY_WORLD[world - 1];
  // A partir do mundo 2, metade final do mundo mistura tarefas do tamanho anterior.
  const pool = [...ROUTINES_BY_SIZE[size], ...(world >= 2 && step > 5 ? ROUTINES_BY_SIZE[Math.max(3, size - 1)] : [])];
  const rounds = Math.min(pool.length, 3 + Math.floor((step - 1) / 4)); // 3 a 5
  return shuffle(pool)
    .slice(0, rounds)
    .map((routine) => {
      const idx = routine.steps.map((_, i) => i);
      let shuffled = shuffle(idx);
      while (shuffled.every((v, i) => v === i)) shuffled = shuffle(idx);
      return { routine, shuffled };
    });
}

// ----- Respiração (10 fases) -------------------------------------------------

export function breathingConfig(phase: number) {
  const p = Math.min(10, Math.max(1, phase));
  return { cycles: 2 + p, inhale: 4, hold: p >= 7 ? 3 : 2, exhale: p >= 4 ? 6 : 5 };
}
