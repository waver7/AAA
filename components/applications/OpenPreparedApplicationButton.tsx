'use client';

import { useState } from 'react';
import { isAutofillExtensionAvailable, requestExtensionAutofill } from '@/lib/browserExtension/autofillBridge';

type OpenPreparedApplicationButtonProps = {
  applicationId: string;
  resumeReady: boolean;
  prefillSummary: string;
};

export function OpenPreparedApplicationButton({ applicationId, resumeReady, prefillSummary }: OpenPreparedApplicationButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [prepDetails, setPrepDetails] = useState<{
    targetUrl: string;
    checklist: string[];
    warnings: string[];
    contactFields: Array<{ label: string; value: string }>;
    profileFields: Array<{ label: string; value: string }>;
    applicantDetailsText: string;
    automationFields: Record<string, string>;
    resume: { ready: boolean; filename?: string; note: string; automationUploadReady: boolean };
    prefillSummary: string;
    prefillSupport: 'best_effort' | 'copy_assist';
    visibleBrowserPrefill: boolean;
  } | null>(null);
  const [automationSteps, setAutomationSteps] = useState<string[]>([]);

  async function handleOpen() {
    setBusy(true);
    setMessage('');
    const prepWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    renderPreparationWindow(prepWindow, 'Opening prepared application…');

    try {
      const response = await fetch('/api/applications/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      const payload = await response.json();
      setBusy(false);

      if (!response.ok) {
        renderPreparationError(prepWindow, payload.error || 'Unable to open and prepare this application.');
        setMessage(payload.error || 'Unable to open and prepare this application.');
        return;
      }

      setPrepDetails(payload.browserPrep);
      setAutomationSteps(payload.automationResult?.steps ?? []);
      const extensionAvailable = await isAutofillExtensionAvailable();
      const copied = await safeCopyToClipboard(payload.browserPrep.applicantDetailsText);

      if (prepWindow) {
        prepWindow.location.href = payload.browserPrep.targetUrl;
      } else {
        window.open(payload.browserPrep.targetUrl, '_blank', 'noopener,noreferrer');
      }

      const automationNote = payload.automationResult
        ? ' A separate server-side automation preview also ran for supported fields.'
        : payload.automationError
          ? ` Automation fallback: ${payload.automationError}`
          : '';
      if (extensionAvailable) {
        const extensionResult = await safeRequestExtensionAutofill({
          targetUrl: payload.browserPrep.targetUrl,
          fields: payload.browserPrep.automationFields
        });
        if (extensionResult.accepted) {
          setMessage(`Opened the application in a new tab${copied ? ', copied your saved applicant details,' : ''} and requested visible autofill through the AutoApply browser extension.${automationNote}`);
        } else {
          setMessage(`Opened the application in a new tab${copied ? ' and copied your saved applicant details for paste' : ''}. The extension did not accept the autofill request.${automationNote}`);
        }
      } else {
        setMessage(`Opened the application in a new tab${copied ? ' and copied your saved applicant details for paste' : ''}. Install the optional AutoApply browser extension for visible autofill in the opened page.${automationNote}`);
      }
    } catch (error) {
      setBusy(false);
      const message = error instanceof Error ? error.message : 'Unable to open and prepare this application.';
      renderPreparationError(prepWindow, message);
      setMessage(message);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleOpen}
        disabled={busy}
        className="w-full rounded bg-brand px-3 py-2 text-left text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? 'Opening…' : 'Open and prepare'}
      </button>
      <p className="text-[11px] text-slate-400">{resumeReady ? 'Resume ready' : 'Resume missing'} • {prefillSummary}</p>
      {message ? <p className="text-[11px] text-slate-300">{message}</p> : null}
      {prepDetails ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-[11px] text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-slate-100">Latest preparation result</p>
            <a href={prepDetails.targetUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300">
              Open posting
            </a>
          </div>
          <p className="mt-1 text-slate-400">{prepDetails.prefillSummary}</p>
          {!prepDetails.visibleBrowserPrefill ? (
            <p className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-amber-100">
              If you want the opened page itself to show filled fields, install the optional AutoApply browser extension from `browser-extension/`. Without it, use the copied details below to paste quickly.
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-300">
            <span className="rounded-full border border-slate-700 px-2 py-1">Prefill: {prepDetails.prefillSupport === 'best_effort' ? 'Best effort' : 'Copy assist'}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1">Resume: {prepDetails.resume.ready ? prepDetails.resume.filename ?? 'Ready' : 'Missing'}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1">Automation upload: {prepDetails.resume.automationUploadReady ? 'Available' : 'Manual / unavailable'}</span>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <MiniList title="Contact" items={prepDetails.contactFields.map((item) => `${item.label}: ${item.value}`)} />
            <MiniList title="Profile" items={prepDetails.profileFields.map((item) => `${item.label}: ${item.value}`)} />
            <MiniList title="Checklist" items={prepDetails.checklist} />
            <MiniList title="Warnings" items={[prepDetails.resume.note, ...prepDetails.warnings]} emptyLabel="Nothing missing." />
          </div>
          {automationSteps.length ? <MiniList title="Automation results" items={automationSteps} className="mt-3" /> : null}
        </div>
      ) : null}
    </div>
  );
}

async function safeCopyToClipboard(value: string) {
  if (!value || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

async function safeRequestExtensionAutofill(input: { targetUrl: string; fields: Record<string, string> }) {
  try {
    return await requestExtensionAutofill(input);
  } catch {
    return { accepted: false, reason: 'bridge_error' };
  }
}

function renderPreparationWindow(target: Window | null, title: string) {
  if (!target) return;
  try {
    target.document.title = title;
    target.document.body.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 24px; color: #e2e8f0; background: #020617;">
        <h1 style="font-size: 18px; margin: 0 0 12px;">${title}</h1>
        <p style="margin: 0; color: #94a3b8;">Please wait while AutoApply AI opens your prepared application.</p>
      </div>
    `;
  } catch {}
}

function renderPreparationError(target: Window | null, message: string) {
  if (!target) return;
  try {
    target.document.title = 'Prepared application failed';
    target.document.body.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 24px; color: #e2e8f0; background: #020617;">
        <h1 style="font-size: 18px; margin: 0 0 12px;">Prepared application failed</h1>
        <p style="margin: 0 0 12px; color: #fca5a5;">${message}</p>
        <p style="margin: 0; color: #94a3b8;">You can close this tab and try again from AutoApply AI.</p>
      </div>
    `;
  } catch {}
}

function MiniList({ title, items, emptyLabel = 'Nothing to show.', className = '' }: { title: string; items: string[]; emptyLabel?: string; className?: string }) {
  const filtered = items.filter(Boolean);
  return (
    <div className={`rounded border border-slate-800 p-2 ${className}`}>
      <p className="font-medium text-slate-100">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-300">
        {filtered.length ? filtered.map((item) => <li key={item}>{item}</li>) : <li>{emptyLabel}</li>}
      </ul>
    </div>
  );
}
