import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAccessiblePatient } from "@/lib/auth";
import { PHOTO_CATEGORIES, PHOTO_MAX_BYTES, PHOTO_TYPES } from "@/lib/photos";

/** Envio de foto pelo responsável (multipart/form-data). */
export async function POST(req: Request) {
  const form = await req.formData();
  const patientId = String(form.get("patientId") ?? "");
  const access = await getAccessiblePatient(patientId);
  if (!access) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  if (!access.isGuardian) return NextResponse.json({ error: "Apenas o responsável envia fotos." }, { status: 403 });

  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "Escolha uma foto." }, { status: 400 });
  if (!PHOTO_TYPES.includes(file.type)) return NextResponse.json({ error: "Use uma foto JPG, PNG ou WebP." }, { status: 400 });
  if (file.size > PHOTO_MAX_BYTES) return NextResponse.json({ error: "A foto ficou grande demais. Tente outra." }, { status: 400 });

  const caption = String(form.get("caption") ?? "").trim().slice(0, 500);
  if (caption.length < 2) return NextResponse.json({ error: "Escreva uma descrição curta." }, { status: 400 });
  const category = PHOTO_CATEGORIES.some((c) => c.value === form.get("category")) ? String(form.get("category")) : "outro";
  const takenAtRaw = String(form.get("takenAt") ?? "");
  const takenAt = takenAtRaw && !Number.isNaN(Date.parse(takenAtRaw)) ? new Date(takenAtRaw) : null;
  const width = Math.max(1, Number(form.get("width")) || 1);
  const height = Math.max(1, Number(form.get("height")) || 1);

  const photo = await db.photo.create({
    data: {
      patientId, authorId: access.user.id, data: Buffer.from(await file.arrayBuffer()), mimeType: file.type,
      width, height, caption, category, takenAt,
    },
    select: { id: true },
  });

  // Opcional: usar a foto como figura na prancha Minha Voz.
  const aacLabel = String(form.get("aacLabel") ?? "").trim().slice(0, 80);
  if (form.get("useInAac") === "on" && aacLabel) {
    const aacType = ["thing", "food", "person", "place", "action", "phrase"].includes(String(form.get("aacType"))) ? String(form.get("aacType")) : "thing";
    const article = String(form.get("aacArticle") ?? "");
    await db.aacItem.create({
      data: {
        patientId, authorId: access.user.id, type: aacType, emoji: "📷", label: aacLabel, photoId: photo.id,
        article: ["thing", "person", "place"].includes(aacType) && ["o", "a", "os", "as"].includes(article) ? article : null,
      },
    });
  }
  revalidatePath(`/paciente/${patientId}`);
  revalidatePath(`/paciente/${patientId}/fotos`);
  return NextResponse.json({ id: photo.id });
}
