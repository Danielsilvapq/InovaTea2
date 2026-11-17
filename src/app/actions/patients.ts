"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAccessiblePatient, requireUser } from "@/lib/auth";
import type { FormState } from "./auth";

function newAccessCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

const patientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome."),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Data de nascimento inválida."),
  avatar: z.string().min(1).default("🦊"),
  supportLevel: z.string().optional(),
  interests: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createPatient(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("GUARDIAN");
  const parsed = patientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  let accessCode = newAccessCode();
  while (await db.patient.findUnique({ where: { accessCode } })) accessCode = newAccessCode();

  await db.patient.create({
    data: {
      guardianId: user.id,
      name: d.name,
      birthDate: new Date(d.birthDate),
      avatar: d.avatar,
      supportLevel: d.supportLevel ? Number(d.supportLevel) : null,
      interests: d.interests || null,
      notes: d.notes || null,
      accessCode,
    },
  });
  revalidatePath("/responsavel");
  redirect("/responsavel");
}

export async function linkPatient(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("PROFESSIONAL");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const patient = await db.patient.findUnique({ where: { accessCode: code } });
  if (!patient) return { error: "Código não encontrado. Confira com o responsável." };
  await db.professionalLink.upsert({
    where: { professionalId_patientId: { professionalId: user.id, patientId: patient.id } },
    update: {},
    create: { professionalId: user.id, patientId: patient.id },
  });
  revalidatePath("/profissional");
  return { ok: `${patient.name} foi vinculado(a) ao seu painel.` };
}

export async function unlinkProfessional(formData: FormData) {
  const patientId = String(formData.get("patientId"));
  const professionalId = String(formData.get("professionalId"));
  const access = await getAccessiblePatient(patientId);
  if (!access) return;
  // Responsável pode remover qualquer profissional; profissional pode se desvincular.
  if (!access.isGuardian && access.user.id !== professionalId) return;
  await db.professionalLink.deleteMany({ where: { patientId, professionalId } });
  revalidatePath(`/paciente/${patientId}`);
  if (!access.isGuardian) redirect("/profissional");
}

export async function addComment(_: FormState, formData: FormData): Promise<FormState> {
  const patientId = String(formData.get("patientId"));
  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 2) return { error: "Escreva o comentário." };
  const access = await getAccessiblePatient(patientId);
  if (!access) return { error: "Sem permissão." };
  await db.comment.create({ data: { patientId, authorId: access.user.id, content } });
  revalidatePath(`/paciente/${patientId}`);
  return { ok: "Comentário publicado." };
}

const score = z.coerce.number().int().min(1).max(5);
const evaluationSchema = z.object({
  patientId: z.string(),
  communication: score,
  socialInteraction: score,
  attention: score,
  emotionalRegulation: score,
  autonomy: score,
  summary: z.string().trim().min(10, "Descreva a avaliação (mínimo de 10 caracteres)."),
  recommendations: z.string().trim().optional(),
  sharedWithGuardian: z.string().optional(),
});

export async function addEvaluation(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = evaluationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const access = await getAccessiblePatient(d.patientId);
  if (!access || !access.isProfessional) return { error: "Apenas profissionais vinculados podem avaliar." };
  await db.evaluation.create({
    data: {
      patientId: d.patientId,
      professionalId: access.user.id,
      communication: d.communication,
      socialInteraction: d.socialInteraction,
      attention: d.attention,
      emotionalRegulation: d.emotionalRegulation,
      autonomy: d.autonomy,
      summary: d.summary,
      recommendations: d.recommendations || null,
      sharedWithGuardian: d.sharedWithGuardian === "on",
    },
  });
  revalidatePath(`/paciente/${d.patientId}`);
  redirect(`/paciente/${d.patientId}#avaliacoes`);
}

export async function updatePreferences(_: FormState, formData: FormData): Promise<FormState> {
  const patientId = String(formData.get("patientId"));
  const access = await getAccessiblePatient(patientId);
  if (!access || !access.isGuardian) return { error: "Apenas o responsável pode alterar as preferências." };
  const fontScale = Number(formData.get("fontScale"));
  await db.patient.update({
    where: { id: patientId },
    data: {
      soundOn: formData.get("soundOn") === "on",
      reduceMotion: formData.get("reduceMotion") === "on",
      fontScale: [100, 115, 130].includes(fontScale) ? fontScale : 100,
      interests: String(formData.get("interests") ?? "").trim() || null,
      avatar: String(formData.get("avatar") ?? access.patient.avatar),
    },
  });
  revalidatePath(`/paciente/${patientId}`);
  revalidatePath(`/crianca/${patientId}`);
  return { ok: "Preferências salvas." };
}
