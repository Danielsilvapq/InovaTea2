import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActivity } from "@/lib/activities";
import { formatDuration, MOODS } from "@/lib/stats";

interface AnswerDetail {
  question?: string;
  chosen?: string;
  correct?: boolean;
  timeMs?: number;
}

export default async function SessaoPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params;
  const access = await getAccessiblePatient(id);
  if (!access) notFound();
  const s = await db.activitySession.findFirst({
    where: { id: sessionId, patientId: id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!s) notFound();
  const a = getActivity(s.activityKey);
  let details: { answers?: AnswerDetail[]; moves?: number; [k: string]: unknown } = {};
  try {
    details = s.details ? JSON.parse(s.details) : {};
  } catch {}

  return (
    <div className="stack">
      <Link href={`/paciente/${id}`}>← Voltar ao perfil de {access.patient.name}</Link>
      <div className="card">
        <h1>
          {a?.emoji} {a?.title}
        </h1>
        <div className="row small">
          <span className="badge">📅 {s.startedAt.toLocaleString("pt-BR")}</span>
          <span className="badge">⏱ {formatDuration(s.durationSec)}</span>
          <span className="badge">Nível {s.level}</span>
          <span className="badge">⭐ {s.points} pontos</span>
          {s.total > 0 && s.activityType !== "CHAT" && (
            <span className="badge badge-ok">
              {s.correct}/{s.total} acertos ({Math.round(s.accuracy * 100)}%)
            </span>
          )}
          {s.mood && (
            <span className="badge">
              {MOODS[s.mood]?.emoji} {MOODS[s.mood]?.label}
            </span>
          )}
          <span className="badge">{s.completed ? "✅ Concluída" : "⏸ Interrompida"}</span>
        </div>
      </div>

      {details.answers && details.answers.length > 0 && (
        <div className="card table-wrap">
          <h2>Respostas</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Pergunta / rodada</th>
                <th>Resposta</th>
                <th>Resultado</th>
                <th>Tempo</th>
              </tr>
            </thead>
            <tbody>
              {details.answers.map((ans, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{ans.question}</td>
                  <td>{ans.chosen}</td>
                  <td>{ans.correct ? "✅ Acertou" : "🔁 Tentar de novo"}</td>
                  <td>{ans.timeMs ? `${(ans.timeMs / 1000).toFixed(1)}s` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {typeof details.moves === "number" && (
        <div className="card">
          <p>
            Jogadas: <strong>{details.moves}</strong> · Pares: <strong>{String(details.pairs ?? "—")}</strong>
          </p>
        </div>
      )}

      {s.messages.length > 0 && (
        <div className="card">
          <h2>Conversa com o Tito</h2>
          <div className="chat" style={{ maxHeight: "none" }}>
            {s.messages.map((m) => (
              <div key={m.id} className={`bubble ${m.role === "assistant" ? "bot" : "me"}`}>
                {m.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
