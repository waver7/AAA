import { JobCard } from '@/components/JobCard';
import { demoJobs } from '@/lib/demo/demoData';

export default function JobsPage() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Jobs dashboard</h2>
          <p className="text-slate-300">Demo data loaded — review high-fit roles first and act in one click.</p>
        </div>
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">Demo mode</span>
      </div>
      {demoJobs.length === 0 ? (
        <div className="card text-sm text-slate-300">
          No jobs yet. Add a Greenhouse/Lever URL in onboarding to ingest your first batch.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {demoJobs.map((job) => (
            <JobCard key={job.id} id={job.id} title={job.title} company={job.company} location={job.location} score={job.score} />
          ))}
        </div>
      )}
    </section>
  );
}
