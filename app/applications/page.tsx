import { OpenPreparedApplicationButton } from '@/components/applications/OpenPreparedApplicationButton';
import { getApplicationsBoard } from '@/lib/appData';

const stages = ['discovered', 'shortlisted', 'prepared', 'applied', 'recruiter_responded', 'interview', 'rejected', 'offer', 'archived'] as const;

export default async function ApplicationsPage() {
  const { applications, prepReadiness } = await getApplicationsBoard();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Applications pipeline</h2>
        <p className="text-slate-300">Track discovered roles, prepared applications, and follow-ups in one place.</p>
      </div>

      <div className="card flex flex-wrap gap-4 text-sm text-slate-300">
        <span>Prepared action opens the external application in a new tab and copies your saved applicant details.</span>
        <span>{prepReadiness.resumeReady ? 'Resume ready for upload.' : 'Resume missing — upload one in onboarding.'}</span>
        <span>{prepReadiness.automationEnabled ? 'Install the optional AutoApply browser extension if you want the opened page itself to show visible autofill.' : 'Automation is off; install the optional extension if you want visible autofill in the opened page.'}</span>
      </div>

      {applications.length === 0 ? (
        <div className="card space-y-2 text-sm text-slate-300">
          <p className="font-medium text-slate-100">No applications in your pipeline yet.</p>
          <p>Ingest jobs, open a remote role, and click “Prepare in browser” to create your first tracked entry.</p>
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
                    rows.map((row) => {
                      const latestRun = row.automationRuns[0];
                      const prefillSummary = row.jobPosting.easyApply
                        ? 'Visible autofill with extension, otherwise copied details + optional automation preview'
                        : 'Copy-assist handoff with manual review';
                      return (
                        <article key={row.id} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-300">
                          <p className="font-medium text-slate-100">{row.jobPosting.title}</p>
                          <p>{row.jobPosting.company}</p>
                          <div className="mt-2 space-y-1 text-slate-400">
                            <p>Fit score: {row.fitScore ?? 'N/A'}</p>
                            <p>Source: {row.jobPosting.source?.name ?? row.jobPosting.sourceType}</p>
                            <p>Location: {row.jobPosting.location}</p>
                            <p>Remote: {row.jobPosting.remote ? 'Yes' : 'No'}</p>
                            <p>Resume ready: {prepReadiness.resumeReady ? 'Yes' : 'No'}</p>
                            <p>Prefill: {prefillSummary}</p>
                            {latestRun ? <p>Last prep run: {latestRun.createdAt.toISOString().slice(0, 10)}</p> : null}
                            {row.followUpDate ? <p>Follow-up: {row.followUpDate.toISOString().slice(0, 10)}</p> : null}
                            {row.notes ? <p>Notes: {row.notes.slice(0, 80)}</p> : null}
                          </div>
                          {stage === 'prepared' ? <div className="mt-3"><OpenPreparedApplicationButton applicationId={row.id} resumeReady={prepReadiness.resumeReady} prefillSummary={prefillSummary} /></div> : null}
                        </article>
                      );
                    })
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
