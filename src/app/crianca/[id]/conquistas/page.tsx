import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { db } from "@/lib/db";
import { achievementStates, goalStates } from "@/lib/achievements";
import { ProgressBar } from "@/components/ProgressBar";
import { GoalCards, Trails } from "@/components/Achievements";

export default async function ConquistasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getKidPatient(id);
  if (!patient) notFound();
  const [sessions, goals] = await Promise.all([
    db.activitySession.findMany({ where: { patientId: id } }),
    db.goal.findMany({ where: { patientId: id, active: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const states = achievementStates(sessions);
  const got = states.filter((s) => s.earnedAt).length;
  const goalList = goalStates(goals, sessions);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row between">
          <h1 style={{ margin: 0 }}>🏅 Minhas conquistas</h1>
          <Link href={`/crianca/${id}`} className="btn btn-secondary">
            🏠 Voltar ao início
          </Link>
        </div>
        <ProgressBar value={got / states.length} tone="primary" label="Medalhas conquistadas" rightLabel={`${got} de ${states.length}`} />
      </div>

      {goalList.length > 0 && (
        <section className="stack">
          <h2 style={{ margin: 0 }}>🎯 Metas do meu terapeuta</h2>
          <GoalCards goals={goalList} />
        </section>
      )}

      <Trails states={states} />
    </div>
  );
}
