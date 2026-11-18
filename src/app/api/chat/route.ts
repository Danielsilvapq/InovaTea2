import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getKidPatient } from "@/lib/kid-access";
import { teabotGreeting, teabotReply } from "@/lib/teabot";
import { computePoints, levelInfo } from "@/lib/gamification";
import { age } from "@/lib/stats";

const MAX_USER_MESSAGES = 40;

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), patientId: z.string() }),
  z.object({ action: z.literal("message"), sessionId: z.string(), text: z.string().trim().min(1).max(500) }),
  z.object({ action: z.literal("end"), sessionId: z.string(), durationSec: z.number().int().min(0).max(10800) }),
]);

async function loadSession(sessionId: string) {
  const session = await db.activitySession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session || session.activityType !== "CHAT") return null;
  const patient = await getKidPatient(session.patientId);
  if (!patient) return null;
  return { session, patient };
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const body = parsed.data;

  if (body.action === "start") {
    const patient = await getKidPatient(body.patientId);
    if (!patient) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    const ctx = { childName: patient.name.split(" ")[0], age: age(patient.birthDate), interests: patient.interests };
    const greeting = teabotGreeting(ctx);
    const session = await db.activitySession.create({
      data: {
        patientId: patient.id,
        activityType: "CHAT",
        activityKey: "conversa",
        messages: { create: { role: "assistant", content: greeting } },
      },
    });
    return NextResponse.json({ sessionId: session.id, reply: greeting });
  }

  const loaded = await loadSession(body.sessionId);
  if (!loaded) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  const { session, patient } = loaded;
  if (session.endedAt) return NextResponse.json({ error: "Conversa encerrada" }, { status: 409 });

  if (body.action === "message") {
    const userCount = session.messages.filter((m) => m.role === "user").length;
    if (userCount >= MAX_USER_MESSAGES) {
      return NextResponse.json({ reply: "Conversamos bastante hoje! Que tal descansar um pouco? Até a próxima. 👋", limit: true });
    }
    await db.chatMessage.create({ data: { sessionId: session.id, role: "user", content: body.text } });
    const history = [
      ...session.messages.slice(-20).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: body.text },
    ];
    // A API exige que a conversa comece com o usuário: removemos a saudação inicial do robô.
    while (history.length && history[0].role !== "user") history.shift();
    const ctx = { childName: patient.name.split(" ")[0], age: age(patient.birthDate), interests: patient.interests };
    const { text, source } = await teabotReply(ctx, history);
    await db.chatMessage.create({ data: { sessionId: session.id, role: "assistant", content: text } });
    await db.activitySession.update({ where: { id: session.id }, data: { total: userCount + 1 } });
    return NextResponse.json({ reply: text, source });
  }

  // end
  const userMessages = session.messages.filter((m) => m.role === "user");
  const points = computePoints({ activityType: "CHAT", correct: 0, total: 0, level: 1, completed: true, messages: userMessages.length });
  const avgLen = userMessages.length
    ? Math.round(userMessages.reduce((a, m) => a + m.content.split(/\s+/).length, 0) / userMessages.length)
    : 0;
  const before = levelInfo(patient.totalPoints);
  const [, updated] = await db.$transaction([
    db.activitySession.update({
      where: { id: session.id },
      data: {
        endedAt: new Date(),
        durationSec: body.durationSec,
        completed: userMessages.length > 0,
        total: userMessages.length,
        points,
        details: JSON.stringify({ userMessages: userMessages.length, avgWordsPerMessage: avgLen }),
      },
    }),
    db.patient.update({ where: { id: patient.id }, data: { totalPoints: { increment: points } } }),
  ]);
  return NextResponse.json({
    sessionId: session.id,
    points,
    totalPoints: updated.totalPoints,
    levelUp: levelInfo(updated.totalPoints).level > before.level,
    newLevel: levelInfo(updated.totalPoints).level,
  });
}
