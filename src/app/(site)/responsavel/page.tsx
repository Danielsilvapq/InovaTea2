import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LevelBar } from "@/components/LevelBar";
import { age, formatDuration } from "@/lib/stats";

export default async function ResponsavelPage() {
  const user = await requireUser("GUARDIAN");
  const children = await db.patient.findMany({
    where: { guardianId: user.id },
    include: {
      sessions: { select: { durationSec: true, startedAt: true }, orderBy: { startedAt: "desc" } },
      _count: { select: { evaluations: { where: { sharedWithGuardian: true } }, links: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h1>Minhas crianças</h1>
          <p className="muted">Acompanhe o progresso e abra o modo criança para começar uma atividade.</p>
        </div>
        <Link href="/responsavel/nova-crianca" className="btn">
          + Cadastrar criança
        </Link>
      </div>

      {children.length === 0 && (
        <div className="card center">
          <div style={{ fontSize: "3rem" }}>🌱</div>
          <h2>Nenhuma criança cadastrada ainda</h2>
          <p className="muted">Cadastre a criança ou adolescente para começar.</p>
          <Link href="/responsavel/nova-crianca" className="btn">
            Cadastrar agora
          </Link>
        </div>
      )}

      <div className="grid grid-2">
        {children.map((c) => {
          const totalSec = c.sessions.reduce((a, s) => a + s.durationSec, 0);
          return (
            <div key={c.id} className="card stack">
              <div className="row">
                <div className="avatar">{c.avatar}</div>
                <div>
                  <h2 style={{ margin: 0 }}>{c.name}</h2>
                  <div className="small muted">
                    {age(c.birthDate)} anos · {c.sessions.length} sessões · {formatDuration(totalSec)}
                  </div>
                </div>
              </div>
              <LevelBar points={c.totalPoints} />
              <div className="row small muted">
                <span className="badge">🩺 {c._count.links} profissional(is)</span>
                <span className="badge">📋 {c._count.evaluations} avaliação(ões)</span>
                <span className="badge">🔑 Código: {c.accessCode}</span>
              </div>
              <div className="row">
                <Link href={`/crianca/${c.id}`} className="btn btn-sage">
                  ▶ Modo criança
                </Link>
                <Link href={`/paciente/${c.id}`} className="btn btn-secondary">
                  Ver evolução
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
