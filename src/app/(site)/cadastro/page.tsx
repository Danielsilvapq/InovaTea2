import Link from "next/link";
import { SignupForm } from "./SignupForm";

export default async function Cadastro({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const initialRole = tipo === "profissional" ? "PROFESSIONAL" : "GUARDIAN";
  return (
    <div style={{ maxWidth: 620, margin: "24px auto" }} className="card">
      <h1>Criar conta</h1>
      <SignupForm initialRole={initialRole} />
      <p className="small muted" style={{ marginTop: 16 }}>
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </div>
  );
}
