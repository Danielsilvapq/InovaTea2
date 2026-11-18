import Link from "next/link";
import { ResetForm } from "./ResetForm";

export default async function RedefinirSenha({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h1>Criar nova senha</h1>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <div className="error-box">Link incompleto. Peça um novo em “Esqueci minha senha”.</div>
      )}
      <p className="small" style={{ marginTop: 16 }}>
        <Link href="/entrar">← Voltar para entrar</Link>
      </p>
    </div>
  );
}
