import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function Painel() {
  const user = await requireUser();
  redirect(user.role === "PROFESSIONAL" ? "/profissional" : "/responsavel");
}
