import Link from 'next/link';
import { ScoreBadge } from './ScoreBadge';

export type JobCardProps = {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
};

export function JobCard(job: JobCardProps) {
  return (
    <article className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{job.title}</h3>
        <ScoreBadge score={job.score} />
      </div>
      <p className="text-sm text-slate-300">
        {job.company} • {job.location}
      </p>
      <Link href={`/jobs/${job.id}`} className="text-sm text-teal-400 hover:text-teal-300">
        Open details
      </Link>
    </article>
  );
}
