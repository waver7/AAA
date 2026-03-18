import Link from 'next/link';
import { ScoreBadge } from './ScoreBadge';

export type JobCardProps = {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  sourceType?: string;
  discoveredAt?: string;
  compensation?: string;
};

export function JobCard(job: JobCardProps) {
  return (
    <article className="card space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{job.title}</h3>
        <ScoreBadge score={job.score} />
      </div>
      <p className="text-sm text-slate-300">
        {job.company} • {job.location}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {job.sourceType ? <span>Source: {job.sourceType}</span> : null}
        {job.discoveredAt ? <span>Fetched: {job.discoveredAt}</span> : null}
        {job.compensation ? <span>Salary: {job.compensation}</span> : null}
      </div>
      <Link href={`/jobs/${job.id}`} className="text-sm text-teal-400 hover:text-teal-300">
        Open details
      </Link>
    </article>
  );
}
