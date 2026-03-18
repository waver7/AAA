'use client';

import { useRouter } from 'next/navigation';
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

type Feedback = {
  type: 'idle' | 'info' | 'success' | 'error';
  title: string;
  detail?: string;
  items?: string[];
};

export function OnboardingForm({ initial }: OnboardingFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving' | 'success' | 'error'>('idle');
  const [resumeParsed, setResumeParsed] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: 'idle', title: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
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

  async function uploadResumeIfNeeded() {
    if (!file || resumeParsed) return true;

    const body = new FormData();
    body.append('resume', file);
    setPhase('uploading');
    setFeedback({ type: 'info', title: 'Uploading and parsing your resume…' });
    console.info('[onboarding] resume upload started', { filename: file.name, size: file.size });

    try {
      const response = await fetch('/api/profile/upload', { method: 'POST', body });
      const payload = await response.json();

      if (!response.ok) {
        console.error('[onboarding] resume upload failed', payload);
        setPhase('error');
        setFeedback({
          type: 'error',
          title: payload.error || 'Resume parsing failed.',
          detail: payload.detail,
          items: payload.fieldErrors ? flattenFieldErrors(payload.fieldErrors) : undefined
        });
        return false;
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
      setResumeParsed(true);
      setFeedback({
        type: payload.parseStatus === 'success' ? 'success' : 'info',
        title: payload.message || 'Resume parsed.',
        items: parsed.warnings ?? []
      });
      console.info('[onboarding] resume upload succeeded', { parseStatus: payload.parseStatus });
      return true;
    } catch (error) {
      console.error('[onboarding] resume upload threw', error);
      const message = error instanceof Error ? error.message : 'Unexpected upload failure.';
      setPhase('error');
      setFeedback({
        type: 'error',
        title: 'We could not upload your resume.',
        detail: `${message} Please try again with a text-based PDF or save your profile manually.`
      });
      return false;
    }
  }

  async function handleSave() {
    setBusy(true);
    setFormErrors({});
    console.info('[onboarding] save started');

    if (!splitCsv(form.targetTitles).length) {
      setBusy(false);
      setPhase('error');
      setFeedback({
        type: 'error',
        title: 'Add at least one target role before saving.',
        detail: 'Example: Senior Software Engineer, Backend Engineer, Staff Engineer.'
      });
      return;
    }

    const uploaded = await uploadResumeIfNeeded();
    if (!uploaded) {
      setBusy(false);
      return;
    }

    setPhase('saving');
    setFeedback({ type: 'info', title: 'Saving your profile…' });

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizeOptional(form.name),
          email: normalizeOptional(form.email),
          phone: normalizeOptional(form.phone),
          location: normalizeOptional(form.location),
          summary: normalizeOptional(form.summary),
          skills: splitCsv(form.skills),
          targetTitles: splitCsv(form.targetTitles),
          linkedinUrl: normalizeOptional(form.linkedinUrl),
          githubUrl: normalizeOptional(form.githubUrl),
          portfolioUrl: normalizeOptional(form.portfolioUrl)
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        console.error('[onboarding] profile save failed', payload);
        setFormErrors(payload.fieldErrors ?? {});
        setPhase('error');
        setFeedback({
          type: 'error',
          title: payload.error || 'Could not save profile.',
          detail: payload.detail,
          items: payload.fieldErrors ? flattenFieldErrors(payload.fieldErrors) : undefined
        });
        setBusy(false);
        return;
      }

      console.info('[onboarding] profile save succeeded');
      setPhase('success');
      setFeedback({
        type: 'success',
        title: 'Profile saved successfully.',
        detail: 'Redirecting you to the jobs dashboard…'
      });
      setBusy(false);
      window.setTimeout(() => router.push('/jobs'), 900);
    } catch (error) {
      console.error('[onboarding] profile save threw', error);
      const message = error instanceof Error ? error.message : 'Unexpected save failure.';
      setPhase('error');
      setFeedback({
        type: 'error',
        title: 'We could not save your profile.',
        detail: `${message} Please try again. If the problem continues, refresh the page and retry.`
      });
      setBusy(false);
    }
  }

  async function handleUploadPreview() {
    setBusy(true);
    await uploadResumeIfNeeded();
    setBusy(false);
  }

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const statusLabel =
    phase === 'uploading' ? 'Uploading & parsing…' : phase === 'saving' ? 'Saving…' : phase === 'success' ? 'Saved' : 'Save profile';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Upload your resume</h3>
          <p className="text-sm text-slate-300">
            Upload a text-based PDF resume to extract your profile. Clicking “Save profile” will also upload and parse the selected file automatically.
          </p>
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResumeParsed(false);
            setFeedback({ type: 'idle', title: '' });
          }}
        />
        {file ? <p className="text-xs text-slate-400">Selected file: {file.name}</p> : null}
        <button
          disabled={busy || !file}
          type="button"
          onClick={handleUploadPreview}
          className="rounded border border-slate-700 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {busy && phase === 'uploading' ? 'Parsing…' : 'Preview parsed fields'}
        </button>

        <FeedbackBanner feedback={feedback} />
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
        <Field label="Full name" value={form.name} onChange={(value) => updateField('name', value)} errors={formErrors.name} />
        <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} errors={formErrors.email} />
        <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} errors={formErrors.phone} />
        <Field label="Location" value={form.location} onChange={(value) => updateField('location', value)} errors={formErrors.location} />
        <label className="block text-sm">
          Professional summary
          <textarea value={form.summary} onChange={(e) => updateField('summary', e.target.value)} className="mt-1 min-h-28 w-full rounded border border-slate-700 bg-slate-800 p-2" />
        </label>
        <Field label="Skills (comma-separated)" value={form.skills} onChange={(value) => updateField('skills', value)} errors={formErrors.skills} />
        <Field
          label="Target job titles (comma-separated)"
          value={form.targetTitles}
          onChange={(value) => updateField('targetTitles', value)}
          errors={formErrors.targetTitles}
        />
        <Field label="LinkedIn URL" value={form.linkedinUrl} onChange={(value) => updateField('linkedinUrl', value)} errors={formErrors.linkedinUrl} />
        <Field label="GitHub URL" value={form.githubUrl} onChange={(value) => updateField('githubUrl', value)} errors={formErrors.githubUrl} />
        <Field label="Portfolio URL" value={form.portfolioUrl} onChange={(value) => updateField('portfolioUrl', value)} errors={formErrors.portfolioUrl} />
        <button disabled={busy} type="button" onClick={handleSave} className="rounded bg-brand px-4 py-2 text-sm font-medium disabled:opacity-60">
          {busy ? statusLabel : 'Save profile'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, errors }: { label: string; value: string; onChange: (value: string) => void; errors?: string[] }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2" />
      {errors?.length ? <span className="mt-1 block text-xs text-rose-300">{errors.join(', ')}</span> : null}
    </label>
  );
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (feedback.type === 'idle' || !feedback.title) return null;
  const tone =
    feedback.type === 'success'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
      : feedback.type === 'error'
        ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
        : 'border-sky-500/30 bg-sky-500/10 text-sky-100';

  return (
    <div className={`rounded border p-3 text-sm ${tone}`}>
      <p className="font-medium">{feedback.title}</p>
      {feedback.detail ? <p className="mt-1">{feedback.detail}</p> : null}
      {feedback.items?.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {feedback.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function flattenFieldErrors(fieldErrors: Record<string, string[] | undefined>) {
  return Object.entries(fieldErrors).flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`));
}
