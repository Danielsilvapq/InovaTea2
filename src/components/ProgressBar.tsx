interface Props {
  value: number; // 0..1
  label?: string;
  rightLabel?: string;
  tone?: "sage" | "primary" | "lavender" | "sand";
}

export function ProgressBar({ value, label, rightLabel, tone = "sage" }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="progress">
      {(label || rightLabel) && (
        <div className="progress-label">
          <span>{label}</span>
          <span>{rightLabel ?? `${pct}%`}</span>
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progresso"}
      >
        <div className={`progress-fill ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
