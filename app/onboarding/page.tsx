import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Profile setup</h2>
      <p className="text-slate-300">Upload resume, parse profile fields, and set preferences to personalize job matching.</p>
      <form className="card space-y-4">
        <label className="block text-sm">
          Resume (PDF or DOCX)
          <input type="file" className="mt-1 block w-full text-sm" />
        </label>
        <label className="block text-sm">
          Target roles
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2"
            placeholder="Senior Software Engineer, Staff Backend Engineer"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded bg-brand px-4 py-2 text-sm font-medium">
            Save profile
          </button>
          <Link href="/jobs" className="rounded border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Use demo data instead
          </Link>
        </div>
      </form>
    </section>
  );
}
