import type { ActivitySession } from "@prisma/client";
import { ACTIVITIES, getActivity } from "./activities";
import { MAX_ACTIVITY_LEVEL, UNLOCK_ACCURACY } from "./gamification";

/** Maior nível liberado numa atividade (com base nas sessões concluídas). */
export function unlockedLevel(sessions: Pick<ActivitySession, "activityKey" | "level" | "accuracy" | "completed">[], key: string) {
  const max = Math.min(MAX_ACTIVITY_LEVEL, getActivity(key)?.levels ?? 1);
  let unlocked = 1;
  for (const s of sessions) {
    if (s.activityKey === key && s.completed && s.accuracy >= UNLOCK_ACCURACY) {
      unlocked = Math.max(unlocked, Math.min(max, s.level + 1));
    }
  }
  return unlocked;
}

export function age(birthDate: Date) {
  const now = new Date();
  let a = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) a--;
  return a;
}

export function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}min ${s}s` : `${m}min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function buildStats(sessions: ActivitySession[]) {
  const sorted = [...sessions].sort((a, b) => +a.startedAt - +b.startedAt);
  // Conversas não têm acerto/erro: ficam fora das médias de acerto.
  const isScored = (s: ActivitySession) => s.total > 0 && s.activityType !== "CHAT";
  const scored = sorted.filter(isScored);
  const totalSec = sorted.reduce((acc, s) => acc + s.durationSec, 0);
  const avgAccuracy = scored.length ? scored.reduce((a, s) => a + s.accuracy, 0) / scored.length : 0;

  // Dias seguidos com pelo menos uma sessão (até hoje ou ontem)
  const days = new Set(sorted.map((s) => dayKey(s.startedAt)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const perActivity = ACTIVITIES.map((a) => {
    const list = sorted.filter((s) => s.activityKey === a.key);
    const withScore = list.filter(isScored);
    const recent = withScore.slice(-5);
    const previous = withScore.slice(-10, -5);
    const mean = (xs: ActivitySession[]) => (xs.length ? xs.reduce((x, s) => x + s.accuracy, 0) / xs.length : null);
    const recentAvg = mean(recent);
    const prevAvg = mean(previous);
    return {
      activity: a,
      count: list.length,
      totalSec: list.reduce((x, s) => x + s.durationSec, 0),
      points: list.reduce((x, s) => x + s.points, 0),
      level: unlockedLevel(list, a.key),
      avgAccuracy: mean(withScore),
      lastAccuracy: withScore.at(-1)?.accuracy ?? null,
      trend: recentAvg !== null && prevAvg !== null ? recentAvg - prevAvg : null,
      lastAt: list.at(-1)?.startedAt ?? null,
    };
  });

  // Últimos 14 dias: minutos por dia
  const minutesByDay: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const sec = sorted.filter((s) => dayKey(s.startedAt) === k).reduce((x, s) => x + s.durationSec, 0);
    minutesByDay.push({
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: Math.round((sec / 60) * 10) / 10,
    });
  }

  // Acerto nas últimas 20 sessões pontuadas
  const accuracyTimeline = scored.slice(-20).map((s) => ({
    label: `${s.startedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · ${
      ACTIVITIES.find((a) => a.key === s.activityKey)?.title ?? s.activityKey
    } (nível ${s.level})`,
    value: Math.round(s.accuracy * 100),
  }));

  const moods = sorted.filter((s) => s.mood).slice(-10).map((s) => s.mood as string);

  return {
    count: sorted.length,
    totalSec,
    avgAccuracy,
    streak,
    perActivity,
    minutesByDay,
    accuracyTimeline,
    moods,
  };
}

export const MOODS: Record<string, { emoji: string; label: string }> = {
  feliz: { emoji: "😄", label: "Feliz" },
  calmo: { emoji: "😌", label: "Calmo" },
  ok: { emoji: "🙂", label: "Mais ou menos" },
  cansado: { emoji: "🥱", label: "Cansado" },
  chateado: { emoji: "😣", label: "Chateado" },
};
