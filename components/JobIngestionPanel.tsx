'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function JobIngestionPanel({
  suggestedBoards = []
}: {
  suggestedBoards?: Array<{ company: string; url: string; sourceType: string }>;
}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleIngest(targetUrl = url) {
    setBusy(true);
    setStatus('Scanning the source and keeping only remote roles...');

    const response = await fetch('/api/jobs/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setStatus(payload.error || 'Unable to ingest jobs from this URL.');
      return;
    }

    setUrl(targetUrl);
    const filteredNote = payload.filteredOut ? ` Filtered out ${payload.filteredOut} non-remote roles.` : '';
    setStatus(`Imported ${payload.count} remote jobs from ${payload.adapter}.${filteredNote}`);
    router.refresh();
  }

  return (
    <div className="card space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">Remote job discovery</h3>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] uppercase tracking-wide text-emerald-200">Remote only</span>
        </div>
        <p className="text-sm text-slate-300">Paste a supported Greenhouse, Lever, Ashby, or Workable jobs URL. We import remote roles only and hide hybrid/on-site results by default.</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://boards.greenhouse.io/company • https://jobs.lever.co/company • https://jobs.ashbyhq.com/company • https://apply.workable.com/company"
          className="flex-1 rounded border border-slate-700 bg-slate-800 p-2 text-sm"
        />
        <button disabled={busy || !url} type="button" onClick={() => handleIngest()} className="rounded bg-brand px-4 py-2 text-sm font-medium disabled:opacity-60">
          {busy ? 'Importing…' : 'Import remote jobs'}
        </button>
      </div>
      {suggestedBoards.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Quick start with recommended boards</p>
          <div className="flex flex-wrap gap-2">
            {suggestedBoards.map((board) => (
              <button
                key={board.url}
                type="button"
                disabled={busy}
                onClick={() => {
                  setUrl(board.url);
                  void handleIngest(board.url);
                }}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                {board.company} · {board.sourceType}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {status ? <p className="text-sm text-slate-300">{status}</p> : null}
      <p className="text-xs text-slate-500">Supported sources in this build: Greenhouse, Lever, Ashby public job boards, and Workable public account feeds. Remote classification uses explicit workplace metadata when available, then falls back to location/text inference.</p>
    </div>
  );
}
