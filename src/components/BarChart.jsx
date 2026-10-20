// Lightweight stacked bar chart (no chart library). series: [{ key, label, className }]
export default function BarChart({ data, series, height = 160 }) {
  const max = Math.max(1, ...data.map((d) => series.reduce((sum, s) => sum + (d[s.key] || 0), 0)));
  return (
    <div className="chart" role="img" aria-label="Activity chart">
      <div className="chart__bars" style={{ height }}>
        {data.map((d) => {
          const total = series.reduce((sum, s) => sum + (d[s.key] || 0), 0);
          return (
            <div key={d.label} className="chart__col" title={`${d.label}: ${total}`}>
              <span className="chart__num">{total || ""}</span>
              <div className="chart__stack" style={{ height: `${(total / max) * 100}%` }}>
                {series.map((s) =>
                  d[s.key] ? (
                    <span key={s.key} className={`chart__seg ${s.className}`} style={{ flex: d[s.key] }} />
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart__labels">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
      <ul className="chart__legend">
        {series.map((s) => (
          <li key={s.key}>
            <span className={`chart__dot ${s.className}`} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
