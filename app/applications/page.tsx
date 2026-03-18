import { demoApplications } from '@/lib/demo/demoData';

const stages = ['discovered', 'shortlisted', 'prepared', 'applied', 'interview'];

export default function ApplicationsPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Applications pipeline</h2>
          <p className="text-slate-300">Track every role from discovery to interview with a single source of truth.</p>
        </div>
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">Demo data</span>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {stages.map((stage) => {
          const rows = demoApplications.filter((item) => item.status === stage);
          return (
            <div key={stage} className="card min-h-32">
              <h3 className="mb-3 text-sm font-semibold capitalize">{stage}</h3>
              {rows.length === 0 ? (
                <p className="text-xs text-slate-400">No applications in this stage</p>
              ) : (
                <ul className="space-y-2 text-xs text-slate-300">
                  {rows.map((row) => (
                    <li key={row.id}>
                      <p className="font-medium text-slate-100">{row.title}</p>
                      <p>{row.company}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
