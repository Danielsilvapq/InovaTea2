// Trilha de conquistas e metas personalizadas.
// Tudo é calculado a partir das sessões já registradas: nada é guardado à
// parte, então as medalhas nunca ficam fora de sincronia e nunca são perdidas.

import { getActivity } from "./activities";

export interface SessionLike {
  id?: string;
  activityKey: string;
  activityType: string;
  level: number;
  accuracy: number;
  completed: boolean;
  total: number;
  startedAt: Date | string;
}

type Measure =
  | { kind: "count"; filter: (s: SessionLike) => boolean; target: number }
  | { kind: "days"; filter: (s: SessionLike) => boolean; target: number }
  | { kind: "streak"; target: number }
  | { kind: "distinct"; filter: (s: SessionLike) => boolean; target: number };

export interface AchievementDef {
  id: string;
  track: string;
  emoji: string;
  title: string;
  goal: string; // o que a criança precisa fazer, em linguagem literal
  measure: Measure;
}

export const TRACKS = [
  { id: "emocoes", title: "Emoções", emoji: "😊" },
  { id: "calma", title: "Calma", emoji: "🎈" },
  { id: "social", title: "Social", emoji: "🤝" },
  { id: "rotina", title: "Rotina", emoji: "🗓️" },
  { id: "atencao", title: "Atenção", emoji: "🧠" },
  { id: "numeros", title: "Números", emoji: "🔢" },
  { id: "constancia", title: "Constância", emoji: "📅" },
];

const done = (key: string, minLevel = 1, minAcc = 0) => (s: SessionLike) =>
  s.activityKey === key && s.completed && s.level >= minLevel && s.accuracy >= minAcc;
const perfect = (key: string, minLevel = 1) => (s: SessionLike) =>
  s.activityKey === key && s.completed && s.level >= minLevel && s.total > 0 && s.accuracy >= 1;
const once = (filter: (s: SessionLike) => boolean): Measure => ({ kind: "count", filter, target: 1 });
const PASS = 0.7;

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "emo-1", track: "emocoes", emoji: "🙂", title: "Primeira carinha", goal: "Terminar o Quiz das Emoções 1 vez", measure: once(done("emocoes")) },
  { id: "emo-2", track: "emocoes", emoji: "🕵️", title: "Detetive das emoções", goal: "Passar da fase 20 das Emoções", measure: once(done("emocoes", 20, PASS)) },
  { id: "emo-3", track: "emocoes", emoji: "💖", title: "Mestre das emoções", goal: "Passar da fase 50 das Emoções", measure: once(done("emocoes", 50, PASS)) },

  { id: "cal-1", track: "calma", emoji: "🌬️", title: "Primeiro respiro", goal: "Terminar a respiração 1 vez", measure: once(done("respiracao")) },
  { id: "cal-2", track: "calma", emoji: "🍃", title: "Respiro de 3 dias", goal: "Terminar a respiração em 3 dias diferentes", measure: { kind: "days", filter: done("respiracao"), target: 3 } },
  { id: "cal-3", track: "calma", emoji: "🎈", title: "Balão tranquilo", goal: "Terminar a fase 10 da respiração", measure: once(done("respiracao", 10)) },

  { id: "soc-1", track: "social", emoji: "💬", title: "Bom papo", goal: "Mandar 5 mensagens ao TeaBot numa conversa", measure: once((s) => s.activityKey === "conversa" && s.total >= 5) },
  { id: "soc-2", track: "social", emoji: "🤝", title: "Amigo gentil", goal: "Passar da fase 20 das Situações do Dia a Dia", measure: once(done("social", 20, PASS)) },
  { id: "soc-3", track: "social", emoji: "🗝️", title: "Entendo expressões", goal: "Passar da fase 50 das Situações do Dia a Dia", measure: once(done("social", 50, PASS)) },

  { id: "rot-1", track: "rotina", emoji: "🌅", title: "Dia organizado", goal: "Passar da fase 10 da Minha Rotina", measure: once(done("rotina", 10, PASS)) },
  { id: "rot-2", track: "rotina", emoji: "🪜", title: "Passo certo", goal: "Acertar todas as tarefas no Passo a Passo", measure: once(perfect("passos")) },
  { id: "rot-3", track: "rotina", emoji: "🧭", title: "Planejador", goal: "Passar da fase 50 do Passo a Passo", measure: once(done("passos", 50, PASS)) },

  { id: "ate-1", track: "atencao", emoji: "🦅", title: "Olho de águia", goal: "Acertar todas no Encontre o Diferente", measure: once(perfect("diferente")) },
  { id: "ate-2", track: "atencao", emoji: "🐘", title: "Memória de elefante", goal: "Terminar a fase 50 do Jogo da Memória", measure: once(done("memoria", 50)) },
  { id: "ate-3", track: "atencao", emoji: "🔷", title: "Sequência perfeita", goal: "Acertar todas as rodadas na fase 30 da Sequência", measure: once(perfect("sequencia", 30)) },

  { id: "num-1", track: "numeros", emoji: "🔢", title: "Sei contar", goal: "Passar da fase 1 do Vamos Contar", measure: once(done("contar", 1, PASS)) },
  { id: "num-2", track: "numeros", emoji: "🔟", title: "Até dez", goal: "Passar da fase 10 do Vamos Contar", measure: once(done("contar", 10, PASS)) },
  { id: "num-3", track: "numeros", emoji: "➕", title: "Faço contas", goal: "Passar da fase 50 do Vamos Contar", measure: once(done("contar", 50, PASS)) },

  { id: "con-1", track: "constancia", emoji: "📅", title: "3 dias seguidos", goal: "Fazer atividades 3 dias seguidos", measure: { kind: "streak", target: 3 } },
  { id: "con-2", track: "constancia", emoji: "🗓️", title: "7 dias seguidos", goal: "Fazer atividades 7 dias seguidos", measure: { kind: "streak", target: 7 } },
  { id: "con-3", track: "constancia", emoji: "🏆", title: "30 atividades", goal: "Terminar 30 atividades", measure: { kind: "count", filter: (s) => s.completed, target: 30 } },
  { id: "con-4", track: "constancia", emoji: "🗺️", title: "Explorador", goal: "Experimentar 8 atividades diferentes", measure: { kind: "distinct", filter: (s) => s.completed, target: 8 } },
];

const dayKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};
const dayNumber = (d: Date | string) => {
  const x = new Date(d);
  return Math.floor(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 864e5);
};

/** Percorre as sessões em ordem e devolve o progresso e quando a meta foi atingida. */
function evaluate(measure: Measure, sessions: SessionLike[]) {
  let current = 0;
  let earnedAt: string | null = null;
  let earnedSessionId: string | null = null;
  const days = new Set<string>();
  const keys = new Set<string>();
  let streak = 0;
  let lastDay: number | null = null;

  for (const s of sessions) {
    if (measure.kind === "count") {
      if (measure.filter(s)) current++;
    } else if (measure.kind === "days") {
      if (measure.filter(s)) days.add(dayKey(s.startedAt));
      current = days.size;
    } else if (measure.kind === "distinct") {
      if (measure.filter(s)) keys.add(s.activityKey);
      current = keys.size;
    } else {
      const d = dayNumber(s.startedAt);
      if (lastDay === null || d > lastDay) {
        streak = lastDay !== null && d === lastDay + 1 ? streak + 1 : 1;
        lastDay = d;
      }
      current = Math.max(current, streak);
    }
    if (!earnedAt && current >= measure.target) {
      earnedAt = new Date(s.startedAt).toISOString();
      earnedSessionId = s.id ?? null;
    }
  }
  return { current: Math.min(current, measure.target), target: measure.target, earnedAt, earnedSessionId };
}

const byDate = (sessions: SessionLike[]) =>
  [...sessions].sort((a, b) => +new Date(a.startedAt) - +new Date(b.startedAt));

export interface AchievementState {
  def: AchievementDef;
  current: number;
  target: number;
  earnedAt: string | null;
  earnedSessionId: string | null;
}

export function achievementStates(sessions: SessionLike[]): AchievementState[] {
  const sorted = byDate(sessions);
  return ACHIEVEMENTS.map((def) => ({ def, ...evaluate(def.measure, sorted) }));
}

