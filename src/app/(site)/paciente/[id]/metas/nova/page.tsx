import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { GoalForm } from "./GoalForm";

export default async function NovaMetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccessiblePatient(id);
  if (!access || !access.isProfessional) notFound();
  return (
    <div className="stack" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Link href={`/paciente/${id}#metas`}>← Voltar ao perfil</Link>
      <div className="card">
        <h1>Nova meta · {access.patient.name}</h1>
        <p className="small muted">
          A meta aparece para a criança na trilha de conquistas, com barra de progresso. Só contam as atividades feitas a partir de hoje.
        </p>
        <GoalForm patientId={id} />
      </div>
    </div>
  );
}
