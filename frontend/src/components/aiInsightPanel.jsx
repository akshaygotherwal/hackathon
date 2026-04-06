export default function AiInsightPanel({ insight }) {
  if (!insight) {
    return (
      <div className="card p-7 flex flex-col items-center justify-center min-h-40">
        <div className="text-5xl mb-4">🤖</div>
        <h2 className="section-title text-center">AI Insights</h2>
        <p className="text-slate-500 text-sm mt-2 text-center">Log a habit to get personalised recommendations</p>
      </div>
    );
  }

  const { headline, tips, score } = insight;

  const badge =
    score >= 85 ? { bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.35)", text: "#34d399" } :
    score >= 70 ? { bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.35)", text: "#60a5fa" } :
    score >= 50 ? { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.35)",  text: "#fbbf24" } :
                  { bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)", text: "#f87171" };

  return (
    <div className="card p-7 animate-fade-in">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="section-title">🤖 AI Insights</h2>
          <p className="section-sub">Personalised health recommendations</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}>
          Score {score}
        </span>
      </div>

      {/* Headline */}
      <div className="rounded-2xl px-5 py-4 mb-5 text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(79,70,229,0.2))", border: "1px solid rgba(96,165,250,0.2)" }}>
        {headline}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="card-inner flex gap-3 px-4 py-3 text-sm text-slate-300 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-lg shrink-0 mt-0.5">{tip.slice(0, 2)}</span>
            <span className="leading-snug">{tip.slice(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
