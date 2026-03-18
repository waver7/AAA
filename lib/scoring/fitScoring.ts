import type { IngestedJob } from '@/lib/jobs/types';

export type CandidateProfile = {
  preferredLocations: string[];
  requiredSkills: string[];
  salaryTarget?: number;
  remotePreference?: 'remote' | 'hybrid' | 'onsite';
};

export type FitScoreResult = {
  score: number;
  explanation: {
    matchingSkills: string[];
    missingSkills: string[];
    concerns: string[];
    pitch: string;
    mismatchNotes: string[];
  };
};

function parseSalary(compensation?: string): number | null {
  if (!compensation) return null;
  const numeric = compensation.match(/\d{2,3}[,\d]{0,6}/g);
  if (!numeric?.length) return null;
  return Number(numeric[0].replace(/,/g, ''));
}

export function scoreJobFit(job: IngestedJob, profile: CandidateProfile): FitScoreResult {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const matchingSkills = profile.requiredSkills.filter((skill) => text.includes(skill.toLowerCase()));
  const missingSkills = profile.requiredSkills.filter((skill) => !matchingSkills.includes(skill));
  const skillScore =
    profile.requiredSkills.length === 0 ? 50 : Math.round((matchingSkills.length / profile.requiredSkills.length) * 70);

  let preferenceScore = 30;
  const concerns: string[] = [];
  const mismatchNotes: string[] = [];

  if (
    profile.preferredLocations.length > 0 &&
    !profile.preferredLocations.some((loc) => job.location.toLowerCase().includes(loc.toLowerCase()))
  ) {
    preferenceScore -= 15;
    concerns.push('Location mismatch with preferred locations.');
    mismatchNotes.push(`Preferred locations: ${profile.preferredLocations.join(', ')} | Job location: ${job.location}`);
  }

  const parsedSalary = parseSalary(job.compensation);
  if (profile.salaryTarget && parsedSalary && parsedSalary < profile.salaryTarget) {
    preferenceScore -= 10;
    concerns.push('Compensation appears below target.');
    mismatchNotes.push(`Salary target $${profile.salaryTarget.toLocaleString()} vs listed ~$${parsedSalary.toLocaleString()}`);
  }

  const score = Math.max(0, Math.min(100, skillScore + preferenceScore));
  const pitch =
    matchingSkills.length > 0
      ? `Strong fit driven by ${matchingSkills.slice(0, 3).join(', ')} and relevant role alignment.`
      : 'Potential fit, but this role may need a deeper resume customization pass before applying.';

  return { score, explanation: { matchingSkills, missingSkills, concerns, pitch, mismatchNotes } };
}
