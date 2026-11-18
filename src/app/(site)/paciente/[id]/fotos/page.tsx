import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { db } from "@/lib/db";
import { PHOTO_CATEGORIES, photoCategory, photoUrl } from "@/lib/photos";
import { addPhotoComment, deletePhoto } from "@/app/actions/patients";
import { ActionForm } from "@/components/ActionForm";
import { PhotoUpload } from "./PhotoUpload";

export default async function FotosPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tipo?: string }> }) {
  const { id } = await params;
  const { tipo } = await searchParams;
  const access = await getAccessiblePatient(id);
  if (!access) notFound();
  const { patient, isGuardian, user } = access;
  const photos = await db.photo.findMany({
    where: { patientId: id, ...(tipo ? { category: tipo } : {}) },
    select: {
      id: true, caption: true, category: true, takenAt: true, createdAt: true, width: true, height: true, authorId: true,
      author: { select: { name: true } },
      comments: { include: { author: { select: { name: true, role: true, specialty: true } } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  const first = patient.name.split(" ")[0];

  return (
    <div className="stack" style={{ maxWidth: 980, margin: "0 auto" }}>
      <Link href={`/paciente/${id}`}>← Voltar ao perfil</Link>
      <div className="card">
        <h1>📷 Fotos da família · {patient.name}</h1>
        <p className="muted small">
          {isGuardian
            ? `Compartilhe momentos do dia a dia de ${first} com os profissionais: conquistas, atividades em casa, situações difíceis. Eles podem comentar cada foto.`
            : `Fotos enviadas pela família de ${first}. Você pode comentar cada uma; o responsável vê a sua resposta.`}
        </p>
        {isGuardian && <PhotoUpload patientId={id} childName={first} />}
      </div>

      <div className="row" role="navigation" aria-label="Filtrar por tipo">
        <Link href={`/paciente/${id}/fotos`} className={`btn ${!tipo ? "" : "btn-secondary"}`}>Todas</Link>
        {PHOTO_CATEGORIES.map((c) => (
          <Link key={c.value} href={`/paciente/${id}/fotos?tipo=${c.value}`} className={`btn ${tipo === c.value ? "" : "btn-secondary"}`}>
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      {photos.length === 0 ? (
        <div className="card center muted">Nenhuma foto {tipo ? "deste tipo " : ""}ainda.</div>
      ) : (
        <div className="photo-grid">
          {photos.map((p) => {
            const cat = photoCategory(p.category);
            return (
              <article key={p.id} className="card photo-card">
                <a href={photoUrl(p.id)} target="_blank" rel="noreferrer" className="photo-frame" aria-label="Abrir a foto em tamanho maior">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(p.id)} alt={p.caption} loading="lazy" width={p.width} height={p.height} />
                </a>
                <div className="stack" style={{ padding: "12px 4px 0" }}>
                  <div className="row between small">
                    <span className="badge">{cat.emoji} {cat.label}</span>
                    <span className="muted">{(p.takenAt ?? p.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{p.caption}</p>
                  <div className="small muted">Enviada por {p.author.name} em {p.createdAt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                  {p.comments.length > 0 && (
                    <div className="stack" style={{ gap: 8 }}>
                      {p.comments.map((c) => (
                        <div key={c.id} className="card-soft small" style={{ padding: 10 }}>
                          <strong>{c.author.role === "PROFESSIONAL" ? "🩺" : "👨‍👩‍👧"} {c.author.name}{c.author.specialty ? ` · ${c.author.specialty}` : ""}</strong>
                          <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ActionForm action={addPhotoComment} submitLabel="Comentar" resetOnSuccess>
                    <input type="hidden" name="photoId" value={p.id} />
                    <div className="field" style={{ marginBottom: 8 }}>
                      <label htmlFor={`c-${p.id}`} className="small">Comentário</label>
                      <textarea id={`c-${p.id}`} name="content" rows={2} style={{ minHeight: 64 }}
                        placeholder={isGuardian ? "Acrescente algo..." : "Ex.: Ótimo sinal de autonomia! Vamos reforçar isso na sessão."} />
                    </div>
                  </ActionForm>
                  {p.authorId === user.id && (
                    <form action={deletePhoto}>
                      <input type="hidden" name="photoId" value={p.id} />
                      <button className="btn btn-ghost small">🗑 Apagar foto</button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
