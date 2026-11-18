import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { LevelBar } from "@/components/LevelBar";
import { HoldToExit } from "@/components/kid/HoldToExit";
import { KidSettingsProvider } from "@/components/kid/KidSettings";
import type { KidSettings } from "@/lib/accessibility";
import { SpeakAnywhere } from "@/components/kid/SpeakAnywhere";
import { db } from "@/lib/db";
import { phrasesFromSessions } from "@/lib/aac";

export default async function KidLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getKidPatient(id);
  if (!patient) notFound();
  const showSpeak = patient.communication !== "VERBAL" || patient.reading === "NONE";
  const [aacItems, aacSessions] = showSpeak
    ? await Promise.all([
        db.aacItem.findMany({ where: { patientId: id }, orderBy: { createdAt: "asc" } }),
        db.activitySession.findMany({ where: { patientId: id, activityKey: "minhavoz" }, orderBy: { startedAt: "desc" }, take: 20 }),
      ])
    : [[], []];
  const recent = [...new Set(phrasesFromSessions(aacSessions).map((p) => p.text))].slice(0, 8);
  const settings = {
    communication: patient.communication,
    reading: patient.reading,
    answerSupport: patient.answerSupport,
    narration: patient.narration,
    bigTargets: patient.bigTargets,
    soundOn: patient.soundOn,
    reduceMotion: patient.reduceMotion,
  } as KidSettings;
  return (
    <KidSettingsProvider value={settings}>
    <div
      className={`kid ${patient.reduceMotion ? "reduce-motion" : ""} ${patient.bigTargets ? "big-targets" : ""}`}
      style={{ ["--font-scale" as string]: String(patient.fontScale / 100), fontSize: `${patient.fontScale}%` }}
    >
      <header className="kid-header">
        <div className="container">
          <div className="avatar kid-avatar">{patient.avatar}</div>
          <div className="kid-hello">Olá, {patient.name.split(" ")[0]}!</div>
          <div className="kid-level">
            <LevelBar points={patient.totalPoints} />
          </div>
          <div className="kid-exit row" style={{ gap: 8 }}>
            {showSpeak && <SpeakAnywhere patientId={patient.id} customItems={aacItems} recent={recent} />}
            <HoldToExit href={`/paciente/${patient.id}`} />
          </div>
        </div>
      </header>
      <main>
        <div className="container">{children}</div>
      </main>
    </div>
    </KidSettingsProvider>
  );
}