// ---------------------------------------------------------------------------
// Metas criadas pelo profissional
// ---------------------------------------------------------------------------

export type GoalKind = "SESSIONS" | "DAYS" | "ACCURACY" | "LEVEL";

export interface GoalLike {
  id: string;
  title: string;
  emoji: string;
  note?: string | null;
  kind: GoalKind | string;
  activityKey?: string | null; // vazio = qualquer atividade
  target: number;
  minAccuracy?: number | null; // 0..1, usado em ACCURACY
  level?: number | null; // usado em LEVEL
  dueDate?: Date | string | null;
  createdAt: Date | string;
  active: boolean;
}

export const GOAL_KINDS: { value: GoalKind; label: string }[] = [
  { value: "SESSIONS", label: "Terminar a atividade um número de vezes" },
  { value: "DAYS", label: "Fazer a atividade em dias diferentes" },
  { value: "ACCURACY", label: "Acertar uma porcentagem mínima um número de vezes" },
  { value: "LEVEL", label: "Chegar a uma fase da atividade" },
];

/** Descrição literal da meta, mostrada para a criança e para os adultos. */
export function describeGoal(g: GoalLike) {
  const act = g.activityKey ? getActivity(g.activityKey)?.title ?? g.activityKey : "qualquer atividade";
  switch (g.kind) {
    case "DAYS":
      return `Fazer ${act} em ${g.target} dias diferentes`;
    case "ACCURACY":
      return `Acertar pelo menos ${Math.round((g.minAccuracy ?? 0.7) * 100)}% em ${act}, ${g.target} ${g.target === 1 ? "vez" : "vezes"}`;
    case "LEVEL":
      return `Terminar a fase ${g.level ?? 1} de ${act}`;
    default:
      return `Terminar ${act} ${g.target} ${g.target === 1 ? "vez" : "vezes"}`;
  }
}

function goalMeasure(g: GoalLike): Measure {
  const matches = (s: SessionLike) => s.completed && (!g.activityKey || s.activityKey === g.activityKey);
  switch (g.kind) {
    case "DAYS":
      return { kind: "days", filter: matches, target: g.target };
    case "ACCURACY":
      return { kind: "count", filter: (s) => matches(s) && s.total > 0 && s.accuracy >= (g.minAccuracy ?? 0.7), target: g.target };
    case "LEVEL":
      return { kind: "count", filter: (s) => matches(s) && s.level >= (g.level ?? 1), target: 1 };
    default:
      return { kind: "count", filter: matches, target: g.target };
  }
}

export interface GoalState<G extends GoalLike = GoalLike> {
  goal: G;
  description: string;
  current: number;
  target: number;
  earnedAt: string | null;
  earnedSessionId: string | null;
  overdue: boolean;
}

/** Só contam as sessões feitas depois que a meta foi criada. */
export function goalStates<G extends GoalLike>(goals: G[], sessions: SessionLike[]): GoalState<G>[] {
  const sorted = byDate(sessions);
  return goals.map((goal) => {
    const since = +new Date(goal.createdAt);
    const due = goal.dueDate ? +new Date(goal.dueDate) + 864e5 - 1 : null;
    const relevant = sorted.filter((s) => +new Date(s.startedAt) >= since && (due === null || +new Date(s.startedAt) <= due));
    const r = evaluate(goalMeasure(goal), relevant);
    return {
      goal,
      description: describeGoal(goal),
      ...r,
      overdue: !r.earnedAt && due !== null && Date.now() > due,
    };
  });
}

/** Medalhas e metas conquistadas por uma sessão específica (para o aviso no fim da atividade). */
export function newlyEarned(sessionId: string, sessions: SessionLike[], goals: GoalLike[]) {
  return {
    achievements: achievementStates(sessions).filter((a) => a.earnedSessionId === sessionId).map((a) => ({ emoji: a.def.emoji, title: a.def.title })),
    goals: goalStates(goals.filter((g) => g.active), sessions)
      .filter((g) => g.earnedSessionId === sessionId)
      .map((g) => ({ emoji: g.goal.emoji, title: g.goal.title })),
  };
}
