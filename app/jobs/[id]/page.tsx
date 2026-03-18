import { MatchPanel } from '@/components/MatchPanel';
import { demoJobs } from '@/lib/demo/demoData';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = demoJobs.find((item) => item.id === params.id) ?? demoJobs[0];

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{job.title}</h2>
        <p className="text-sm text-slate-300">
          {job.company} • {job.location}
        </p>
      </div>

      <MatchPanel
        score={job.score}
        matchingSkills={job.matchingSkills}
        missingSkills={job.missingSkills}
        concerns={job.concerns}
        pitch={job.pitch}
        mismatchNotes={job.mismatchNotes}
        salary={job.salary}
        location={job.location}
        source={job.source}
        updatedAt={job.discoveredAt}
      />

      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-brand px-4 py-2 text-sm">Generate tailored summary</button>
        <button className="rounded border border-slate-700 px-4 py-2 text-sm">Generate outreach</button>
        <button className="rounded border border-slate-700 px-4 py-2 text-sm">Prepare autofill (optional)</button>
      </div>
    </section>
  );
}
