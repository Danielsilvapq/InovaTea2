import { TRACKS, type AchievementState, type GoalState } from "@/lib/achievements";
import { ProgressBar } from "./ProgressBar";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

/** Medalha: colorida quando conquistada, cinza com barra de progresso quando não. */
export function Badge({ a }: { a: AchievementState }) {
  const earned = !!a.earnedAt;
  return (
    <div className={`badge-card ${earned ? "earned" : "locked"}`}>
      <div className="badge-medal" aria-hidden>
        {a.def.emoji}
      </div>
      <strong>{a.def.title}</strong>
      <span className="small">{a.def.goal}</span>
      {earned ? (
        <span className="badge badge-ok">✅ {fmt(a.earnedAt!)}</span>
      ) : (
        <ProgressBar value={a.current / a.target} rightLabel={`${a.current} de ${a.target}`} label="Progresso" />
      )}
    </div>
  );
}

export function Trails({ states }: { states: AchievementState[] }) {
  return (
    <div className="stack">
      {TRACKS.map((t) => {
        const list = states.filter((s) => s.def.track === t.id);
        const got = list.filter((s) => s.earnedAt).length;
        return (
          <section key={t.id} className="card">
            <div className="row between">
              <h2 style={{ margin: 0 }}>
                {t.emoji} {t.title}
              </h2>
              <span className="badge">
                {got} de {list.length}
              </span>
            </div>
            <div className="trail">
              {list.map((a) => (
                <Badge key={a.def.id} a={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Metas do profissional, na versão para a criança. */
export function GoalCards({ goals }: { goals: GoalState[] }) {
  return (
    <div className="grid grid-2">
      {goals.map((g) => (
        <div key={g.goal.id} className={`card goal-card ${g.earnedAt ? "earned" : ""}`}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <div className="badge-medal" aria-hidden>
              {g.goal.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <strong style={{ fontSize: "1.1rem" }}>{g.goal.title}</strong>
              <div className="small">{g.description}</div>
            </div>
          </div>
          {g.goal.note && <div className="card-soft small">💬 {g.goal.note}</div>}
          {g.earnedAt ? (
            <div className="ok-box" style={{ margin: 0 }}>
              🎉 Meta cumprida em {fmt(g.earnedAt)}!
            </div>
          ) : (
            <ProgressBar value={g.current / g.target} tone="primary" label="Progresso da meta" rightLabel={`${g.current} de ${g.target}`} />
          )}
          {g.goal.dueDate && !g.earnedAt && (
            <span className="small muted">Até {fmt(new Date(g.goal.dueDate).toISOString())}</span>
          )}
        </div>
      ))}
    </div>
  );
}
