import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { db } from "@/lib/db";
import { ACTIVITIES } from "@/lib/activities";
import { unlockedLevel } from "@/lib/stats";
import { ProgressBar } from "@/components/ProgressBar";

export default async function KidHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getKidPatient(id);
  if (!patient) notFound();
  const sessions = await db.activitySession.findMany({
    where: { patientId: id },
    select: { activityKey: true, level: true, accuracy: true, completed: true, startedAt: true, durationSec: true },
  });
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

      <div className="grid grid-3">
        {ACTIVITIES.map((a) => {
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
                  label={`Nível ${level} de ${a.levels}`}
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
