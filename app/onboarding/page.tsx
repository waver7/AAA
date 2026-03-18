import { OnboardingForm } from '@/components/OnboardingForm';
import { getCurrentProfile } from '@/lib/profile/profileService';

export default async function OnboardingPage() {
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
}
