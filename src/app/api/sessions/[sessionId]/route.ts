import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getKidPatient } from "@/lib/kid-access";
import { MOODS } from "@/lib/stats";

const schema = z.object({ mood: z.string().refine((m) => m in MOODS) });

/** Registra como a criança se sentiu ao final da atividade. */
export async function PATCH(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Humor inválido" }, { status: 400 });
  const session = await db.activitySession.findUnique({ where: { id: sessionId } });
  if (!session || !(await getKidPatient(session.patientId))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  await db.activitySession.update({ where: { id: sessionId }, data: { mood: parsed.data.mood } });
  return NextResponse.json({ ok: true });
}
