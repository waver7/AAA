type MatchPanelProps = {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  concerns: string[];
  pitch: string;
  mismatchNotes: string[];
  salary?: string;
  location: string;
  source: string;
  updatedAt: string;
};

function Chip({ label, variant }: { label: string; variant: 'match' | 'missing' | 'neutral' }) {
  const classes =
    variant === 'match'
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
      : variant === 'missing'
        ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
        : 'bg-slate-700/40 text-slate-200 border-slate-600';
  return <span className={`rounded-full border px-2 py-1 text-xs ${classes}`}>{label}</span>;
}

export function MatchPanel(props: MatchPanelProps) {
  return (
    <section className="card space-y-5 border-teal-500/40 bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-teal-300">Why you match this job</p>
          <h3 className="text-xl font-semibold">Fit analysis</h3>
          <p className="mt-1 text-sm text-slate-300">{props.pitch}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Fit score</p>
          <p className="text-5xl font-bold text-teal-300">{props.score}</p>
          <p className="text-xs text-slate-400">/100</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-emerald-200">Top matching skills</p>
          <div className="flex flex-wrap gap-2">
            {props.matchingSkills.length ? props.matchingSkills.map((skill) => <Chip key={skill} label={skill} variant="match" />) : <Chip label="No strong overlaps yet" variant="neutral" />}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-rose-200">Missing skills</p>
          <div className="flex flex-wrap gap-2">
            {props.missingSkills.length ? props.missingSkills.map((skill) => <Chip key={skill} label={skill} variant="missing" />) : <Chip label="No major missing skills" variant="match" />}
          </div>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg border border-slate-700 p-3">
          <p className="mb-1 font-medium text-slate-100">Potential concerns</p>
          <ul className="list-disc space-y-1 pl-4 text-slate-300">
            {props.concerns.length ? props.concerns.map((concern) => <li key={concern}>{concern}</li>) : <li>No critical concerns detected.</li>}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-700 p-3">
          <p className="mb-1 font-medium text-slate-100">Mismatch notes</p>
          <ul className="list-disc space-y-1 pl-4 text-slate-300">
            {props.mismatchNotes.length ? props.mismatchNotes.map((note) => <li key={note}>{note}</li>) : <li>Location and salary signals are aligned.</li>}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span>📍 {props.location}</span>
        <span>💰 {props.salary ?? 'Compensation not listed'}</span>
        <span>🔎 Source: {props.source}</span>
        <span>🕒 Last updated: {props.updatedAt}</span>
      </div>
    </section>
  );
}
