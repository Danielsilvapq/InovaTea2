"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string; ok?: string } | undefined;

const signupSchema = z
  .object({
    role: z.enum(["GUARDIAN", "PROFESSIONAL"]),
    name: z.string().trim().min(3, "Informe o nome completo."),
    email: z.string().trim().toLowerCase().email("E-mail inválido."),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    phone: z.string().trim().optional(),
    relationship: z.string().trim().optional(),
    specialty: z.string().trim().optional(),
    registryNumber: z.string().trim().optional(),
    institution: z.string().trim().optional(),
    consent: z.literal("on", { errorMap: () => ({ message: "É preciso aceitar os termos de uso e privacidade (LGPD)." }) }),
  })
  .superRefine((v, ctx) => {
    if (v.role === "PROFESSIONAL") {
      if (!v.specialty) ctx.addIssue({ code: "custom", message: "Informe a especialidade." });
      if (!v.registryNumber)
        ctx.addIssue({ code: "custom", message: "Informe o registro profissional (CRP, CRM, CRFa...)." });
    }
  });

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const exists = await db.user.findUnique({ where: { email: data.email } });
  if (exists) return { error: "Já existe uma conta com este e-mail." };

  const user = await db.user.create({
    data: {
      role: data.role,
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      phone: data.phone || null,
      relationship: data.role === "GUARDIAN" ? data.relationship || null : null,
      specialty: data.role === "PROFESSIONAL" ? data.specialty || null : null,
      registryNumber: data.role === "PROFESSIONAL" ? data.registryNumber || null : null,
      institution: data.role === "PROFESSIONAL" ? data.institution || null : null,
    },
  });
  await createSession(user.id, data.role);
  redirect("/painel");
}

/** Só aceita voltar para páginas internas (evita redirecionar para outro site). */
function safeNext(v: FormDataEntryValue | null) {
  const n = String(v ?? "");
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/entrar") ? n : "/painel";
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Preencha o e-mail e a senha." };
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Mesma mensagem nos dois casos, para não revelar quais e-mails têm conta.
    return { error: "E-mail ou senha incorretos. Confira e tente de novo, ou use “Esqueci minha senha”." };
  }
  await createSession(user.id, user.role as "GUARDIAN" | "PROFESSIONAL", formData.get("remember") === "on");
  redirect(safeNext(formData.get("next")));
}

// ---------------------------------------------------------------------------
// Esqueci minha senha
// ---------------------------------------------------------------------------
const sha256 = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export type ResetState = (FormState & { devLink?: string }) | undefined;

export async function requestPasswordReset(_: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Digite um e-mail válido." };
  const user = await db.user.findUnique({ where: { email } });
  const done = { ok: "Se este e-mail tiver uma conta, enviamos um link para criar uma nova senha. Ele vale por 1 hora." };
  if (!user) return done;

  const token = crypto.randomBytes(32).toString("base64url");
  await db.passwordReset.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const link = `${origin}/redefinir-senha?token=${token}`;
  // Envio por e-mail: configure um provedor (ex.: Resend, SendGrid) em produção.
  console.info(`[senha] Link de redefinição para ${email}: ${link}`);
  return process.env.NODE_ENV === "production" ? done : { ...done, devLink: link };
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "As duas senhas não são iguais." };
  const reset = await db.passwordReset.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return { error: "Este link não vale mais. Peça um novo em “Esqueci minha senha”." };
  }
  await db.$transaction([
    db.user.update({ where: { id: reset.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } }),
    db.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    db.passwordReset.deleteMany({ where: { userId: reset.userId, usedAt: null } }),
  ]);
  await createSession(reset.userId, reset.user.role as "GUARDIAN" | "PROFESSIONAL", true);
  redirect("/painel");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
