import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export async function TopBar() {
  const user = await getCurrentUser();
  return (
    <header className="topbar">
      <div className="container">
        <Link href={user ? "/painel" : "/"} className="brand">
          🧩 Inova<span>Tea</span>
        </Link>
        <nav className="nav" aria-label="Navegação principal">
          {user ? (
            <>
              {user.role === "GUARDIAN" ? (
                <Link href="/responsavel">Minhas crianças</Link>
              ) : (
                <Link href="/profissional">Meus pacientes</Link>
              )}
              <span className="muted small">Olá, {user.name.split(" ")[0]}</span>
              <form action={logout}>
                <button className="btn btn-secondary" type="submit">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar">Entrar</Link>
              <Link href="/cadastro" className="btn">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
