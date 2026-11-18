import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { LevelBar } from "@/components/LevelBar";
import { HoldToExit } from "@/components/kid/HoldToExit";
import { KidSettingsProvider } from "@/components/kid/KidSettings";
import type { KidSettings } from "@/lib/accessibility";

export default async function KidLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getKidPatient(id);
  if (!patient) notFound();
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
          <div className="kid-exit">
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
