import Link from "next/link";
import { PHASES_PER_WORLD, WORLDS } from "@/lib/generators";
import { ProgressBar } from "@/components/ProgressBar";

/**
 * Mapa de fases: mundos de 10 fases. Mostra só até o mundo atual e o próximo
 * (bloqueado), para não sobrecarregar a criança com 50 botões de uma vez.
 */
export function PhaseMap({ baseHref, total, unlocked }: { baseHref: string; total: number; unlocked: number }) {
  const worlds = Math.ceil(total / PHASES_PER_WORLD);
  const currentWorld = Math.ceil(unlocked / PHASES_PER_WORLD);
  return (
    <div className="stack">
      <Link href={`${baseHref}?nivel=${unlocked}`} className="btn btn-lg btn-sage btn-block">
        ▶ Continuar na fase {unlocked}
      </Link>
      <ProgressBar value={(unlocked - 1) / total} tone="primary" label="Fases concluídas" rightLabel={`${unlocked - 1} de ${total}`} />
      {Array.from({ length: worlds }, (_, w) => w + 1).map((w) => {
        const world = WORLDS[w - 1] ?? WORLDS[WORLDS.length - 1];
        const first = (w - 1) * PHASES_PER_WORLD + 1;
        const last = Math.min(total, w * PHASES_PER_WORLD);
        if (w > currentWorld + 1) return null;
        if (w === currentWorld + 1) {
          return (
            <div key={w} className="world locked">
              <strong>
                🔒 {world.emoji} {world.title} · fases {first} a {last}
              </strong>
              <span className="small">Termine a fase {first - 1} para abrir este mundo.</span>
            </div>
          );
        }
        const doneHere = Math.max(0, Math.min(last, unlocked - 1) - first + 1);
        return (
          <section key={w} className="world">
            <div className="row between">
              <strong style={{ fontSize: "1.1rem" }}>
                {world.emoji} {world.title}
              </strong>
              <span className="badge">
                {doneHere} de {last - first + 1}
              </span>
            </div>
            <div className="phase-grid">
              {Array.from({ length: last - first + 1 }, (_, i) => first + i).map((p) => {
                const state = p < unlocked ? "done" : p === unlocked ? "current" : "locked";
                return state === "locked" ? (
                  <span key={p} className="phase locked" aria-label={`Fase ${p}, bloqueada`}>
                    🔒
                  </span>
                ) : (
                  <Link key={p} href={`${baseHref}?nivel=${p}`} className={`phase ${state}`} aria-label={`Fase ${p}${state === "done" ? ", concluída" : ", atual"}`}>
                    {state === "done" ? "✓" : p}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      {currentWorld < worlds - 1 && (
        <p className="small muted center">Mais {worlds - currentWorld - 1} mundo(s) esperando por você depois deste.</p>
      )}
    </div>
  );
}
