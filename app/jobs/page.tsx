import { JobCard } from '@/components/JobCard';
import { JobIngestionPanel } from '@/components/JobIngestionPanel';
import { getDashboardJobs } from '@/lib/appData';

export default async function JobsPage() {
  const jobs = await getDashboardJobs();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Jobs dashboard</h2>
        <p className="text-slate-300">Ingest real roles from supported boards, review fit, and push promising jobs into your application pipeline.</p>
      </div>

      <JobIngestionPanel />

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
