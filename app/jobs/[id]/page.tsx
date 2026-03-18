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
          {job.workplaceType ? <span>Workplace: {job.workplaceType}</span> : null}
          {job.employmentType ? <span>Type: {job.employmentType}</span> : null}
          {job.seniority ? <span>Level: {job.seniority}</span> : null}
          {job.team ? <span>Team: {job.team}</span> : null}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailList title="Job snapshot" items={[
          ['Compensation', job.compensation ?? 'Not listed'],
          ['Location details', job.locationDetails ?? job.location],
          ['Employment type', job.employmentType ?? 'Not specified'],
          ['Team', job.team ?? 'Not specified'],
          ['Seniority', job.seniority ?? 'Not specified']
        ]} />
        <DetailList title="Parsed highlights" items={[
          ['Responsibilities', summarizeItems(job.responsibilities)],
          ['Qualifications', summarizeItems(job.qualifications)],
          ['Preferred qualifications', summarizeItems(job.preferredQualifications)],
          ['Benefits', summarizeItems(job.benefits)]
        ]} />
      </div>

      {job.descriptionSections.length ? (
        <div className="card space-y-4">
          <div>
            <h3 className="font-semibold">Structured job details</h3>
            <p className="text-sm text-slate-300">Parsed sections from the source posting so you can review responsibilities, requirements, and perks without re-opening the original board.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {job.descriptionSections.map((section) => (
              <div key={section.title} className="rounded-lg border border-slate-800 p-3">
                <h4 className="font-medium text-slate-100">{section.title}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {section.items.slice(0, 8).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Application workspace</h3>
            <p className="text-sm text-slate-300">Create a prepared pipeline entry, open the original application in a new tab, and use the optional AutoApply browser extension for visible autofill or copied applicant details as fallback.</p>
          </div>
          <PrepareApplicationButton jobPostingId={job.id} existing={Boolean(job.application)} />
        </div>
        {job.application ? <p className="text-sm text-slate-400">Current pipeline status: {job.application.status}</p> : null}
      </div>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <div className="card">
      <h3 className="font-semibold">{title}</h3>
      <dl className="mt-3 space-y-3 text-sm text-slate-300">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function summarizeItems(items: string[]) {
  return items.length ? items.slice(0, 4).join(' • ') : 'Not detected from this posting';
}
