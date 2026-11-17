import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function Entrar() {
  return (
    <div style={{ maxWidth: 460, margin: "24px auto" }} className="card">
      <h1>Entrar</h1>
      <LoginForm />
      <p className="small muted" style={{ marginTop: 16 }}>
        Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </div>
  );
}
