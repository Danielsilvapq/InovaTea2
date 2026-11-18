"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PHOTO_CATEGORIES, resizeImage } from "@/lib/photos";
import { CUSTOM_TYPES } from "@/lib/aac";

/** Envio de foto pelo responsável: reduz no aparelho (e remove a localização) antes de enviar. */
export function PhotoUpload({ patientId, childName }: { patientId: string; childName: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({ caption: "", category: "casa", takenAt: new Date().toISOString().slice(0, 10), useInAac: false, aacLabel: "", aacType: "thing", aacArticle: "" });
  const [status, setStatus] = useState<{ error?: string; ok?: string } | null>(null);
  const [sending, setSending] = useState(false);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0] ?? null;
    setStatus(null);
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) return setStatus({ error: "Escolha um arquivo de imagem." });
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus({ error: "Escolha uma foto." });
    if (f.caption.trim().length < 2) return setStatus({ error: "Escreva uma descrição curta." });
    if (f.useInAac && !f.aacLabel.trim()) return setStatus({ error: "Escreva o nome da figura para a Minha Voz." });
    setSending(true);
    setStatus(null);
    try {
      const { blob, width, height } = await resizeImage(file);
      const body = new FormData();
      body.set("patientId", patientId);
      body.set("file", blob, "foto.jpg");
      body.set("width", String(width));
      body.set("height", String(height));
      body.set("caption", f.caption.trim());
      body.set("category", f.category);
      body.set("takenAt", f.takenAt);
      if (f.useInAac) {
        body.set("useInAac", "on");
        body.set("aacLabel", f.aacLabel.trim());
        body.set("aacType", f.aacType);
        body.set("aacArticle", f.aacArticle);
      }
      const res = await fetch("/api/fotos", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar.");
      setStatus({ ok: f.useInAac ? "Foto enviada e adicionada à Minha Voz." : "Foto enviada para os profissionais." });
      setFile(null);
      setPreview(null);
      setF((x) => ({ ...x, caption: "", useInAac: false, aacLabel: "" }));
      if (input.current) input.current.value = "";
      router.refresh();
    } catch (err) {
      setStatus({ error: err instanceof Error ? err.message : "Não foi possível enviar." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send}>
      {status?.error && <div className="error-box" role="alert">{status.error}</div>}
      {status?.ok && <div className="ok-box" role="status">{status.ok}</div>}
      <div className="photo-upload">
        <label htmlFor="photo-file" className="photo-drop">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Prévia da foto escolhida" />
          ) : (
            <span>📷 Toque para escolher ou tirar uma foto</span>
          )}
        </label>
        <input id="photo-file" ref={input} type="file" accept="image/*" onChange={pick} className="sr-only-input" />
        <div style={{ minWidth: 0 }}>
          <div className="field">
            <label htmlFor="caption">O que está acontecendo na foto?</label>
            <textarea id="caption" value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} maxLength={500} rows={3}
              placeholder={`Ex.: ${childName} montou a torre de blocos sozinho pela primeira vez.`} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="category">Tipo</label>
              <select id="category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {PHOTO_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="takenAt">Data da foto</label>
              <input id="takenAt" type="date" value={f.takenAt} onChange={(e) => setF({ ...f, takenAt: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
      <div className="card-soft stack" style={{ margin: "8px 0 16px" }}>
        <label className="check">
          <input type="checkbox" checked={f.useInAac} onChange={(e) => setF({ ...f, useInAac: e.target.checked })} />
          <span><strong>Usar também como figura na Minha Voz</strong> — a foto real (a mamãe, o copo, o cachorro) aparece na prancha de comunicação</span>
        </label>
        {f.useInAac && (
          <div className="grid grid-3">
            <div className="field">
              <label htmlFor="aacLabel">Nome da figura</label>
              <input id="aacLabel" value={f.aacLabel} onChange={(e) => setF({ ...f, aacLabel: e.target.value })} placeholder="Ex.: copo azul" maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="aacType">Tipo</label>
              <select id="aacType" value={f.aacType} onChange={(e) => setF({ ...f, aacType: e.target.value })}>
                {CUSTOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label.split(" (")[0]}</option>)}
              </select>
            </div>
            {["thing", "person", "place"].includes(f.aacType) && (
              <div className="field">
                <label htmlFor="aacArticle">Artigo</label>
                <select id="aacArticle" value={f.aacArticle} onChange={(e) => setF({ ...f, aacArticle: e.target.value })}>
                  <option value="">Sem artigo</option><option value="o">o</option><option value="a">a</option><option value="os">os</option><option value="as">as</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="small muted">
        🔒 A foto é reduzida no seu aparelho e a localização é removida antes do envio. Só você e os profissionais vinculados a {childName} podem ver.
      </p>
      <button className="btn btn-lg" disabled={sending || !file}>{sending ? "Enviando..." : "📤 Enviar foto"}</button>
    </form>
  );
}
