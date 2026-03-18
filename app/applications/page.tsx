import { getApplicationsBoard } from '@/lib/appData';

const stages = ['discovered', 'shortlisted', 'prepared', 'applied', 'recruiter_responded', 'interview', 'rejected', 'offer', 'archived'] as const;

export default async function ApplicationsPage() {
  const applications = await getApplicationsBoard();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Applications pipeline</h2>
        <p className="text-slate-300">Track discovered roles, prepared applications, and follow-ups in one place.</p>
      </div>

      {applications.length === 0 ? (
        <div className="card space-y-2 text-sm text-slate-300">
          <p className="font-medium text-slate-100">No applications in your pipeline yet.</p>
          <p>Ingest jobs, open a role, and click “Prepare application” to create your first tracked entry.</p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-5 md:grid-cols-3">
          {stages.map((stage) => {
            const rows = applications.filter((item) => item.status === stage);
            return (
              <div key={stage} className="card min-h-40">
                <h3 className="mb-3 text-sm font-semibold capitalize">{stage.replace('_', ' ')}</h3>
                <div className="space-y-3">
                  {rows.length === 0 ? (
                    <p className="text-xs text-slate-500">No applications in this stage</p>
                  ) : (
                    rows.map((row) => (
                      <article key={row.id} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-300">
                        <p className="font-medium text-slate-100">{row.jobPosting.title}</p>
                        <p>{row.jobPosting.company}</p>
                        <div className="mt-2 space-y-1 text-slate-400">
                          <p>Fit score: {row.fitScore ?? 'N/A'}</p>
                          <p>Created: {row.createdAt.toISOString().slice(0, 10)}</p>
                          <p>Source: {row.jobPosting.sourceType}</p>
                          <p>Location: {row.jobPosting.location}</p>
                          {row.followUpDate ? <p>Follow-up: {row.followUpDate.toISOString().slice(0, 10)}</p> : null}
                          {row.notes ? <p>Notes: {row.notes.slice(0, 80)}</p> : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
