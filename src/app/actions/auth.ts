"use server";

import bcrypt from "bcryptjs";
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

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos." };
  }
  await createSession(user.id, user.role as "GUARDIAN" | "PROFESSIONAL");
  redirect("/painel");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
