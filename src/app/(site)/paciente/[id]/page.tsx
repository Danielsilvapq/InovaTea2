import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildStats, age, formatDuration, MOODS } from "@/lib/stats";
import { getActivity } from "@/lib/activities";
import { LevelBar } from "@/components/LevelBar";
import { ProgressBar } from "@/components/ProgressBar";
import { LineChart, BarChart } from "@/components/Charts";
import { ActionForm } from "@/components/ActionForm";
import { addComment, toggleGoal, unlinkProfessional } from "@/app/actions/patients";
import { achievementStates, goalStates } from "@/lib/achievements";
import { communicationLabel, readingLabel, supportLabel } from "@/lib/accessibility";

const EVAL_FIELDS = [
  ["communication", "Comunicação"],
  ["socialInteraction", "Interação social"],
  ["attention", "Atenção"],
  ["emotionalRegulation", "Regulação emocional"],
  ["autonomy", "Autonomia"],
] as const;

function Dots({ value }: { value: number }) {
  return (
    <span className="score-dots" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= value ? "on" : ""} />
      ))}
    </span>
  );
}

export default async function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccessiblePatient(id);
  if (!access) notFound();
  const { patient, isGuardian, isProfessional } = access;

  const [sessions, evaluations, comments, professionals, goals] = await Promise.all([
    db.activitySession.findMany({ where: { patientId: id }, orderBy: { startedAt: "desc" } }),
    db.evaluation.findMany({
      where: { patientId: id, ...(isGuardian ? { sharedWithGuardian: true } : {}) },
      include: { professional: { select: { name: true, specialty: true, registryNumber: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.comment.findMany({
      where: { patientId: id },
      include: { author: { select: { name: true, role: true, specialty: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.professionalLink.findMany({
      where: { patientId: id },
      include: { professional: { select: { id: true, name: true, specialty: true, registryNumber: true } } },
    }),
    db.goal.findMany({
      where: { patientId: id },
      include: { professional: { select: { name: true } } },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  const stats = buildStats(sessions);
  const medals = achievementStates(sessions);
  const earnedMedals = medals.filter((m) => m.earnedAt).sort((a, b) => +new Date(b.earnedAt!) - +new Date(a.earnedAt!));
  const nextMedals = medals.filter((m) => !m.earnedAt).sort((a, b) => b.current / b.target - a.current / a.target).slice(0, 4);
  const goalList = goalStates(goals, sessions);

  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <div className="row">
            <div className="avatar" style={{ width: 72, height: 72, fontSize: "2.8rem" }}>
              {patient.avatar}
            </div>
            <div>
              <h1 style={{ margin: 0 }}>{patient.name}</h1>
              <div className="muted small">
                {age(patient.birthDate)} anos
                {patient.supportLevel ? ` · Nível de suporte ${patient.supportLevel}` : ""} · Responsável:{" "}
                {patient.guardian.name}
                {patient.guardian.relationship ? ` (${patient.guardian.relationship})` : ""}
              </div>
              {patient.interests && <div className="small">⭐ Interesses: {patient.interests}</div>}
              <div className="row small" style={{ gap: 6, marginTop: 6 }}>
                <span className="badge">🗣️ {communicationLabel(patient.communication)}</span>
                <span className="badge">📖 {readingLabel(patient.reading)}</span>
                <span className="badge">🤝 Apoio: {supportLabel(patient.answerSupport)}</span>
                {patient.narration && <span className="badge">🔊 Narração</span>}
                {patient.bigTargets && <span className="badge">👆 Botões grandes</span>}
              </div>
            </div>
          </div>
          <div className="row">
            {isGuardian && (
              <>
                <Link href={`/crianca/${patient.id}`} className="btn btn-sage">
                  ▶ Modo criança
                </Link>
                <Link href={`/paciente/${patient.id}/preferencias`} className="btn btn-secondary">
                  Preferências
                </Link>
              </>
            )}
            {isProfessional && (
              <>
                <Link href={`/paciente/${patient.id}/preferencias`} className="btn btn-secondary">
                  Perfil de comunicação
                </Link>
                <Link href={`/paciente/${patient.id}/avaliar`} className="btn">
                  + Nova avaliação
                </Link>
              </>
            )}
          </div>
        </div>
        {patient.notes && (
          <div className="card-soft small" style={{ marginTop: 16 }}>
            <strong>Observações do responsável:</strong> {patient.notes}
          </div>
        )}
        {isGuardian && (
          <p className="small muted" style={{ marginTop: 12 }}>
            🔑 Código para vincular profissionais: <strong style={{ letterSpacing: "0.15em" }}>{patient.accessCode}</strong>
          </p>
        )}
      </div>

      <div className="grid grid-3">
        <div className="card">
          <LevelBar points={patient.totalPoints} />
        </div>
        <div className="card grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="stat">
            <span className="value">{stats.count}</span>
            <span className="label">sessões</span>
          </div>
          <div className="stat">
            <span className="value">{formatDuration(stats.totalSec)}</span>
            <span className="label">tempo total</span>
          </div>
          <div className="stat">
            <span className="value">{Math.round(stats.avgAccuracy * 100)}%</span>
            <span className="label">acerto médio</span>
          </div>
          <div className="stat">
            <span className="value">{stats.streak}</span>
            <span className="label">dias seguidos</span>
          </div>
        </div>
        <div className="card">
          <h3>Como se sentiu ao final</h3>
          {stats.moods.length === 0 ? (
            <p className="muted small">Sem registros ainda.</p>
          ) : (
            <div className="row" style={{ fontSize: "1.8rem" }}>
              {stats.moods.map((m, i) => (
                <span key={i} title={MOODS[m]?.label}>
                  {MOODS[m]?.emoji ?? "❔"}
                </span>
              ))}
            </div>
          )}
          <p className="small muted">Últimas 10 sessões, da mais antiga para a mais recente.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Acerto por sessão</h2>
          <p className="small muted">Últimas 20 sessões com perguntas ou jogos.</p>
          <LineChart data={stats.accuracyTimeline} title="Percentual de acerto por sessão" />
        </div>
        <div className="card">
          <h2>Minutos de uso por dia</h2>
          <p className="small muted">Últimos 14 dias.</p>
          <BarChart data={stats.minutesByDay} title="Minutos de uso por dia" />
        </div>
      </div>

      <div className="card table-wrap">
        <h2>Evolução por atividade</h2>
        <table>
          <thead>
            <tr>
              <th>Atividade</th>
              <th>Habilidade</th>
              <th>Fase liberada</th>
              <th>Sessões</th>
              <th>Tempo</th>
              <th style={{ minWidth: 160 }}>Acerto médio</th>
              <th>Tendência</th>
            </tr>
          </thead>
          <tbody>
            {stats.perActivity.map((a) => (
              <tr key={a.activity.key}>
                <td>
                  {a.activity.emoji} {a.activity.title}
                </td>
                <td className="small">{a.activity.skill}</td>
                <td>
                  {a.activity.levels > 1 ? `${a.level} de ${a.activity.levels}` : "—"}
                </td>
                <td>{a.count}</td>
                <td>{formatDuration(a.totalSec)}</td>
                <td>{a.avgAccuracy === null ? "—" : <ProgressBar value={a.avgAccuracy} />}</td>
                <td>
                  {a.trend === null
                    ? "—"
                    : a.trend > 0.05
                      ? "↗ melhorando"
                      : a.trend < -0.05
                        ? "↘ atenção"
                        : "→ estável"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small muted">Tendência: média das 5 últimas sessões comparada às 5 anteriores.</p>
      </div>

      <div className="card table-wrap">
        <h2>Histórico de sessões</h2>
        {sessions.length === 0 ? (
          <p className="muted">Nenhuma sessão registrada ainda.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Atividade</th>
                <th>Fase</th>
                <th>Resultado</th>
                <th>Duração</th>
                <th>Pontos</th>
                <th>Humor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 40).map((s) => {
                const a = getActivity(s.activityKey);
                return (
                  <tr key={s.id}>
                    <td className="small">
                      {s.startedAt.toLocaleDateString("pt-BR")}{" "}
                      {s.startedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      {a?.emoji} {a?.title ?? s.activityKey}
                    </td>
                    <td>{s.level}</td>
                    <td>
                      {s.activityType === "CHAT"
                        ? `${s.total} mensagens`
                        : s.activityType === "AAC"
                        ? `${s.total} frase(s)`
                        : s.total > 0
                          ? `${s.correct}/${s.total} (${Math.round(s.accuracy * 100)}%)`
                          : s.completed
                            ? "Concluída"
                            : "Interrompida"}
                    </td>
                    <td>{formatDuration(s.durationSec)}</td>
                    <td>⭐ {s.points}</td>
                    <td title={s.mood ? MOODS[s.mood]?.label : ""}>{s.mood ? MOODS[s.mood]?.emoji : "—"}</td>
                    <td>
                      <Link href={`/paciente/${patient.id}/sessao/${s.id}`} className="small">
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" id="metas">
        <div className="row between">
          <h2 style={{ margin: 0 }}>🎯 Metas e conquistas</h2>
          {isProfessional && (
            <Link href={`/paciente/${patient.id}/metas/nova`} className="btn">
              + Nova meta
            </Link>
          )}
        </div>
        <h3 style={{ marginTop: 16 }}>Metas personalizadas</h3>
        {goalList.length === 0 && (
          <p className="muted small">
            {isProfessional
              ? "Nenhuma meta criada. Crie uma meta para aparecer na trilha de conquistas da criança."
              : "Nenhuma meta criada pelos profissionais ainda."}
          </p>
        )}
        <div className="stack">
          {goalList.map((g) => (
            <div key={g.goal.id} className="card-soft stack" style={{ opacity: g.goal.active ? 1 : 0.6 }}>
              <div className="row between">
                <strong>
                  {g.goal.emoji} {g.goal.title}
                </strong>
                <span className="row small" style={{ gap: 6 }}>
                  {g.earnedAt ? (
                    <span className="badge badge-ok">✅ Cumprida em {new Date(g.earnedAt).toLocaleDateString("pt-BR")}</span>
                  ) : !g.goal.active ? (
                    <span className="badge">Encerrada</span>
                  ) : g.overdue ? (
                    <span className="badge">⏰ Prazo vencido</span>
                  ) : (
                    <span className="badge badge-primary">Em andamento</span>
                  )}
                </span>
              </div>
              <div className="small">{g.description}</div>
              {!g.earnedAt && <ProgressBar value={g.current / g.target} tone="primary" rightLabel={`${g.current} de ${g.target}`} label="Progresso" />}
              <div className="row between small muted">
                <span>
                  Criada por {g.goal.professional.name} em {g.goal.createdAt.toLocaleDateString("pt-BR")}
                  {g.goal.dueDate ? ` · prazo ${g.goal.dueDate.toLocaleDateString("pt-BR")}` : ""}
                </span>
                {isProfessional && access.user.id === g.goal.professionalId && (
                  <form action={toggleGoal}>
                    <input type="hidden" name="goalId" value={g.goal.id} />
                    <button className="btn btn-ghost small">{g.goal.active ? "Encerrar meta" : "Reativar"}</button>
                  </form>
                )}
              </div>
              {g.goal.note && <div className="small">💬 Recado: {g.goal.note}</div>}
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 20 }}>
          Medalhas da trilha ({earnedMedals.length} de {medals.length})
        </h3>
        {earnedMedals.length === 0 ? (
          <p className="muted small">Nenhuma medalha ainda.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medalha</th>
                  <th>O que foi feito</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {earnedMedals.map((m) => (
                  <tr key={m.def.id}>
                    <td>
                      {m.def.emoji} {m.def.title}
                    </td>
                    <td className="small">{m.def.goal}</td>
                    <td>{new Date(m.earnedAt!).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {nextMedals.length > 0 && (
          <>
            <h3 style={{ marginTop: 16 }}>Próximas medalhas</h3>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {nextMedals.map((m) => (
                <div key={m.def.id} className="card-soft stack" style={{ padding: 12 }}>
                  <span className="small">
                    <strong>
                      {m.def.emoji} {m.def.title}
                    </strong>{" "}
                    · {m.def.goal}
                  </span>
                  <ProgressBar value={m.current / m.target} rightLabel={`${m.current} de ${m.target}`} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card" id="avaliacoes">
        <div className="row between">
          <h2>Avaliações profissionais</h2>
          {isProfessional && (
            <Link href={`/paciente/${patient.id}/avaliar`} className="btn">
              + Nova avaliação
            </Link>
          )}
        </div>
        {evaluations.length === 0 && <p className="muted">Nenhuma avaliação registrada.</p>}
        <div className="stack">
          {evaluations.map((e) => (
            <article key={e.id} className="card-soft stack">
              <div className="row between">
                <strong>
                  {e.professional.name} · {e.professional.specialty}
                </strong>
                <span className="small muted">
                  {e.createdAt.toLocaleDateString("pt-BR")}
                  {!e.sharedWithGuardian && " · 🔒 visível só para profissionais"}
                </span>
              </div>
              <div className="grid grid-3" style={{ gap: 8 }}>
                {EVAL_FIELDS.map(([k, label]) => (
                  <div key={k} className="row between small" style={{ flexWrap: "nowrap" }}>
                    <span>{label}</span>
                    <Dots value={e[k]} />
                  </div>
                ))}
              </div>
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{e.summary}</p>
              {e.recommendations && (
                <p className="small" style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  <strong>Recomendações:</strong> {e.recommendations}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Comentários e observações</h2>
          <ActionForm action={addComment} submitLabel="Publicar comentário" resetOnSuccess>
            <input type="hidden" name="patientId" value={patient.id} />
            <div className="field">
              <label htmlFor="content">Novo comentário</label>
              <textarea
                id="content"
                name="content"
                required
                placeholder={
                  isGuardian
                    ? "Ex.: Hoje ele ficou mais tranquilo depois da atividade de respiração."
                    : "Ex.: Sugiro manter o quiz de emoções na fase 12 esta semana."
                }
              />
            </div>
          </ActionForm>
          <div className="stack" style={{ marginTop: 16 }}>
            {comments.map((c) => (
              <div key={c.id} className="card-soft">
                <div className="row between small">
                  <strong>
                    {c.author.role === "PROFESSIONAL" ? "🩺" : "👨‍👩‍👧"} {c.author.name}
                    {c.author.specialty ? ` · ${c.author.specialty}` : ""}
                  </strong>
                  <span className="muted">{c.createdAt.toLocaleString("pt-BR")}</span>
                </div>
                <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{c.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Profissionais vinculados</h2>
          {professionals.length === 0 && (
            <p className="muted small">Nenhum profissional vinculado. Compartilhe o código de acesso com quem acompanha a criança.</p>
          )}
          <div className="stack">
            {professionals.map(({ professional: p }) => (
              <div key={p.id} className="row between card-soft">
                <div>
                  <strong>{p.name}</strong>
                  <div className="small muted">
                    {p.specialty} · {p.registryNumber}
                  </div>
                </div>
                {(isGuardian || p.id === access.user.id) && (
                  <form action={unlinkProfessional}>
                    <input type="hidden" name="patientId" value={patient.id} />
                    <input type="hidden" name="professionalId" value={p.id} />
                    <button className="btn btn-ghost small">{isGuardian ? "Remover" : "Desvincular-me"}</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
