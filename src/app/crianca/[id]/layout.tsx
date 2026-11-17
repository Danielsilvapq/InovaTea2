import { notFound } from "next/navigation";
import { getKidPatient } from "@/lib/kid-access";
import { LevelBar } from "@/components/LevelBar";
import { HoldToExit } from "@/components/kid/HoldToExit";

export default async function KidLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getKidPatient(id);
  if (!patient) notFound();
  return (
    <div
      className={`kid ${patient.reduceMotion ? "reduce-motion" : ""}`}
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
  );
}
