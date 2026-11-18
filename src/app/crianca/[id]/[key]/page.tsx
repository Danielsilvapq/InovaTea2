import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { db } from "@/lib/db";
import { getActivity } from "@/lib/activities";
import { memoryPairs, quizRound, sequenceConfig } from "@/lib/generators";
import { PhaseMap } from "@/components/kid/PhaseMap";
import { AacActivity } from "@/components/kid/AacActivity";
import { phrasesFromSessions } from "@/lib/aac";
import { unlockedLevel } from "@/lib/stats";
import { UNLOCK_ACCURACY } from "@/lib/gamification";
import { QuizGame } from "@/components/kid/QuizGame";
import { MemoryGame } from "@/components/kid/MemoryGame";
import { SequenceGame } from "@/components/kid/SequenceGame";
import { BreathingActivity } from "@/components/kid/BreathingActivity";
import { ChatActivity } from "@/components/kid/ChatActivity";
import { OddGame } from "@/components/kid/OddGame";
import { CountGame } from "@/components/kid/CountGame";
import { SortGame } from "@/components/kid/SortGame";
import { OrderGame } from "@/components/kid/OrderGame";

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

  if (activity.type === "AAC" || activity.type === "CHAT") {
    const [aacItems, aacSessions] = await Promise.all([
      db.aacItem.findMany({ where: { patientId: id }, orderBy: { createdAt: "asc" } }),
      db.activitySession.findMany({ where: { patientId: id, activityKey: "minhavoz" }, orderBy: { startedAt: "desc" }, take: 20 }),
    ]);
    const recent = [...new Set(phrasesFromSessions(aacSessions).map((p) => p.text))].slice(0, 8);
    if (activity.type === "AAC") return <AacActivity patientId={id} customItems={aacItems} recent={recent} />;
    return <ChatActivity patientId={id} childName={patient.name.split(" ")[0]} customItems={aacItems} recent={recent} />;
  }

  const sessions = await db.activitySession.findMany({
    where: { patientId: id, activityKey: key },
    select: { activityKey: true, level: true, accuracy: true, completed: true },
  });
  const unlocked = unlockedLevel(sessions, key);
  const level = Number(nivel);

  if (!level || level < 1 || level > unlocked) {
    return (
      <div className="card stack" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="center">
          <div style={{ fontSize: "4rem" }}>{activity.emoji}</div>
          <h1>{activity.title}</h1>
          <p style={{ fontSize: "1.15rem" }}>{activity.description}</p>
        </div>
        <PhaseMap baseHref={`/crianca/${id}/${key}`} total={activity.levels} unlocked={unlocked} />
        <p className="small muted center">Para abrir a próxima fase, acerte {Math.round(UNLOCK_ACCURACY * 100)}% ou mais.</p>
        <div className="center">
          <Link href={`/crianca/${id}`} className="btn btn-secondary">
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  if (activity.type === "QUIZ") {
    const questions = quizRound(key, level);
    if (!questions.length) notFound();
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
  if (activity.type === "BREATHING") {
    return <BreathingActivity key={level} patientId={id} reduceMotion={patient.reduceMotion} level={level} />;
  }
  if (activity.type === "ODD") return <OddGame key={level} patientId={id} level={level} soundOn={patient.soundOn} />;
  if (activity.type === "COUNT") return <CountGame key={level} patientId={id} level={level} soundOn={patient.soundOn} />;
  if (activity.type === "SORT") return <SortGame key={level} patientId={id} level={level} soundOn={patient.soundOn} />;
  if (activity.type === "ORDER") return <OrderGame key={level} patientId={id} level={level} soundOn={patient.soundOn} />;
  if (activity.type === "MEMORY") {
    return <MemoryGame key={level} patientId={id} level={level} pairs={memoryPairs(level)} soundOn={patient.soundOn} />;
  }
  return <SequenceGame key={level} patientId={id} level={level} length={sequenceConfig(level).length} soundOn={patient.soundOn} />;
}
