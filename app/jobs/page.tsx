import { JobCard } from '@/components/JobCard';
import { JobIngestionPanel } from '@/components/JobIngestionPanel';
import { getDashboardJobs, getRecommendedJobBoards } from '@/lib/appData';

export default async function JobsPage() {
  const [jobs, recommendedBoards] = await Promise.all([getDashboardJobs(), getRecommendedJobBoards()]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Jobs dashboard</h2>
        <p className="text-slate-300">Ingest real roles from supported boards, review fit, and push promising jobs into your application pipeline.</p>
      </div>

      <JobIngestionPanel suggestedBoards={recommendedBoards.map((board) => ({ company: board.company, url: board.url, sourceType: board.sourceType }))} />

      <div className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Jobs you might like</h3>
            <p className="text-sm text-slate-300">We rank supported Greenhouse and Lever boards using your saved target roles, skills, and location preferences.</p>
          </div>
          <p className="text-xs text-slate-500">Ingest any board below to pull live postings into your dashboard.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {recommendedBoards.map((board) => (
            <article key={board.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-100">{board.company}</p>
                  <p className="text-sm text-slate-300">{board.locationHint} • {board.sourceType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Board fit</p>
                  <p className="text-2xl font-bold text-teal-300">{board.fitScore}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-300">Likely role themes: {board.roleThemes.slice(0, 3).join(', ')}.</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
                {board.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <a href={board.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300">
                  Preview board
                </a>
                <code className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">{board.url}</code>
              </div>
            </article>
          ))}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card space-y-2 text-sm text-slate-300">
          <p className="font-medium text-slate-100">No ingested jobs yet.</p>
          <p>Add a Greenhouse or Lever board URL above to fetch live jobs into your dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              score={job.score}
              sourceType={job.sourceType}
              discoveredAt={job.discoveredAt}
              compensation={job.compensation ?? undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
