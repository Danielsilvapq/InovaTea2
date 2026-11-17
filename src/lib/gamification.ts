// Regras de pontos e níveis. Compartilhado entre servidor e cliente.

export const LEVEL_TITLES = [
  { emoji: "🌱", title: "Semente" },
  { emoji: "🌿", title: "Broto" },
  { emoji: "🌳", title: "Árvore" },
  { emoji: "⭐", title: "Estrela" },
  { emoji: "🌙", title: "Lua" },
  { emoji: "🚀", title: "Foguete" },
  { emoji: "🪐", title: "Planeta" },
  { emoji: "🌌", title: "Galáxia" },
];

/** Pontos necessários para sair do nível `level` e ir para o próximo. */
export function pointsForLevel(level: number) {
  return 100 + (level - 1) * 60;
}

export function levelInfo(totalPoints: number) {
  let level = 1;
  let remaining = Math.max(0, totalPoints);
  while (remaining >= pointsForLevel(level)) {
    remaining -= pointsForLevel(level);
    level++;
  }
  const needed = pointsForLevel(level);
  const t = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return {
    level,
    current: remaining,
    needed,
    progress: remaining / needed,
    emoji: t.emoji,
    title: t.title,
  };
}

/** Acerto mínimo para liberar o próximo nível de uma atividade. */
export const UNLOCK_ACCURACY = 0.7;
export const MAX_ACTIVITY_LEVEL = 3;

export function computePoints(input: {
  activityType: string;
  correct: number;
  total: number;
  level: number;
  completed: boolean;
  messages?: number;
}) {
  if (input.activityType === "CHAT") {
    return Math.min(60, (input.messages ?? 0) * 6);
  }
  if (input.activityType === "BREATHING") {
    return input.completed ? 30 : 10;
  }
  const base = input.correct * 10 * input.level;
  const bonus = input.completed ? 20 : 0;
  const perfect = input.completed && input.total > 0 && input.correct === input.total ? 15 : 0;
  return base + bonus + perfect;
}

/** Mensagem gentil e literal ao final de uma atividade. */
export function feedbackMessage(accuracy: number) {
  if (accuracy >= 0.9) return "Você foi muito bem! Parabéns!";
  if (accuracy >= UNLOCK_ACCURACY) return "Muito bom! Você está aprendendo cada vez mais.";
  if (accuracy >= 0.4) return "Bom trabalho! Treinar mais um pouco ajuda.";
  return "Obrigado por tentar! Podemos tentar de novo quando você quiser.";
}
