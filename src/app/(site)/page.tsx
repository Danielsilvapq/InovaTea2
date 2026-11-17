import Link from "next/link";
import { ACTIVITIES } from "@/lib/activities";

export default function Home() {
  return (
    <div className="stack">
      <section className="hero">
        <h1>Aprender, brincar e evoluir — no seu ritmo.</h1>
        <p className="muted" style={{ maxWidth: 680, fontSize: "1.1rem" }}>
          O InovaTea é um assistente para crianças e adolescentes com Transtorno do Espectro Autista
          (TEA). Quizzes, mini-jogos e conversas com um robô amigo geram pontos e níveis, e cada
          sessão fica registrada para que responsáveis e profissionais de saúde acompanhem a evolução.
        </p>
        <div className="row" style={{ marginTop: 20 }}>
          <Link href="/cadastro?tipo=responsavel" className="btn btn-lg">
            Sou responsável
          </Link>
          <Link href="/cadastro?tipo=profissional" className="btn btn-lg btn-secondary">
            Sou profissional de saúde
          </Link>
        </div>
      </section>

      <section className="grid grid-3">
        {ACTIVITIES.map((a) => (
          <div key={a.key} className={`card tone-${a.color}`}>
            <div style={{ fontSize: "2.4rem" }}>{a.emoji}</div>
            <h3>{a.title}</h3>
            <p className="small muted">{a.skill}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-3" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>🎨 Ambiente calmo</h3>
          <p className="small">
            Cores suaves, nada piscando, sons desligados por padrão, linguagem literal e barra de
            progresso sempre visível para a criança saber quanto falta.
          </p>
        </div>
        <div className="card">
          <h3>📈 Evolução registrada</h3>
          <p className="small">
            Acertos, tempo de sessão, níveis e humor ao final de cada atividade ficam no perfil,
            com gráficos de evolução.
          </p>
        </div>
        <div className="card">
          <h3>🩺 Acompanhamento profissional</h3>
          <p className="small">
            Profissionais vinculados registram avaliações estruturadas e comentários, que os
            responsáveis podem acompanhar.
          </p>
        </div>
      </section>
    </div>
  );
}
