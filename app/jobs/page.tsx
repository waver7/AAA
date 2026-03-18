import { JobCard } from '@/components/JobCard';
import { JobIngestionPanel } from '@/components/JobIngestionPanel';
import { getDashboardJobs, getRecommendedJobBoards } from '@/lib/appData';

export default async function JobsPage() {
  const [dashboard, recommendedBoards] = await Promise.all([getDashboardJobs(), getRecommendedJobBoards()]);

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold">Remote jobs dashboard</h2>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] uppercase tracking-wide text-emerald-200">Remote only by default</span>
        </div>
        <p className="text-slate-300">Discover remote roles across multiple supported job board providers, review fit, and push promising jobs into your application pipeline.</p>
        <p className="text-xs text-slate-500">Supported sources today: {dashboard.supportedSources.join(', ')}.</p>
      </div>

      <JobIngestionPanel suggestedBoards={recommendedBoards.map((board) => ({ company: board.company, url: board.url, sourceType: board.sourceType }))} />

      <div className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Remote boards you might like</h3>
            <p className="text-sm text-slate-300">We rank supported boards using your saved target roles, skills, and remote-location preferences.</p>
          </div>
          <p className="text-xs text-slate-500">Import any board below to fetch live remote postings into your dashboard.</p>
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

      {dashboard.jobs.length === 0 ? (
        <div className="card space-y-2 text-sm text-slate-300">
          <p className="font-medium text-slate-100">No remote jobs imported yet.</p>
          <p>Import a supported source above to fetch remote roles only. Hybrid and on-site jobs stay out of the default dashboard view.</p>
          {dashboard.hiddenCount ? <p className="text-slate-400">We already hid {dashboard.hiddenCount} non-remote roles from previous imports.</p> : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            <p>
              Showing <span className="font-semibold text-slate-100">{dashboard.jobs.length}</span> remote roles.
            </p>
            <p>{dashboard.hiddenCount ? `${dashboard.hiddenCount} non-remote roles were filtered out.` : 'No hybrid or on-site roles are shown here.'}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company}
                location={job.location}
                score={job.score}
                sourceType={job.sourceType}
                sourceName={job.sourceName}
                discoveredAt={job.discoveredAt}
                postedAt={job.postedAt}
                remoteStatus={job.remoteStatus}
                compensation={job.compensation ?? undefined}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
