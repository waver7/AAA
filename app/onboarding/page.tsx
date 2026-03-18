import { OnboardingForm } from '@/components/OnboardingForm';
import { getCurrentProfile } from '@/lib/profile/profileService';

export default async function OnboardingPage() {
  try {
    const { user, profile } = await getCurrentProfile();

    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Profile setup</h2>
          <p className="max-w-2xl text-slate-300">
            Upload your resume to build a real profile for job matching. If parsing misses anything, review and edit the extracted fields before continuing.
          </p>
          <p className="text-xs text-slate-500">Current local user: {user.email}</p>
        </div>

        <OnboardingForm
          initial={{
            name: user.name,
            email: user.email,
            phone: profile?.phone,
            location: profile?.location,
            summary: profile?.summary,
            skills: profile?.skills ?? [],
            targetTitles: profile?.targetTitles ?? [],
            linkedinUrl: profile?.linkedinUrl,
            githubUrl: profile?.githubUrl,
            portfolioUrl: profile?.portfolioUrl
          }}
        />
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load onboarding.';
    return (
      <section className="space-y-4">
        <div className="card space-y-3 border border-amber-500/40 bg-amber-500/10 text-amber-50">
          <h2 className="text-2xl font-semibold">Onboarding needs a local database refresh</h2>
          <p>{message}</p>
          <div className="rounded bg-slate-950/40 p-3 font-mono text-sm">
            <p>npm run db:push</p>
            <p>npm run dev</p>
          </div>
          <p className="text-sm text-amber-100">If your dev server is already running, stop it, run the commands above, then restart the app.</p>
        </div>
      </section>
    );
  }
}
