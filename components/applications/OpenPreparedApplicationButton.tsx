'use client';

import { useState } from 'react';

type OpenPreparedApplicationButtonProps = {
  applicationId: string;
  resumeReady: boolean;
  prefillSummary: string;
};

export function OpenPreparedApplicationButton({ applicationId, resumeReady, prefillSummary }: OpenPreparedApplicationButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleOpen() {
    setBusy(true);
    setMessage('');
    const prepWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;

    try {
      const response = await fetch('/api/applications/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      const payload = await response.json();
      setBusy(false);

      if (!response.ok) {
        prepWindow?.close();
        setMessage(payload.error || 'Unable to open and prepare this application.');
        return;
      }

      if (prepWindow) {
        prepWindow.location.href = payload.browserPrep.targetUrl;
      } else {
        window.open(payload.browserPrep.targetUrl, '_blank', 'noopener,noreferrer');
      }

      const automationNote = payload.automationResult
        ? ' Best-effort automation also ran in a separate prep session for supported fields.'
        : payload.automationError
          ? ` Automation fallback: ${payload.automationError}`
          : '';
      setMessage(`Opened the application in a new tab. ${payload.browserPrep.prefillSummary}${automationNote}`);
    } catch (error) {
      prepWindow?.close();
      setBusy(false);
      setMessage(error instanceof Error ? error.message : 'Unable to open and prepare this application.');
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
    </div>
  );
}
