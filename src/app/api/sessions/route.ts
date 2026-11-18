import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getKidPatient } from "@/lib/kid-access";
import { getActivity } from "@/lib/activities";
import { computePoints, levelInfo } from "@/lib/gamification";
import { unlockedLevel } from "@/lib/stats";
import { newlyEarned } from "@/lib/achievements";

const schema = z.object({
  patientId: z.string(),
  activityKey: z.string(),
  level: z.number().int().min(1).max(50),
  correct: z.number().int().min(0),
  wrong: z.number().int().min(0),
  total: z.number().int().min(0),
  durationSec: z.number().int().min(0).max(60 * 60 * 3),
  completed: z.boolean(),
  details: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;
  const activity = getActivity(d.activityKey);
  if (!activity || activity.type === "CHAT") return NextResponse.json({ error: "Atividade inválida" }, { status: 400 });
  const patient = await getKidPatient(d.patientId);
  if (!patient) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const previous = await db.activitySession.findMany({
    where: { patientId: patient.id, activityKey: activity.key },
    select: { activityKey: true, level: true, accuracy: true, completed: true },
  });
  const allowedLevel = unlockedLevel(previous, activity.key);
  const level = Math.min(d.level, allowedLevel, activity.levels);
  const correct = Math.min(d.correct, d.total || d.correct);
  const accuracy = d.total > 0 ? correct / d.total : d.completed ? 1 : 0;
  const points = computePoints({ activityType: activity.type, correct, total: d.total, level, completed: d.completed });

  const before = levelInfo(patient.totalPoints);
  const [session, updated] = await db.$transaction([
    db.activitySession.create({
      data: {
        patientId: patient.id,
        activityType: activity.type,
        activityKey: activity.key,
        level,
        correct,
        wrong: d.wrong,
        total: d.total,
        accuracy,
        durationSec: d.durationSec,
        points,
        completed: d.completed,
        details: d.details ? JSON.stringify(d.details) : null,
        startedAt: new Date(Date.now() - d.durationSec * 1000),
        endedAt: new Date(),
      },
    }),
    db.patient.update({ where: { id: patient.id }, data: { totalPoints: { increment: points } } }),
  ]);
  const after = levelInfo(updated.totalPoints);
  const newUnlocked = unlockedLevel([...previous, { activityKey: activity.key, level, accuracy, completed: d.completed }], activity.key);

  const [allSessions, goals] = await Promise.all([
    db.activitySession.findMany({ where: { patientId: patient.id } }),
    db.goal.findMany({ where: { patientId: patient.id, active: true } }),
  ]);

  return NextResponse.json({
    sessionId: session.id,
    earned: newlyEarned(session.id, allSessions, goals),
    points,
    totalPoints: updated.totalPoints,
    levelUp: after.level > before.level,
    newLevel: after.level,
    unlockedActivityLevel: newUnlocked > allowedLevel ? newUnlocked : null,
    accuracy,
  });
}
