import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { db } from "@/lib/db";
import { CUSTOM_TYPES, phrasesFromSessions, topPhrases } from "@/lib/aac";
import { removeAacItem } from "@/app/actions/patients";
import { AacItemForm } from "./AacItemForm";

export default async function PranchaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccessiblePatient(id);
  if (!access) notFound();
  const [items, sessions] = await Promise.all([
    db.aacItem.findMany({ where: { patientId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    db.activitySession.findMany({ where: { patientId: id, activityKey: "minhavoz" }, orderBy: { startedAt: "desc" } }),
  ]);
  const phrases = phrasesFromSessions(sessions);
  const top = topPhrases(phrases, 10);
  const typeLabel = (t: string) => CUSTOM_TYPES.find((x) => x.value === t)?.label.split(" (")[0] ?? t;

  return (
    <div className="stack" style={{ maxWidth: 900, margin: "0 auto" }}>
      <Link href={`/paciente/${id}`}>← Voltar ao perfil</Link>
      <div className="card">
        <h1>🗣️ Prancha Minha Voz · {access.patient.name}</h1>
        <p className="muted small">
          Adicione palavras e frases da vida real da criança: nomes de pessoas e bichos, comidas e brinquedos favoritos, lugares e pedidos frequentes.
          Elas aparecem no grupo <strong>⭐ Minhas</strong>, o primeiro da prancha.
        </p>
        <AacItemForm patientId={id} />
      </div>

      <div className="card">
        <h2>Figuras personalizadas ({items.length})</h2>
        {items.length === 0 ? (
          <p className="muted small">Nenhuma ainda.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Figura</th><th>Tipo</th><th>Adicionada por</th><th /></tr></thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td><strong>{it.emoji} {it.article ? `${it.article} ` : ""}{it.label}</strong></td>
                    <td className="small">{typeLabel(it.type)}</td>
                    <td className="small">{it.author.name} · {it.createdAt.toLocaleDateString("pt-BR")}</td>
                    <td>
                      <form action={removeAacItem}>
                        <input type="hidden" name="itemId" value={it.id} />
                        <button className="btn btn-ghost small">Remover</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>O que {access.patient.name} comunicou</h2>
        {phrases.length === 0 ? (
          <p className="muted small">Ainda não há frases registradas na Minha Voz.</p>
        ) : (
          <div className="grid grid-2">
            <div>
              <h3>Mais usadas</h3>
              <ol>{top.map((t) => <li key={t.text}>{t.text} <span className="badge">{t.count}x</span></li>)}</ol>
            </div>
            <div>
              <h3>Últimas frases</h3>
              <ul>
                {phrases.slice(0, 12).map((p, i) => (
                  <li key={i}>{p.text} <span className="small muted">{new Date(p.at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
