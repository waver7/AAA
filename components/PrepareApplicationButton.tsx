'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type BrowserPreparationPacket = {
  targetUrl: string;
  contactFields: Array<{ label: string; value: string }>;
  profileFields: Array<{ label: string; value: string }>;
  checklist: string[];
  warnings: string[];
};

export function PrepareApplicationButton({ jobPostingId, existing }: { jobPostingId: string; existing: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [browserPrep, setBrowserPrep] = useState<BrowserPreparationPacket | null>(null);
  const applicantCopy = useMemo(
    () =>
      browserPrep
        ? [...browserPrep.contactFields, ...browserPrep.profileFields]
            .map((entry) => `${entry.label}: ${entry.value}`)
            .join('\n')
        : '',
    [browserPrep]
  );

  async function handlePrepare() {
    setBusy(true);
    setMessage('');
    const prepWindow = typeof window !== 'undefined' ? window.open('', '_blank', 'noopener,noreferrer') : null;

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
      setMessage('Application prepared. We opened the original posting in a new tab and assembled your browser-ready application packet below.');
      if (prepWindow) {
        prepWindow.location.href = payload.browserPrep.targetUrl;
      } else {
        window.open(payload.browserPrep.targetUrl, '_blank', 'noopener,noreferrer');
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
              <p className="mt-1 text-xs text-slate-400">Open and finish the application in your own browser session. AutoApply AI never submits on your behalf.</p>
            </div>
            <a href={browserPrep.targetUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300">
              Re-open posting
            </a>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FieldList title="Contact details" items={browserPrep.contactFields} />
            <FieldList title="Profile details" items={browserPrep.profileFields} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Checklist title="Before you submit" items={browserPrep.checklist} />
            <Checklist title="Missing info to add later" items={browserPrep.warnings} emptyLabel="Your profile already covers the common application fields." />
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
  return (
    <div className="rounded-lg border border-slate-800 p-3">
      <p className="mb-2 font-medium text-slate-100">{title}</p>
      <ul className="list-disc space-y-2 pl-5 text-xs text-slate-300 sm:text-sm">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyLabel}</li>}
      </ul>
    </div>
  );
}
