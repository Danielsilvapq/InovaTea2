import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { db } from "@/lib/db";
import { getActivity, getQuiz, MEMORY_PAIRS_BY_LEVEL, SEQUENCE_LENGTH_BY_LEVEL } from "@/lib/activities";
import { unlockedLevel } from "@/lib/stats";
import { UNLOCK_ACCURACY } from "@/lib/gamification";
import { QuizGame } from "@/components/kid/QuizGame";
import { MemoryGame } from "@/components/kid/MemoryGame";
import { SequenceGame } from "@/components/kid/SequenceGame";
import { BreathingActivity } from "@/components/kid/BreathingActivity";
import { ChatActivity } from "@/components/kid/ChatActivity";

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; key: string }>;
  searchParams: Promise<{ nivel?: string }>;
}) {
  const { id, key } = await params;
  const { nivel } = await searchParams;
  const patient = await getKidPatient(id);
  const activity = getActivity(key);
  if (!patient || !activity) notFound();

  if (activity.type === "BREATHING") return <BreathingActivity patientId={id} reduceMotion={patient.reduceMotion} />;
  if (activity.type === "CHAT") return <ChatActivity patientId={id} childName={patient.name.split(" ")[0]} />;

  const sessions = await db.activitySession.findMany({
    where: { patientId: id, activityKey: key },
    select: { activityKey: true, level: true, accuracy: true, completed: true },
  });
  const unlocked = unlockedLevel(sessions, key);
  const level = Number(nivel);

  if (!level || level < 1 || level > unlocked) {
    return (
      <div className="card stack center" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: "4rem" }}>{activity.emoji}</div>
        <h1>{activity.title}</h1>
        <p style={{ fontSize: "1.15rem" }}>{activity.description}</p>
        <h2>Escolha o nível</h2>
        <div className="option-grid">
          {Array.from({ length: activity.levels }, (_, i) => i + 1).map((l) =>
            l <= unlocked ? (
              <Link key={l} href={`/crianca/${id}/${key}?nivel=${l}`} className="option" style={{ textDecoration: "none" }}>
                <span className="emoji">{["🌱", "🌿", "🌳"][l - 1]}</span>
                Nível {l}
              </Link>
            ) : (
              <div key={l} className="option" style={{ opacity: 0.55, cursor: "default" }} aria-disabled>
                <span className="emoji">🔒</span>
                Nível {l}
                <span className="small muted">Acerte {Math.round(UNLOCK_ACCURACY * 100)}% no nível {l - 1}</span>
              </div>
            ),
          )}
        </div>
        <Link href={`/crianca/${id}`} className="btn btn-secondary">
          ← Voltar
        </Link>
      </div>
    );
  }

  if (activity.type === "QUIZ") {
    const questions = getQuiz(key, level);
    if (!questions) notFound();
    return (
      <QuizGame
        key={`${key}-${level}`}
        patientId={id}
        activityKey={key}
        title={activity.title}
        emoji={activity.emoji}
        level={level}
        questions={questions}
        soundOn={patient.soundOn}
      />
    );
  }
  if (activity.type === "MEMORY") {
    return <MemoryGame key={level} patientId={id} level={level} pairs={MEMORY_PAIRS_BY_LEVEL[level]} soundOn={patient.soundOn} />;
  }
  return <SequenceGame key={level} patientId={id} level={level} length={SEQUENCE_LENGTH_BY_LEVEL[level]} soundOn={patient.soundOn} />;
}
