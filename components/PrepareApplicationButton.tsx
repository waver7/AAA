'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { isAutofillExtensionAvailable, requestExtensionAutofill } from '@/lib/browserExtension/autofillBridge';

type BrowserPreparationPacket = {
  targetUrl: string;
  contactFields: Array<{ label: string; value: string }>;
  profileFields: Array<{ label: string; value: string }>;
  applicantDetailsText: string;
  automationFields: Record<string, string>;
  checklist: string[];
  warnings: string[];
  prefillSummary: string;
  prefillSupport: 'best_effort' | 'copy_assist';
  visibleBrowserPrefill: boolean;
  resume: {
    ready: boolean;
    filename?: string;
    note: string;
    automationUploadReady: boolean;
  };
};

export function PrepareApplicationButton({ jobPostingId, existing }: { jobPostingId: string; existing: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [browserPrep, setBrowserPrep] = useState<BrowserPreparationPacket | null>(null);
  const applicantCopy = useMemo(() => browserPrep?.applicantDetailsText ?? '', [browserPrep]);

  async function handlePrepare() {
    setBusy(true);
    setMessage('');
    const prepWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;

    try {
      const response = await fetch('/api/applications/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPostingId })
      });
      const payload = await response.json();
      setBusy(false);

      if (!response.ok) {
        prepWindow?.close();
        setMessage(payload.error || 'Could not prepare application.');
        return;
      }

      setBrowserPrep(payload.browserPrep);
      const extensionAvailable = await isAutofillExtensionAvailable();
      if (payload.browserPrep.applicantDetailsText && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload.browserPrep.applicantDetailsText);
      }
      if (prepWindow) {
        prepWindow.location.href = payload.browserPrep.targetUrl;
      } else {
        window.open(payload.browserPrep.targetUrl, '_blank', 'noopener,noreferrer');
      }

      if (extensionAvailable) {
        const extensionResult = await requestExtensionAutofill({
          targetUrl: payload.browserPrep.targetUrl,
          fields: payload.browserPrep.automationFields
        });
        if (extensionResult.accepted) {
          setMessage('Application prepared. We opened the posting, copied your saved applicant details, and requested visible autofill in the new tab through the AutoApply browser extension.');
        } else {
          setMessage('Application prepared. We opened the posting and copied your saved applicant details. The browser extension did not accept the autofill request, so use paste fallback if needed.');
        }
      } else if (payload.browserPrep.applicantDetailsText) {
        setMessage('Application prepared. We opened the posting and copied your saved applicant details so you can paste them into the external form. Install the optional AutoApply browser extension for visible autofill in the opened page.');
      } else {
        setMessage('Application prepared. We opened the posting and assembled your browser-ready application packet below.');
      }
      router.refresh();
    } catch (error) {
      prepWindow?.close();
      setBusy(false);
      setMessage(error instanceof Error ? error.message : 'Could not prepare application.');
    }
  }

  async function handleCopy() {
    if (!applicantCopy) return;
    await navigator.clipboard.writeText(applicantCopy);
    setMessage('Copied your applicant details for quick paste into the external application form.');
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={handlePrepare} className="rounded bg-brand px-4 py-2 text-sm disabled:opacity-60">
          {busy ? 'Preparing…' : existing ? 'Refresh browser prep' : 'Prepare in browser'}
        </button>
        {browserPrep ? (
          <button type="button" onClick={handleCopy} className="rounded border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
            Copy applicant details
          </button>
        ) : null}
      </div>

      {message ? <p className="text-xs text-slate-400">{message}</p> : null}

      {browserPrep ? (
        <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-100">External browser handoff</p>
              <p className="mt-1 text-xs text-slate-400">{browserPrep.prefillSummary}</p>
            </div>
            <a href={browserPrep.targetUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300">
              Re-open posting
            </a>
          </div>

          {!browserPrep.visibleBrowserPrefill ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
              Want the opened page itself to show filled fields? Install the optional AutoApply browser extension from `browser-extension/`. Without it, this flow falls back to copied applicant details for quick paste.
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-slate-700 px-2 py-1">Prefill: {browserPrep.prefillSupport === 'best_effort' ? 'Best effort' : 'Copy assist'}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1">Resume: {browserPrep.resume.ready ? browserPrep.resume.filename ?? 'Ready' : 'Missing'}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1">Automation upload: {browserPrep.resume.automationUploadReady ? 'Available' : 'Manual / unavailable'}</span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FieldList title="Contact details" items={browserPrep.contactFields} />
            <FieldList title="Profile details" items={browserPrep.profileFields} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Checklist title="Before you submit" items={browserPrep.checklist} />
            <Checklist title="Missing info to add later" items={[browserPrep.resume.note, ...browserPrep.warnings]} emptyLabel="Your profile already covers the common application fields." />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <div className="rounded-lg border border-slate-800 p-3">
      <p className="mb-2 font-medium text-slate-100">{title}</p>
      <dl className="space-y-2 text-xs sm:text-sm">
        {items.length ? (
          items.map((item) => (
            <div key={item.label}>
              <dt className="text-slate-400">{item.label}</dt>
              <dd className="break-words text-slate-200">{item.value}</dd>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No saved values yet.</p>
        )}
      </dl>
    </div>
  );
}

function Checklist({ title, items, emptyLabel = 'Nothing to show.' }: { title: string; items: string[]; emptyLabel?: string }) {
  const filtered = items.filter(Boolean);
  return (
    <div className="rounded-lg border border-slate-800 p-3">
      <p className="mb-2 font-medium text-slate-100">{title}</p>
      <ul className="list-disc space-y-2 pl-5 text-xs text-slate-300 sm:text-sm">
        {filtered.length ? filtered.map((item) => <li key={item}>{item}</li>) : <li>{emptyLabel}</li>}
      </ul>
    </div>
  );
}
