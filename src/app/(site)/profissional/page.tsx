import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { linkPatient } from "@/app/actions/patients";
import { ActionForm } from "@/components/ActionForm";
import { levelInfo } from "@/lib/gamification";
import { age } from "@/lib/stats";

export default async function ProfissionalPage() {
  const user = await requireUser("PROFESSIONAL");
  const links = await db.professionalLink.findMany({
    where: { professionalId: user.id },
    include: {
      patient: {
        include: {
          guardian: { select: { name: true } },
          sessions: { select: { startedAt: true }, orderBy: { startedAt: "desc" }, take: 1 },
          evaluations: {
            where: { professionalId: user.id },
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: { select: { sessions: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="stack">
      <div>
        <h1>Meus pacientes</h1>
        <p className="muted">
          {user.specialty} · {user.registryNumber}
          {user.institution ? ` · ${user.institution}` : ""}
        </p>
      </div>

      <div className="card">
        <h2>Vincular paciente</h2>
        <p className="small muted">Peça ao responsável o código de acesso de 6 caracteres que aparece no perfil da criança.</p>
        <ActionForm action={linkPatient} submitLabel="Vincular" resetOnSuccess>
          <div className="field" style={{ maxWidth: 280 }}>
            <label htmlFor="code">Código de acesso</label>
            <input id="code" name="code" required maxLength={6} style={{ textTransform: "uppercase", letterSpacing: "0.2em" }} />
          </div>
        </ActionForm>
      </div>

      <div className="card table-wrap">
        <h2>Pacientes vinculados ({links.length})</h2>
        {links.length === 0 ? (
          <p className="muted">Nenhum paciente vinculado ainda.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Responsável</th>
                <th>Nível</th>
                <th>Sessões</th>
                <th>Última atividade</th>
                <th>Sua última avaliação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {links.map(({ patient: p }) => (
                <tr key={p.id}>
                  <td>
                    <strong>
                      {p.avatar} {p.name}
                    </strong>
                    <div className="small muted">{age(p.birthDate)} anos</div>
                  </td>
                  <td>{p.guardian.name}</td>
                  <td>{levelInfo(p.totalPoints).level}</td>
                  <td>{p._count.sessions}</td>
                  <td>{p.sessions[0] ? p.sessions[0].startedAt.toLocaleDateString("pt-BR") : "—"}</td>
                  <td>{p.evaluations[0] ? p.evaluations[0].createdAt.toLocaleDateString("pt-BR") : "Pendente"}</td>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <Link href={`/paciente/${p.id}`} className="btn btn-secondary">
                        Abrir
                      </Link>
                      <Link href={`/paciente/${p.id}/avaliar`} className="btn">
                        Avaliar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
