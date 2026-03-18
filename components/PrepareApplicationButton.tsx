'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PrepareApplicationButton({ jobPostingId, existing }: { jobPostingId: string; existing: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handlePrepare() {
    setBusy(true);
    const response = await fetch('/api/applications/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobPostingId })
    });
    const payload = await response.json();
    setBusy(false);
    setMessage(response.ok ? 'Application moved to Prepared in the pipeline.' : payload.error || 'Could not prepare application.');
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-2">
      <button type="button" disabled={busy} onClick={handlePrepare} className="rounded bg-brand px-4 py-2 text-sm disabled:opacity-60">
        {busy ? 'Preparing…' : existing ? 'Update prepared application' : 'Prepare application'}
      </button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
