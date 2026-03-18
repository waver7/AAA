import Link from 'next/link';
import { ScoreBadge } from './ScoreBadge';

export type JobCardProps = {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  sourceType?: string;
  sourceName?: string;
  discoveredAt?: string;
  postedAt?: string;
  compensation?: string;
  remoteStatus?: string;
};

export function JobCard(job: JobCardProps) {
  return (
    <article className="card space-y-3 border-teal-500/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{job.title}</h3>
          <p className="text-sm text-slate-300">
            {job.company} • {job.location}
          </p>
        </div>
        <ScoreBadge score={job.score} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">{job.remoteStatus ?? 'Remote'}</span>
        {job.sourceName ? <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">Source: {job.sourceName}</span> : null}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {job.postedAt ? <span>Posted: {job.postedAt}</span> : null}
        {job.discoveredAt ? <span>Imported: {job.discoveredAt}</span> : null}
        {job.compensation ? <span>Salary: {job.compensation}</span> : null}
      </div>
      <Link href={`/jobs/${job.id}`} className="text-sm text-teal-400 hover:text-teal-300">
        Open details
      </Link>
    </article>
  );
}
