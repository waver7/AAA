export function ScoreBadge({ score }: { score: number }) {
  const color = score > 75 ? 'bg-emerald-500/20 text-emerald-300' : score > 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300';
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${color}`}>{score}/100 fit</span>;
}
