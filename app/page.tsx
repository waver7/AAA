import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="inline-block rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs text-teal-200">
          Open-source • Human-in-the-loop automation
        </p>
        <h1 className="text-4xl font-bold md:text-5xl">AutoApply AI: the fastest way to find your best-fit tech jobs.</h1>
        <p className="max-w-3xl text-slate-300">
          Ingest jobs, get transparent fit scoring, generate tailored outreach, and prepare autofill safely. No hidden black box, and never autonomous final submission.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/jobs" className="rounded bg-brand px-4 py-2 font-medium hover:bg-brand-dark">
          Try demo data
        </Link>
        <Link href="/onboarding" className="rounded border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800">
          Setup your profile
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <h2 className="font-semibold">Explainable fit score</h2>
          <p className="mt-1 text-sm text-slate-300">See exactly why a role matches: top skills, gaps, and mismatch notes.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">AI drafts, your control</h2>
          <p className="mt-1 text-sm text-slate-300">Generate outreach and tailored summaries with live AI or demo-mode fallback.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">Preparation-only automation</h2>
          <p className="mt-1 text-sm text-slate-300">Autofill support pauses before final submit, always requiring explicit user action.</p>
        </div>
      </div>
    </section>
  );
}
