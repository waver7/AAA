import Link from 'next/link';
import { MatchPanel } from '@/components/MatchPanel';
import { PrepareApplicationButton } from '@/components/PrepareApplicationButton';
import { getJobDetail } from '@/lib/appData';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobDetail(params.id);

  if (!job) {
    return (
      <section className="card space-y-3 text-sm text-slate-300">
        <p className="font-medium text-slate-100">Job not found.</p>
        <Link href="/jobs" className="text-teal-400 hover:text-teal-300">
          Back to jobs dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{job.title}</h2>
        <p className="text-sm text-slate-300">
          {job.company} • {job.location}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>Source: {job.sourceName}</span>
          <span>Remote: {job.remote ? 'Yes' : 'No'}</span>
          <span>Posted: {(job.postedAt ?? job.discoveredAt).toISOString().slice(0, 10)}</span>
          <a className="text-teal-400 hover:text-teal-300" href={job.sourceUrl} target="_blank" rel="noreferrer">
            Open original posting
          </a>
        </div>
      </div>

      <MatchPanel
        score={job.score}
        matchingSkills={job.matchingSkills}
        missingSkills={job.missingSkills}
        concerns={job.concerns}
        pitch={job.pitch}
        mismatchNotes={job.mismatchNotes}
        salary={job.compensation ?? undefined}
        location={job.location}
        source={job.sourceName}
        updatedAt={(job.postedAt ?? job.discoveredAt).toISOString().slice(0, 10)}
      />

      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Application workspace</h3>
            <p className="text-sm text-slate-300">Create a prepared pipeline entry, open the original application in a new tab, and use the generated packet to complete the form yourself with best-effort prefilling guidance.</p>
          </div>
          <PrepareApplicationButton jobPostingId={job.id} existing={Boolean(job.application)} />
        </div>
        {job.application ? <p className="text-sm text-slate-400">Current pipeline status: {job.application.status}</p> : null}
      </div>
    </section>
  );
}
