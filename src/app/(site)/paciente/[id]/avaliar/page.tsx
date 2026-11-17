import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { db } from "@/lib/db";
import { addEvaluation } from "@/app/actions/patients";
import { ActionForm } from "@/components/ActionForm";
import { buildStats, formatDuration } from "@/lib/stats";

const FIELDS = [
  ["communication", "Comunicação", "Expressão verbal/não verbal, iniciativa de comunicação"],
  ["socialInteraction", "Interação social", "Reciprocidade, compartilhamento de atenção, turnos"],
  ["attention", "Atenção", "Permanência na tarefa, atenção sustentada"],
  ["emotionalRegulation", "Regulação emocional", "Manejo de frustração, reconhecimento de emoções"],
  ["autonomy", "Autonomia", "Independência nas atividades e na rotina"],
] as const;

export default async function AvaliarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccessiblePatient(id);
  if (!access || !access.isProfessional) notFound();
  const sessions = await db.activitySession.findMany({ where: { patientId: id } });
  const stats = buildStats(sessions);

  return (
    <div className="stack" style={{ maxWidth: 820, margin: "0 auto" }}>
      <Link href={`/paciente/${id}`}>← Voltar ao perfil</Link>
      <div className="card">
        <h1>Nova avaliação · {access.patient.name}</h1>
        <div className="card-soft small" style={{ marginBottom: 16 }}>
          <strong>Resumo dos dados da plataforma:</strong> {stats.count} sessões ·{" "}
          {formatDuration(stats.totalSec)} de uso · acerto médio {Math.round(stats.avgAccuracy * 100)}% ·{" "}
          {stats.streak} dia(s) seguidos.
        </div>
        <ActionForm action={addEvaluation} submitLabel="Salvar avaliação">
          <input type="hidden" name="patientId" value={id} />
          <p className="small muted">Escala: 1 = precisa de muito apoio · 5 = realiza com independência.</p>
          {FIELDS.map(([name, label, hint]) => (
            <fieldset key={name} className="field" style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
              <legend style={{ fontWeight: 700 }}>
                {label} <span className="hint">— {hint}</span>
              </legend>
              <div className="row">
                {[1, 2, 3, 4, 5].map((v) => (
                  <label key={v} className="card-soft row" style={{ fontWeight: 400, padding: "8px 14px", cursor: "pointer" }}>
                    <input type="radio" name={name} value={v} required defaultChecked={v === 3} style={{ width: "auto", minHeight: 0 }} />
                    {v}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="field">
            <label htmlFor="summary">Parecer / evolução observada</label>
            <textarea id="summary" name="summary" required minLength={10} rows={6} />
          </div>
          <div className="field">
            <label htmlFor="recommendations">Recomendações e próximos passos</label>
            <textarea id="recommendations" name="recommendations" rows={4} />
          </div>
          <label className="row" style={{ fontWeight: 400, marginBottom: 16 }}>
            <input type="checkbox" name="sharedWithGuardian" defaultChecked style={{ width: 22, minHeight: 22 }} />
            Compartilhar esta avaliação com o responsável
          </label>
        </ActionForm>
      </div>
    </div>
  );
}
