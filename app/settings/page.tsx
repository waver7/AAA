export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings & integrations</h2>
      <div className="card space-y-2 text-sm text-slate-300">
        <p>Automation mode: preparation only (final submit always requires explicit human confirmation).</p>
        <p>Playwright is optional. Install it only if you plan to use browser automation.</p>
        <p>Healthcheck: <code>/api/health</code></p>
      </div>
    </section>
  );
}
