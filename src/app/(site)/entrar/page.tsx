import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function Entrar({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/painel");
  return (
    <div className="login-layout">
      <section className="login-welcome" aria-label="Sobre o InovaTea">
        <div className="login-mark" aria-hidden>🧩</div>
        <h1>Que bom ter você aqui.</h1>
        <p>Entre para acompanhar a evolução, jogar com a criança e conversar com quem cuida dela.</p>
        <ul className="login-points">
          <li><span aria-hidden>👨‍👩‍👧</span> Responsáveis acompanham o dia a dia e abrem o modo criança.</li>
          <li><span aria-hidden>🩺</span> Profissionais avaliam, criam metas e comentam.</li>
          <li><span aria-hidden>🔒</span> Dados protegidos conforme a LGPD.</li>
        </ul>
      </section>
      <section className="card login-card" aria-labelledby="login-title">
        <h2 id="login-title">Entrar</h2>
        <LoginForm next={next ?? ""} />
        <div className="login-divider"><span>Ainda não tem conta?</span></div>
        <div className="grid grid-2" style={{ gap: 10 }}>
          <Link href="/cadastro?tipo=responsavel" className="btn btn-secondary">👨‍👩‍👧 Sou responsável</Link>
          <Link href="/cadastro?tipo=profissional" className="btn btn-secondary">🩺 Sou profissional</Link>
        </div>
      </section>
    </div>
  );
}
