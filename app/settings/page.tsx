import { env, isDemoMode } from '@/lib/validation/env';

export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings & workflow status</h2>
      <div className="card space-y-2 text-sm text-slate-300">
        <p>AI provider: {process.env.OPENAI_API_KEY ? 'Configured' : isDemoMode() ? 'Demo fallback mode' : 'Missing API key'}</p>
        <p>Automation: {env.ENABLE_AUTOMATION === 'true' ? 'Enabled (preparation only)' : 'Disabled'}</p>
        <p>Supported job sources: Greenhouse and Lever</p>
        <p>Healthcheck: <code>/api/health</code></p>
      </div>
    </section>
  );
}
