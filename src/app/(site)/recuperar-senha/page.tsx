import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export default async function RecuperarSenha({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h1>Esqueci minha senha</h1>
      <p className="muted">Digite o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova.</p>
      <ForgotForm defaultEmail={email ?? ""} />
      <p className="small" style={{ marginTop: 16 }}>
        <Link href="/entrar">← Voltar para entrar</Link>
      </p>
    </div>
  );
}
