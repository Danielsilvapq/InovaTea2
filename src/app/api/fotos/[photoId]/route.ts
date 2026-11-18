import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** Entrega a foto só para o responsável e para os profissionais vinculados. */
export async function GET(_: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await params;
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Não autorizado", { status: 401 });
  const photo = await db.photo.findUnique({
    where: { id: photoId },
    select: { data: true, mimeType: true, patient: { select: { guardianId: true, links: { select: { professionalId: true } } } } },
  });
  if (!photo) return new NextResponse("Não encontrada", { status: 404 });
  const allowed = photo.patient.guardianId === user.id || photo.patient.links.some((l) => l.professionalId === user.id);
  if (!allowed) return new NextResponse("Não autorizado", { status: 403 });
  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
