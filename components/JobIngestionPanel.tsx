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
    setStatus('Fetching jobs from the provided source...');

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
    setStatus(`Imported ${payload.count} ${payload.adapter} jobs successfully.`);
    router.refresh();
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Ingest real jobs</h3>
        <p className="text-sm text-slate-300">Paste a supported Greenhouse board URL or Lever jobs URL to fetch live job listings.</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://boards.greenhouse.io/company or https://jobs.lever.co/company"
          className="flex-1 rounded border border-slate-700 bg-slate-800 p-2 text-sm"
        />
        <button disabled={busy || !url} type="button" onClick={() => handleIngest()} className="rounded bg-brand px-4 py-2 text-sm font-medium disabled:opacity-60">
          {busy ? 'Ingesting…' : 'Ingest jobs'}
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
      <p className="text-xs text-slate-500">Supported sources today: Greenhouse and Lever. Generic careers scraping is still planned.</p>
    </div>
  );
}
