import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { db } from "@/lib/db";
import { ACTIVITIES } from "@/lib/activities";
import { unlockedLevel } from "@/lib/stats";
import { ProgressBar } from "@/components/ProgressBar";
import { achievementStates, goalStates } from "@/lib/achievements";

export default async function KidHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getKidPatient(id);
  if (!patient) notFound();
  const sessions = await db.activitySession.findMany({
    where: { patientId: id },
  });
  const goals = await db.goal.findMany({ where: { patientId: id, active: true } });
  const medals = achievementStates(sessions);
  const got = medals.filter((m) => m.earnedAt).length;
  const openGoals = goalStates(goals, sessions).filter((g) => !g.earnedAt);
  const today = new Date().toDateString();
  const todaySessions = sessions.filter((s) => s.startedAt.toDateString() === today);
  const todayGoal = 3;

  return (
    <div className="stack">
      <div className="card stack">
        <h1 style={{ margin: 0 }}>O que vamos fazer agora?</h1>
        <ProgressBar
          value={Math.min(1, todaySessions.length / todayGoal)}
          tone="sage"
          label="Meta de hoje: 3 atividades"
          rightLabel={`${Math.min(todaySessions.length, todayGoal)} de ${todayGoal}`}
        />
        {todaySessions.length >= todayGoal && <div className="ok-box">🌟 Você completou a meta de hoje! Parabéns!</div>}
      </div>

      <Link href={`/crianca/${id}/conquistas`} className="card stack trophy-link">
        <div className="row between">
          <strong style={{ fontSize: "1.2rem" }}>🏅 Minhas conquistas</strong>
          <span className="badge badge-primary">Ver todas →</span>
        </div>
        <ProgressBar value={got / medals.length} tone="primary" label="Medalhas" rightLabel={`${got} de ${medals.length}`} />
        {openGoals.length > 0 && (
          <span className="small">
            🎯 {openGoals.length === 1 ? "1 meta do terapeuta em andamento" : `${openGoals.length} metas do terapeuta em andamento`}:{" "}
            {openGoals.map((g) => `${g.goal.emoji} ${g.goal.title} (${g.current} de ${g.target})`).join(" · ")}
          </span>
        )}
      </Link>

      <div className="grid grid-3">
        {[...ACTIVITIES]
          // Para quem fala pouco ou não fala, a Minha Voz vem primeiro.
          .sort((x, y) => (patient.communication !== "VERBAL" ? Number(y.type === "AAC") - Number(x.type === "AAC") : 0))
          .map((a) => {
          const level = unlockedLevel(sessions, a.key);
          const count = sessions.filter((s) => s.activityKey === a.key).length;
          return (
            <Link key={a.key} href={`/crianca/${id}/${a.key}`} className={`activity-card tone-${a.color}`}>
              <span className="big" aria-hidden>
                {a.emoji}
              </span>
              <strong style={{ fontSize: "1.2rem" }}>{a.title}</strong>
              <span className="small">{a.description}</span>
              {a.levels > 1 ? (
                <ProgressBar
                  value={level / a.levels}
                  tone="primary"
                  label={`Fase ${level} de ${a.levels}`}
                  rightLabel={`${count}x jogado`}
                />
              ) : (
                <span className="small muted">{count}x feito</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
