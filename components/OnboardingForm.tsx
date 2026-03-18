'use client';

import { useMemo, useState } from 'react';

type OnboardingFormProps = {
  initial: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    summary?: string | null;
    skills: string[];
    targetTitles: string[];
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
  };
};

export function OnboardingForm({ initial }: OnboardingFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: initial.name ?? '',
    email: initial.email ?? '',
    phone: initial.phone ?? '',
    location: initial.location ?? '',
    summary: initial.summary ?? '',
    skills: initial.skills.join(', '),
    targetTitles: initial.targetTitles.join(', '),
    linkedinUrl: initial.linkedinUrl ?? '',
    githubUrl: initial.githubUrl ?? '',
    portfolioUrl: initial.portfolioUrl ?? ''
  });

  const profileCompleteness = useMemo(() => {
    const fields = [form.name, form.email, form.summary, form.skills, form.targetTitles].filter(Boolean).length;
    return Math.round((fields / 5) * 100);
  }, [form]);

  async function handleUpload() {
    if (!file) {
      setStatus('Upload your resume PDF to get started.');
      return;
    }

    const body = new FormData();
    body.append('resume', file);
    setBusy(true);
    setStatus('Uploading and parsing your resume...');
    setParseWarnings([]);

    const response = await fetch('/api/profile/upload', { method: 'POST', body });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setStatus(payload.error || 'Resume parsing failed.');
      return;
    }

    const parsed = payload.parsed;
    setForm((current) => ({
      ...current,
      name: parsed.name ?? current.name,
      email: parsed.email ?? current.email,
      phone: parsed.phone ?? current.phone,
      location: parsed.location ?? current.location,
      summary: parsed.summary ?? current.summary,
      skills: parsed.skills.join(', ') || current.skills,
      linkedinUrl: parsed.linkedinUrl ?? current.linkedinUrl,
      githubUrl: parsed.githubUrl ?? current.githubUrl,
      portfolioUrl: parsed.portfolioUrl ?? current.portfolioUrl
    }));
    setParseWarnings(parsed.warnings ?? []);
    setStatus(
      payload.parseStatus === 'success'
        ? 'Resume parsed and profile draft saved successfully.'
        : 'Resume parsed partially. Review and edit the extracted fields below.'
    );
  }

  async function handleSave() {
    setBusy(true);
    setStatus('Saving profile...');

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        summary: form.summary,
        skills: splitCsv(form.skills),
        targetTitles: splitCsv(form.targetTitles),
        linkedinUrl: form.linkedinUrl,
        githubUrl: form.githubUrl,
        portfolioUrl: form.portfolioUrl
      })
    });

    setBusy(false);
    setStatus(response.ok ? 'Profile saved. You are ready to ingest jobs.' : 'Could not save profile. Please review your entries.');
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Upload your resume</h3>
          <p className="text-sm text-slate-300">
            Upload a text-based PDF resume to extract your profile. If parsing misses anything, edit the fields below.
          </p>
        </div>
        <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button disabled={busy} type="button" onClick={handleUpload} className="rounded bg-brand px-4 py-2 text-sm font-medium disabled:opacity-60">
          {busy ? 'Working...' : 'Parse resume PDF'}
        </button>
        {status ? <p className="rounded border border-slate-700 bg-slate-800 p-3 text-sm text-slate-200">{status}</p> : null}
        {parseWarnings.length ? (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <p className="font-medium">Review these extracted fields:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {parseWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Profile readiness</h3>
            <p className="text-sm text-slate-300">A complete profile improves job fit scoring.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-teal-300">{profileCompleteness}%</p>
            <p className="text-xs text-slate-400">complete</p>
          </div>
        </div>
        <label className="block text-sm">Full name<input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Email<input value={form.email} onChange={(e) => updateField('email', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Phone<input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Location<input value={form.location} onChange={(e) => updateField('location', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Professional summary<textarea value={form.summary} onChange={(e) => updateField('summary', e.target.value)} className="mt-1 min-h-28 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Skills (comma-separated)<input value={form.skills} onChange={(e) => updateField('skills', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Target job titles (comma-separated)<input value={form.targetTitles} onChange={(e) => updateField('targetTitles', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">LinkedIn URL<input value={form.linkedinUrl} onChange={(e) => updateField('linkedinUrl', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">GitHub URL<input value={form.githubUrl} onChange={(e) => updateField('githubUrl', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <label className="block text-sm">Portfolio URL<input value={form.portfolioUrl} onChange={(e) => updateField('portfolioUrl', e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" /></label>
        <button disabled={busy} type="button" onClick={handleSave} className="rounded bg-brand px-4 py-2 text-sm font-medium disabled:opacity-60">
          Save profile
        </button>
      </div>
    </div>
  );
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
